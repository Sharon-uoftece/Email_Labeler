import os
# import shutil
# from datetime import datetime
# import hashlib
# from models import *
import time
import json
import models
from models import expert_derived_ig_query_strategy


# JS_OUTPUT_DIR = './archived/temp/'
# ARCHIVED_DIR = './archived/processed/'
# LABEL_NUM_PER_SESSION = 10

# def move_files(path_to_source_file, filename):
#     if not os.path.exists(ARCHIVED_DIR):
#         os.makedirs(ARCHIVED_DIR)

#     shutil.copy(path_to_source_file, f'{ARCHIVED_DIR}{filename}')
#     # os.rename(filename, './archived/processed/latest.txt')

# def sha123(filename):
#     # read stuff in 64kb chunks!
#     BUF_SIZE = 65536  
#     sha1 = hashlib.sha1()
#     with open(filename, 'rb') as f:
#         while True:
#             data = f.read(BUF_SIZE)
#             if not data:
#                 break
#             sha1.update(data)
#     return sha1.hexdigest()


def get_usernames():
    return [n[:-5] for n in os.listdir("../history/") if len(n[:-5]) == 5]

def get_current_round(user_filename):
    f = open(f'../history/{user_filename}.json')
    data = json.load(f)
    round = len(data)
    label_latest_round = len(data[f'{round-1}'])

    f.close()

    return (round, label_latest_round)
  

if __name__ == "__main__":
    while(True):
        print('=========================================')
        
        usernames = get_usernames()
        for user in usernames:
            print(user)
            r, l = get_current_round(user)
            print(f'{user} is at {r} round, labeled {l} in prev round')
            if l == 10:
                print("Start re-trainig ...")
                flag_RB, df_query_RB = models.main(user, "RB")
                flag_EDIG, df_query_EDIG = models.main(user, "EDIG")
                
                if (flag_RB + flag_EDIG > 0):
                    print("---waiting for labels from user {u}---".format(u=user))
                else:
                    models.save_json(user, df_query_RB, df_query_EDIG)
        
        time.sleep(5)


# user = "c613d" # use this for testing
    
# df_query_RB = main(user, "RB")
# df_query_EDIG = main(user, "EDIG")

# save_json(df_query_RB, df_query_EDIG)


# run cronjob to executes this simple python program