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
import json
import glob
import warnings
warnings.filterwarnings("ignore")

def expert_derived_ig_query_strategy(classifier, X_pool, X_training, conf_training):   
    # measure the utility of each instance in the pool
    uncertainty = classifier_uncertainty(classifier, X_pool)
    
    distance_scores = pairwise_distances(X_pool, X_training, metric='cosine').min(axis=1)
    similarity_scores = 1 / (1 + distance_scores)
    
    cwds_ndarray = np.divide(pairwise_distances(X_pool, X_training, metric='cosine'),np.repeat(conf_training.reshape(5, 1), len(X_pool), axis=1).T)
    conf_weighted_distance_scores = cwds_ndarray[:,0:].min(axis=1)
    conf_weighted_similarity_scores = 1 / (1 + conf_weighted_distance_scores)

    alpha = len(X_pool)/671
    beta = 0.9
    
    scores = alpha * uncertainty \
             + alpha * beta * conf_weighted_similarity_scores \
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


X_day0 = X_day0.values
y_day0 = y_day0.values

df_train = df_train[~df_train.index.isin(training_indices)]
X_train = df_train.iloc[:,:-1]
y_train = df_train.iloc[:, -1]


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

for dirpath_model in glob.glob("../model/"):
    pickle.dump(learner_RB, open(dirpath_model+"learner_RB_day0", "wb"))
    pickle.dump(learner_EDIG, open(dirpath_model+"learner_EDIG_day0", "wb"))
    
for dirpath_pool in glob.glob("../py_data/"):
    df_train.to_csv(dirpath_pool+"df_pool_RB_day0.csv", index=False)
    df_train.to_csv(dirpath_pool+"df_pool_EDIG_day0.csv", index=False)


# Prepare 10 ins for day 1
X_train = df_train.iloc[:,:-1]
y_train = df_train.iloc[:, -1]

query_idx, query_ins = learner_RB.query(X_train.values)
query_mid = X_train.iloc[query_idx,:]["mid"].values

query_mid_RB = X_train.iloc[query_idx,:]["mid"]
df_query_RB = pd.DataFrame(dict(query_mid=query_mid_RB))
df_query_RB["day"] = 0
df_query_RB["model_type"] = "RB"

conf_training = np.array([5, 5, 5, 5, 5])
query_idx, query_ins = learner_EDIG.query(X_train.values, X_day0, conf_training)
query_mid = X_train.iloc[query_idx,:]["mid"].values

query_mid_EDIG = X_train.iloc[query_idx,:]["mid"]
df_query_EDIG = pd.DataFrame(dict(query_mid=query_mid_EDIG))
df_query_EDIG["day"] = 0
df_query_EDIG["model_type"] = "EDIG"

# Shuffle
df_query = pd.concat([df_query_RB, df_query_EDIG], 0).sample(frac=1).reset_index(drop=True)

# Parse to JSON and save
cols_as_dict = df_query.set_index('day').apply(dict, axis=1)
combined = cols_as_dict.groupby(cols_as_dict.index).apply(list)

result = combined.to_json()
parsed = json.loads(result)
json_object = json.dumps(parsed, indent=4)

for json_path in glob.glob("../history/"):
    with open(json_path+"history_day0.json", "w") as outfile:
        outfile.write(json_object)

