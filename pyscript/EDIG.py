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



def main():
    # P2-A Load raw data
    #df_raw = pd.read_csv(r"C:/users/someone/Desktop/CaseStudy2/user/user1/data/df_raw")

    # P2-B Prepare raw data with OUTPUT from the prev day 
    user = "user1_*" # username in SHA512 
    with open(glob.glob('../history/user1_*/history.json')[0], 'r') as p:
        data = json.load(p)
    
    day = int(max(data))+1
    mid = np.empty_like((10,), dtype=int)
    for row in data[str(day-1)]:
        if row['model_type'] == 'EDIG':
            mid = np.append(mid, row['query_mid'])
    mid = mid[1:]
        
    # P2-C Load the model (day N-1) and pool data (day N-1) 
    learner = pickle.load(open(glob.glob('../model/user1_*/')[0]+"learner_EDIG_day{d}".format(d=day-1), "rb"))
    df_pool = pd.read_csv(glob.glob('../py_data/user1_*/')[0]+"df_pool_EDIG_day{d}.csv".format(d=day-1))
    y_pool = df_pool["target"]
    X_pool = df_pool.loc[:, df_pool.columns!="target"]


    ###########################################
    ## Interactive Labeling on the dashboard ##
    ###########################################


    # P2-D Load INPUT from JS (**change here, only showing sample arrays)
    label = [1, 0, 1, 0, 0]
    conf = [0.74, 0.8, 0.66, 0.85, 0.78] # Not using this in RB
    
    # P2-E Teach the model
    idx = X_pool.index[X_pool.mid.isin(mid)]
    learner.teach(X=X_pool.values[idx], y=pd.Series(label).values)
    
    # P2-F Move the 5 ins from pool data and append to a Labeled set (including label and conf)
    df_labeled = pd.read_csv(glob.glob('../py_data/user1_*/')[0]+"df_labeled_EDIG.csv")
    df_temp = X_pool[X_pool.mid.isin(mid)]
    df_temp['label'] = label
    df_temp['conf'] = conf
    df_labeled = pd.concat([df_labeled, df_temp], 0)
    
    
    # P2-H Update pool data
    df_pool = df_pool[~df_pool.mid.isin(idx)].iloc[:,:-1]
    
    
    # P2-G Generate query (new 10 ins) with from JS and labeled data
    conf_training = df_labeled["conf"]
    X_training = df_labeled.iloc[:, :-2]
    
    query_idx, query_ins = learner.query(df_pool.values, X_training.values, conf_training.values)
    query_mid = df_pool["mid"].iloc[query_idx]
    


    # P2-I Save everything
    df_labeled.to_csv(glob.glob('../py_data/user1_*/')[0]+"df_labeled_EDIG.csv", index=False)   
    
    pickle.dump(learner, open(glob.glob('../model/user1_*/')[0]+"learner_EDIG_day{d}".format(d=day), "wb"))
    
    df_pool.to_csv(glob.glob('../py_data/user1_*/')[0]+"df_labeled_EDIG.csv", index=False)
    
    # Saving query to history.json
    df_query = pd.DataFrame(dict(query_mid=query_mid)).reset_index(drop=True)
    df_query["day"] = day
    df_query["model_type"] = "EDIG"
    
    
    if int(max(data))==day-1:
        with open(glob.glob('../history/user1_*/history.json')[0]) as json_file:
            json_decoded = json.load(json_file)

        # Parse to JSON and save
        cols_as_dict = df_query.set_index('day').apply(dict, axis=1)
        combined = cols_as_dict#.groupby(cols_as_dict.index).apply(list)

        result = combined.to_json(orient="records")
        parsed = json.loads(result)
        
        json_decoded['1'] = parsed
        json_object = json.dumps(json_decoded, indent=4)
        
        with open(glob.glob('../history/user1_*/history.json')[0], "w") as outfile:
            outfile.write(json_object)
    
    else:
        with open(glob.glob('../history/user1_*/history.json')[0]) as json_file:
            json_decoded = json.load(json_file)
            
        temp = 0
        for row in json_decoded[str(day)]:
            if row['model_type'] == 'EDIG':
                temp = 1
        if temp == 0:
            df_query_EDIG = df_query.copy()
            mid = np.empty_like((10,), dtype=int)
            for row in json_decoded[str(day)]:
                if row['model_type'] == 'RB':
                    mid = np.append(mid, row['query_mid'])
            mid = mid[1:]
            df_query_RB = pd.DataFrame(dict(query_mid=mid)).reset_index(drop=True)
            df_query_RB["day"] = day
            df_query_RB["model_type"] = "RB"            
            
            # Shuffle
            df_query = pd.concat([df_query_RB, df_query_EDIG], 0).sample(frac=1).reset_index(drop=True)
            
            # Parse to JSON and save
            cols_as_dict = df_query.set_index('day').apply(dict, axis=1)
            combined = cols_as_dict#.groupby(cols_as_dict.index).apply(list)

            result = combined.to_json(orient="records")
            parsed = json.loads(result)
            
            json_decoded['1'] = parsed
            json_object = json.dumps(json_decoded, indent=4)
            
            with open(glob.glob('../history/user1_*/history.json')[0], "w") as outfile:
                outfile.write(json_object)
    
    
    df_query = pd.DataFrame(dict(query_idx=query_idx, query_mid=query_mid))
    df_query.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_query_EDIG_{u}_day{d}".format(u=user, d=day), index=False)
    
    df_label = pd.DataFrame(dict(label=label, conf=conf))
    df_label.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_label_EDIG_{u}_day{d}".format(u=user, d=day), index=False)
    
main()