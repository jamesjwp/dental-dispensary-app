import json
import re
import os

with open('/Users/james/dispensary-app/name_to_id.json', 'r') as f:
    name_to_id = json.load(f)

# Make sure all keys in name_to_id are lowercase for lookups
ci_name_to_id = {k.lower(): v for k, v in name_to_id.items()}

max_id = max([int(v) for v in name_to_id.values()]) if name_to_id else 1000
current_id = max_id + 1

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

def make_const(name):
    s = re.sub(r'[^a-zA-Z0-9]+', '_', name).upper().strip('_')
    if s and s[0].isdigit():
        s = 'ITEM_' + s
    return s

def extract_strings(text):
    for m in re.finditer(r"'([^']+)'", text):
        name = m.group(1)
        if not name.startswith("CASSETTE:"):
            get_or_create_id(name)

# 1. First pass: extract all items and create IDs for them
for group_match in re.finditer(r'const (DRAWER_SUPPLIES|BURS_AND_POLISHERS|VITALS|XRAY_EQUIPMENT|CASSETTES|ENDO_FILES) = \[([\s\S]*?)\];', code):
    extract_strings(group_match.group(2))

for proc_match in re.finditer(r'const PROCEDURAL_LISTS = \[([\s\S]*?)\];', code):
    extract_strings(proc_match.group(1))

# 2. Build constants
ids_code = ["export const IDS = {"]
const_map = {}
for name, item_id in name_to_id.items():
    c = make_const(name)
    ids_code.append(f"  {c}: '{item_id}',")
    const_map[name.lower()] = f"IDS.{c}"
ids_code.append("};\n")

# 3. Replace blocks
def replace_simple_array(m):
    items = m.group(1)
    new_items = []
    for match in re.finditer(r"'([^']+)'", items):
        name = match.group(1)
        key = name.lower()
        new_items.append(f"{{ itemId: {const_map[key]}, name: '{name}' }}")
    return "[\n  " + ",\n  ".join(new_items) + ",\n];"

code = re.sub(r'const DRAWER_SUPPLIES = \[([\s\S]*?)\];', lambda m: "const DRAWER_SUPPLIES = " + replace_simple_array(m), code)
code = re.sub(r'const VITALS = \[([\s\S]*?)\];', lambda m: "const VITALS = " + replace_simple_array(m), code)
code = re.sub(r'const XRAY_EQUIPMENT = \[([\s\S]*?)\];', lambda m: "const XRAY_EQUIPMENT = " + replace_simple_array(m), code)
code = re.sub(r'const ENDO_FILES = \[([\s\S]*?)\];', lambda m: "const ENDO_FILES = " + replace_simple_array(m), code)

def replace_burs(m):
    inner = m.group(1)
    def rep_obj(m2):
        name = m2.group(1)
        key = name.lower()
        rest = m2.group(2)
        return f"{{ itemId: {const_map[key]}, name: '{name}'{rest}"
    inner = re.sub(r"\{\s*name:\s*'([^']+)'(.*?)", rep_obj, inner)
    return "const BURS_AND_POLISHERS = [" + inner + "];"
code = re.sub(r'const BURS_AND_POLISHERS = \[([\s\S]*?)\];', replace_burs, code)

def replace_cassettes(m):
    inner = m.group(1)
    def rep_instr_array(m_array):
        arr_content = m_array.group(1)
        new_list = []
        for m3 in re.finditer(r"'([^']+)'", arr_content):
            name = m3.group(1)
            key = name.lower()
            new_list.append(const_map[key])
        return "instrumentNames: [\n      " + ", ".join(new_list) + "\n    ]"
    # Safely match until '],'
    inner = re.sub(r'instrumentNames:\s*\[([\s\S]*?)\]\s*,', lambda m: rep_instr_array(m) + ",", inner)
    return "const CASSETTES = [" + inner + "];"
code = re.sub(r'const CASSETTES = \[([\s\S]*?)\];', replace_cassettes, code)

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
                new_list.append(const_map[key])
        return "items: [\n      " + ", ".join(new_list) + "\n    ]"
    # Match items array safely, ensuring we capture everything up to the closing brace of the object
    inner = re.sub(r'items:\s*\[([\s\S]*?)\]\s*,?\s*\}', lambda m: rep_items(m) + "\n  }", inner)
    return "const PROCEDURAL_LISTS = [" + inner + "];"
code = re.sub(r'const PROCEDURAL_LISTS = \[([\s\S]*?)\];', replace_procedural, code)

# 4. Global string replacements for tagOrCreate and variables
code = code.replace("tagOrCreate(DRAWER_SUPPLIES.map(name => ({ name, tags: [DRAWER_TAG] }))", "tagOrCreate(DRAWER_SUPPLIES.map(obj => ({ ...obj, tags: [DRAWER_TAG] }))")
code = code.replace("tagOrCreate(VITALS.map(name => ({ name, tags: [VITALS_TAG] }))", "tagOrCreate(VITALS.map(obj => ({ ...obj, tags: [VITALS_TAG] }))")
code = code.replace("tagOrCreate(XRAY_EQUIPMENT.map(name => ({ name, tags: [XRAY_EQUIPMENT_TAG] }))", "tagOrCreate(XRAY_EQUIPMENT.map(obj => ({ ...obj, tags: [XRAY_EQUIPMENT_TAG] }))")
code = code.replace("tagOrCreate(ENDO_FILES.map(name => ({ name, tags: [ENDO_FILES_TAG] }))", "tagOrCreate(ENDO_FILES.map(obj => ({ ...obj, tags: [ENDO_FILES_TAG] }))")

code = code.replace("""const id = itemsByName.get(name.toLowerCase().trim());""", """const id = itemsByItemId.get(String(name).trim());""")
code = code.replace("""if (data.name) itemsByName.set(data.name.toLowerCase().trim(), d.id);""", """if (data.itemId) itemsByItemId.set(String(data.itemId).trim(), d.id);""")
code = code.replace("""const itemsByName = new Map();""", """const itemsByItemId = new Map();""")

def replace_tagorcreate(m):
    s = m.group(0)
    s = s.replace("""if (x.name) byName.set(x.name.toLowerCase().trim(), { id: d.id, data: x });""", """if (x.itemId) byItemId.set(String(x.itemId).trim(), { id: d.id, data: x });""")
    s = s.replace("""const byName = new Map();""", """const byItemId = new Map();""")
    s = s.replace("""const existing = byName.get(t.name.toLowerCase().trim());""", """const existing = t.itemId ? byItemId.get(String(t.itemId)) : null;""")
    s = s.replace("""name: t.name,""", """itemId: String(t.itemId),\n        name: t.name,""")
    return s
code = re.sub(r'async function tagOrCreate\([\s\S]*?\}\n\}', replace_tagorcreate, code)

code = code.replace("""let inventoryId = itemsByName.get(entry.toLowerCase().trim());""", """let inventoryId = itemsByItemId.get(String(entry).trim());""")
code = code.replace("""itemsByName.set(entry.toLowerCase().trim(), inventoryId);""", """itemsByItemId.set(String(entry).trim(), inventoryId);""")

with open('/Users/james/dispensary-app/src/services/seedService.js', 'w') as f:
    f.write("\n".join(ids_code) + "\n" + code)

with open('/Users/james/dispensary-app/name_to_id.json', 'w') as f:
    json.dump(name_to_id, f, indent=2)

print("done")
