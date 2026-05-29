import re
import json

with open('/Users/james/dispensary-app/name_to_id.json', 'r') as f:
    name_to_id = json.load(f)

const_map = {}
for name, item_id in name_to_id.items():
    s = re.sub(r'[^a-zA-Z0-9]+', '_', name).upper().strip('_')
    if s and s[0].isdigit():
        s = 'ITEM_' + s
    const_map[name.lower()] = f"IDS.{s}"

with open('/Users/james/dispensary-app/src/services/seedService.js', 'r') as f:
    code = f.read()

def replace_procedural(m):
    inner = m.group(1)
    def rep_items(m2):
        list_items = m2.group(1)
        new_list = []
        for match in re.finditer(r"'([^']+)'", list_items):
            name = match.group(1)
            key = name.lower()
            if name.startswith("CASSETTE:"):
                new_list.append(f"'{name}'")
            else:
                new_list.append(const_map.get(key, f"'{name}'"))
        
        # We also need to preserve existing IDS. references
        # actually the regex "'([^']+)'" only matches strings.
        # But wait, we want to replace strings with IDS. 
        # So replacing strings with their IDS reference is perfect!
        # Let's rebuild the list. Wait, if we just regex replace strings inside the matched items block:
        
        def replace_single_string(m_str):
            name = m_str.group(1)
            if name.startswith("CASSETTE:"):
                return f"'{name}'"
            key = name.lower()
            if key in const_map:
                return const_map[key]
            return m_str.group(0)
            
        return "items: [" + re.sub(r"'([^']+)'", replace_single_string, list_items) + "]"
        
    inner = re.sub(r'items:\s*\[([\s\S]*?)\]', rep_items, inner)
    return "const PROCEDURAL_LISTS = [" + inner + "];"

code = re.sub(r'const PROCEDURAL_LISTS = \[([\s\S]*?)\];', replace_procedural, code)

with open('/Users/james/dispensary-app/src/services/seedService.js', 'w') as f:
    f.write(code)
print("Fixed Restorative strings to IDS")
