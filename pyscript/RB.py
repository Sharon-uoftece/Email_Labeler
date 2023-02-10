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

def main():
    # P2-A Load raw data
    df_raw = pd.read_csv(r"C:/users/someone/Desktop/CaseStudy2/user/user1/data/df_raw")

    # P2-B Prepare raw data with OUTPUT from the prev day
    day = 2 # Day N
    user = "user1"
    mid = [11, 22, 33, 44, 55] # mid : message id, a list of query_mid from previous day
    #mid = pd.read_csv(r"C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_query_RB_{u}_day{d}".format(u=user, d=day-1))["query_mid"]
    df_js = df_raw[df_raw.mid.isin(mid)] ### Figure out how to send this to JS
    
    # P2-C Load the model (day N-1) and pool data (day N) 
    learner = pickle.load(open("C:/users/someone/Desktop/CaseStudy2/user/{u}/model/learner_RB_{u}_day{d}".format(u=user, d=day-1), "rb"))
    df_pool = pd.read_csv(r"C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_pool_RB_{u}_day{d}".format(u=user, d=day-1))
    y_pool = df_pool.loc["target"]
    X_pool = df_pool.loc[:, df_pool.columns!="target"]

    # P2-D Load INPUT from JS (**change here, only showing sample arrays)
    label = [1, 0, 1, 0, 0]
    conf = [0.74, 0.8, 0.66, 0.85, 0.78] # Not using this in RB
    
    # P2-E Teach the model
    idx = X_pool.index[X_pool.mid.isin(mid)]
    learner.teach(X=X_pool[idx], y=label)
    
    # P2-F Generate query for the next day N+1 with INPUTs from JS 
    query_idx, query_ins = learner.query(X_pool, n_instance=5)
    query_mid = query_ins[["mid"]]
    
    # P2-G P2-H Remove the 5 ins from pool data and update pool data
    df_pool = df_pool[~df_pool.mid.isin(idx)]

    # P2-I Save everything
    pickle.dump(learner, open("C:/users/someone/Desktop/CaseStudy2/user/{u}/model/learner_RB_{u}_day{d}".format(u=user, d=day), "wb"))
    
    df_pool.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_pool_RB_{u}_day{d}".format(u=user, d=day), index=False)
    
    df_query = pd.DataFrame(dict(query_idx=query_idx, query_mid=query_mid))
    df_query.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_query_RB_{u}_day{d}".format(u=user, d=day), index=False)
    
    df_label = pd.DataFrame(dict(label=label, conf=conf))
    df_label.to_csv("C:/users/someone/Desktop/CaseStudy2/user/{u}/data/df_label_RB_{u}_day{d}".format(u=user, d=day), index=False)
    
main()