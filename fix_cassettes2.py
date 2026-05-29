import json
import re

with open('/Users/james/dispensary-app/name_to_id.json', 'r') as f:
    name_to_id = json.load(f)

max_id = max([int(v) for v in name_to_id.values()])
current_id = max_id + 1

ci_name_to_id = {k.lower(): v for k, v in name_to_id.items()}

def get_or_create_id(name):
    global current_id
    key = name.lower()
    if key in ci_name_to_id:
        return ci_name_to_id[key]
    new_id = str(current_id)
    current_id += 1
    ci_name_to_id[key] = new_id
    name_to_id[name] = new_id
    return new_id

with open('/Users/james/dispensary-app/src/services/seedService.js', 'r') as f:
    code = f.read()

# I messed up the first run because I didn't assign new IDs to missing ones!
# I will checkout the file again because my python script might have left it in a broken state
# wait, I can just use git checkout to restore, then run the full pipeline again!
import os
os.system('git checkout /Users/james/dispensary-app/src/services/seedService.js')
