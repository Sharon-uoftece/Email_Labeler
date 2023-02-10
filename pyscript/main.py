import os
import shutil
from datetime import datetime
import hashlib

JS_OUTPUT_DIR = './archived/temp/'
ARCHIVED_DIR = './archived/processed/'
LABEL_NUM_PER_SESSION = 10

def move_files(path_to_source_file, filename):
    if not os.path.exists(ARCHIVED_DIR):
        os.makedirs(ARCHIVED_DIR)

    shutil.copy(path_to_source_file, f'{ARCHIVED_DIR}{filename}')
    # os.rename(filename, './archived/processed/latest.txt')

def sha123(filename):
    # read stuff in 64kb chunks!
    BUF_SIZE = 65536  
    sha1 = hashlib.sha1()
    with open(filename, 'rb') as f:
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            sha1.update(data)
    return sha1.hexdigest()


def check_for_update():
    now = datetime.now()

    # assume outputs from JS are saved here
    if not os.path.exists(JS_OUTPUT_DIR):
        os.makedirs(JS_OUTPUT_DIR)


    # generate some random text
    with open(f'{JS_OUTPUT_DIR}{now.strftime("%Y%d%m")}_{LABEL_NUM_PER_SESSION}.txt', 'w') as f:
        f.write('readme')


    dir_list = os.listdir(JS_OUTPUT_DIR)

    # assume that JS ouput only one file with a number showing how many label
    filename = dir_list[0]
    print("===>", filename)


    labeled_num = filename.split("/")[-1][9:-4]
    print(labeled_num)

    if int(labeled_num) == LABEL_NUM_PER_SESSION:
        print("10 labelled")
        # train to models
        # move to archived
        move_files(f'{JS_OUTPUT_DIR}{filename}', filename)
    else:
        print("Not yet 10 labeled ready")


check_for_update()



# run cronjob to executes this simple python program