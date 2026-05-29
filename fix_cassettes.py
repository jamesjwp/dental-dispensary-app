import json
import re

with open('/Users/james/dispensary-app/name_to_id.json', 'r') as f:
    name_to_id = json.load(f)

ci_name_to_id = {k.lower(): v for k, v in name_to_id.items()}

with open('/Users/james/dispensary-app/src/services/seedService.js', 'r') as f:
    code = f.read()

def make_const(name):
    s = re.sub(r'[^a-zA-Z0-9]+', '_', name).upper().strip('_')
    if s and s[0].isdigit():
        s = 'ITEM_' + s
    return s

const_map = {}
for name, item_id in name_to_id.items():
    const_map[name.lower()] = f"IDS.{make_const(name)}"

def replace_cassettes(m):
    inner = m.group(1)
    def rep_instruments(m2):
        items_str = m2.group(1)
        new_items = []
        for m3 in re.finditer(r"'([^']+)'", items_str):
            name = m3.group(1)
            key = name.lower()
            if key in const_map:
                new_items.append(const_map[key])
            else:
                new_items.append(f"'{name}'")
                print("MISSING CASSETTE INSTRUMENT:", name)
        return "instrumentNames: [\n      " + ", ".join(new_list) + "\n    ]"
        
    # Wait, instrumentNames has multiple lines, so finditer over the whole array contents
    def rep_instr_array(m_array):
        arr_content = m_array.group(1)
        new_list = []
        for m3 in re.finditer(r"'([^']+)'", arr_content):
            name = m3.group(1)
            key = name.lower()
            if key in const_map:
                new_list.append(const_map[key])
            else:
                new_list.append(f"'{name}'")
                print("MISSING CASSETTE INSTRUMENT:", name)
        return "instrumentNames: [\n      " + ", ".join(new_list) + "\n    ]"
        
    inner = re.sub(r'instrumentNames:\s*\[([\s\S]*?)\]', rep_instr_array, inner)
    return "const CASSETTES = [" + inner + "];"

if "const CASSETTES = [" in code:
    new_code = re.sub(r'const CASSETTES = \[([\s\S]*?)\];', replace_cassettes, code)
    with open('/Users/james/dispensary-app/src/services/seedService.js', 'w') as f:
        f.write(new_code)
    print("Cassettes updated")
else:
    print("Could not find CASSETTES")
