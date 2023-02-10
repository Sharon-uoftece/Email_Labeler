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
from sklearn.metrics import f1_score
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


df_train = pd.read_csv(r"Train_cc.csv")
X_train = df_train.iloc[:,:-1]
y_train = df_train.iloc[:, -1]

training_indices = np.random.randint(low=0, high=X_train.shape[0], size=5)
X_day0 = X_train.iloc[training_indices,:]
y_day0 = y_train.iloc[training_indices]

while np.all(y_day0 == y_day0.iloc[0]):
    training_indices = np.random.randint(low=0, high=X_train.shape[0], size=5)
    X_day0 = X_train.iloc[training_indices,:]
    y_day0 = y_train.iloc[training_indices]


df_train = df_train[~df_train.index.isin(training_indices)]



# Import test data to validate model initializations
df_test = pd.read_csv(r"Test_cc.csv")
X_test = df_test.iloc[:, :-1]
y_test = df_test.iloc[:, -1]

# RB
BATCH_SIZE = 5
preset_batch = partial(uncertainty_batch_sampling, n_instances=BATCH_SIZE)
learner_RB = ActiveLearner(
    estimator=RandomForestClassifier(),
    query_strategy=preset_batch,
    X_training=X_day0, y_training=y_day0
)
print(f1_score(y_test, learner_RB.predict(X_test), average='weighted'))

# EDIG
learner_EDIG = ActiveLearner(
    estimator=RandomForestClassifier(),
    query_strategy=expert_derived_ig_query_strategy,
    X_training=X_day0, y_training=y_day0
)
print(f1_score(y_test, learner_EDIG.predict(X_test), average='weighted'))

pickle.dump(learner_RB, open("learner_RB_day0", "wb"))
pickle.dump(learner_EDIG, open("learner_EDIG_day0", "wb"))
df_train.to_csv("df_pool_RB_day0.csv", index=False)
df_train.to_csv("df_pool_EDIG_day0.csv", index=False)


# Prepare 10 ins for day 1
X_train = df_train.iloc[:,:-1]
y_train = df_train.iloc[:, -1]

training_indices_day1 = np.random.randint(low=0, high=X_train.shape[0], size=10)
query_idx_RB = training_indices_day1[0:5]
query_mid_RB = X_train.iloc[training_indices,:]["mid"]
df_query_RB = pd.DataFrame(dict(query_idx=query_idx_RB, query_mid=query_mid_RB))


query_idx_EDIG = training_indices_day1[5:10]
query_mid_EDIG = X_train.iloc[training_indices,:]["mid"]
df_query_EDIG = pd.DataFrame(dict(query_idx=query_idx_EDIG, query_mid=query_mid_EDIG))


df_query_RB.to_csv("df_query_RB_day0.csv", index=False)
df_query_EDIG.to_csv("df_query_EDIG_day0.csv", index=False)
