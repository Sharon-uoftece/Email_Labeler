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
import warnings
warnings.filterwarnings("ignore")

def expert_derived_ig_query_strategy(classifier, X_pool, X_training, conf_training):   
    # measure the utility of each instance in the pool
    uncertainty = classifier_uncertainty(classifier, X_pool)
    
    distance_scores = pairwise_distances(X_pool, X_training, metric='cosine').min(axis=1)
    similarity_scores = 1 / (1 + distance_scores)
    
    cwds_ndarray = np.divide(pairwise_distances(X_pool, X_training, metric='cosine'),np.repeat(conf_training.reshape(conf_training.shape[0],1), len(X_training), axis=1))
    conf_weighted_distance_scores = cwds_ndarray[:,0:].min(axis=1)
    conf_weighted_similarity_scores = 1 / (1 + conf_weighted_distance_scores)

    alpha = len(X_pool)/len(X_raw)
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
    df_raw = pd.read_csv(r"C:/users/someone/Desktop/CaseStudy2/user/user1/data/df_raw")

    # P2-B Prepare raw data with OUTPUT from the prev day
    day = 2 # Day N
    user = "user1"
    mid = [11, 22, 33, 44, 55] # mid : message id, a list of query_mid from previous day
    #mid = pd.read_csv(r"C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_query_EDIG_{u}_day{d}".format(u=user, d=day-1))["query_mid"]
    df_js = df_raw[df_raw.mid.isin(mid)] ### Figure out how to send this to JS
    
    # P2-C Load the model (day N-1) and pool data (day N) 
    learner = pickle.load(open("C:/users/someone/Desktop/CaseStudy2/user/{u}/model/learner_EDIG_{u}_day{d}".format(u=user, d=day-1), "EDIG"))
    df_pool = pd.read_csv(r"C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_pool_EDIG_{u}_day{d}".format(u=user, d=day-1))
    y_pool = df_pool.loc["target"]
    X_pool = df_pool.loc[:, df_pool.columns!="target"]

    # P2-D Load INPUT from JS (**change here, only showing sample arrays)
    label = [1, 0, 1, 0, 0]
    conf = [0.74, 0.8, 0.66, 0.85, 0.78] # Not using this in RB
    
    # P2-E Teach the model
    idx = X_pool.index[X_pool.mid.isin(mid)]
    learner.teach(X=X_pool[idx], y=label)
    
    # P2-F Move the 5 ins from pool data and append to a Labeled set (including label and conf)
    df_labeled = pd.read_csv(r"C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_labeled_EDIG_{u}".format(u=user))
    df_labeled = pd.concat([df_labeled, pd.concat([X_pool[idx], label, conf], 1)], 0)
    
    # P2-G Generate query (new 10 ins) with from JS and labeled data
    conf_training = df_labeled["conf"]
    X_training = df_labeled.iloc[:, :-2]
    
    query_idx, query_ins = learner.query(X_pool, X_training, conf_training)
    query_mid = query_ins[["mid"]]
    
    # P2-H Update pool data
    df_pool = df_pool[~df_pool.mid.isin(idx)]

    # P2-I Save everything
    df_labeled.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_labeled_EDIG_{u}".format(u=user), index=False)   
    
    pickle.dump(learner, open("C:/users/someone/Desktop/CaseStudy2/user/{u}/model/learner_EDIG_{u}_day{d}".format(u=user, d=day), "wb"))
    
    df_pool.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_pool_EDIG_{u}_day{d}".format(u=user, d=day), index=False)
    
    df_query = pd.DataFrame(dict(query_idx=query_idx, query_mid=query_mid))
    df_query.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_query_EDIG_{u}_day{d}".format(u=user, d=day), index=False)
    
    df_label = pd.DataFrame(dict(label=label, conf=conf))
    df_label.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_label_EDIG_{u}_day{d}".format(u=user, d=day), index=False)
    
main()