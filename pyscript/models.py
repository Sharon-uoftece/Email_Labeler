#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import numpy as np
import pandas as pd
import random
from functools import partial
from modAL.batch import uncertainty_batch_sampling
from modAL.models import ActiveLearner
from modAL.uncertainty import classifier_uncertainty
from sklearn.metrics.pairwise import pairwise_distances
from sklearn.ensemble import RandomForestClassifier
import pickle
import json
import glob
import sys
import warnings
warnings.filterwarnings("ignore")

def expert_derived_ig_query_strategy(classifier, X_pool, X_training, conf_training):   
    # measure the utility of each instance in the pool
    uncertainty = classifier_uncertainty(classifier, X_pool)
    
    distance_scores = pairwise_distances(X_pool, X_training, metric='cosine').min(axis=1)
    similarity_scores = 1 / (1 + distance_scores)
    
    cwds_ndarray = np.divide(pairwise_distances(X_pool, X_training, metric='cosine'),np.repeat(conf_training.reshape(1, 5), len(X_pool), axis=1))
    conf_weighted_distance_scores = cwds_ndarray[:,0:].min(axis=1)
    conf_weighted_similarity_scores = 1 / (1 + conf_weighted_distance_scores)

    alpha = len(X_pool)/671
    beta = 0.9
    
    scores = alpha * uncertainty \
             + alpha * beta * conf_weighted_distance_scores \
             + (1 - alpha) * (1 - similarity_scores) * (1 - beta)
    

    # select the indices of the instances to be queried
    query_idx = np.argpartition(scores, -5)[-5:]

    # return the indices and the instances
    return query_idx, X_pool[query_idx]



def main(user, model_type):
 
    ### Read JS output (day N-1) ### 
    label = [1, 0, 1, 0, 0]
    conf = [0.74, 0.8, 0.66, 0.85, 0.78] # Not using this in RB
    
    with open(glob.glob('../history/{u}/history.json'.format(u=user))[0], 'r') as p: # read history day N-1
        data = json.load(p)
    
    day = int(max(data))+1 # find max day in history.json
    
    mid = np.empty_like((5,), dtype=int) # get mid to be used for AL model teaching
    for row in data[str(day-1)]:
        if row['model_type'] == model_type:
            mid = np.append(mid, row['query_mid'])
    mid = mid[1:]
    
    label = np.empty_like((5,), dtype=int) # get label to be used for AL model teaching
    for row in data[str(day-1)]:
        if row['model_type'] == model_type:
            label = np.append(label, row['query_mid'])
    label = label[1:]
    
    conf = np.empty_like((5,), dtype=int) # get conf to be used for AL model teaching
    for row in data[str(day-1)]:
        if row['model_type'] == model_type:
            conf = np.append(conf, row['query_mid'])
    conf = conf[1:]
        
    
    ### Load the model (day N-1) and pool data (day N-1) ###
    learner = pickle.load(open(glob.glob('../model/{u}/'.format(u=user))[0]+"learner_{m}_day{d}".format(m=model_type,d=day-1), "rb"))
    df_pool = pd.read_csv(glob.glob('../py_data/{u}/'.format(u=user))[0]+"df_pool_{m}_day{d}.csv".format(m=model_type,d=day-1))
    X_pool = df_pool.loc[:, df_pool.columns!="target"]
    
    
    ### Teach the model ###
    idx = X_pool.index[X_pool.mid.isin(mid)]
    learner.teach(X=X_pool.values[idx], y=pd.Series(label).values)
    
    
    ### Update labeled data (mainly for EDIG training) ###
    df_labeled = pd.read_csv(glob.glob('../py_data/{u}/'.format(u=user))[0]+"df_labeled_{m}.csv".format(m=model_type))
    df_temp = X_pool[X_pool.mid.isin(mid)]
    df_temp['label'] = label
    df_temp['conf'] = conf
    df_labeled = pd.concat([df_labeled, df_temp], 0)
    

    ### Update pool data (remove mid from pool day N in case of duplication in day N+1) ###
    df_pool = df_pool[~df_pool.mid.isin(idx)].iloc[:, df_pool.columns!="target"]
    
    
    ### Generate query (new 5 ins) for each model
    conf_training = df_labeled["conf"]
    X_training = df_labeled.iloc[:, :-2]
    
    if model_type == "EDIG":
        query_idx, query_ins = learner.query(df_pool.values, X_training.values, conf_training.values)
    else:
        query_idx, query_ins = learner.query(df_pool.values)
        
    query_mid = df_pool["mid"].iloc[query_idx]
    

    ### Save CSVs and model ###
    pickle.dump(learner, open(glob.glob('../model/{u}/'.format(u=user))[0]+"learner_{m}_day{d}".format(m=model_type,d=day), "wb"))
    df_pool.to_csv(glob.glob('../py_data/{u}/'.format(u=user))[0]+"df_pool_{m}_day{d}.csv".format(m=model_type,d=day))
    df_labeled.to_csv(glob.glob('../py_data/{u}/'.format(u=user))[0]+"df_labeled_{m}.csv".format(m=model_type), index=False)   
        
    
    # Saving query to history.json
    df_query = pd.DataFrame(dict(query_mid=query_mid)).reset_index(drop=True)
    df_query["day"] = day
    df_query["model_type"] = model_type
    
    return df_query

    
############
### main ###
############

# user = sys.argv[1] # use this when called from JS
user = "user1_*" # use this for testing
    
df_query_RB = main(user, "RB")
df_query_EDIG = main(user, "EDIG")

# Shuffle
df_query = pd.concat([df_query_RB, df_query_EDIG], 0).sample(frac=1).reset_index(drop=True)

# Parse to JSON and save
cols_as_dict = df_query.set_index('day').apply(dict, axis=1)
combined = cols_as_dict

result = combined.to_json(orient="records")
parsed = json.loads(result)

with open(glob.glob('../history/{u}/history.json'.format(u=user))[0]) as json_file:
    json_decoded = json.load(json_file)
    
json_decoded['1'] = parsed
json_object = json.dumps(json_decoded, indent=4)

with open(glob.glob('../history/{u}/history.json'.format(u=user))[0], "w") as outfile:
    outfile.write(json_object)
