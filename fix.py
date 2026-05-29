import re

file_path = '/Users/james/dispensary-app/src/services/seedService.js'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Remove the duplicated IDS block
# Find the first "export const IDS = {" and the second one
first_idx = content.find('export const IDS = {')
second_idx = content.find('export const IDS = {', first_idx + 1)

if first_idx != -1 and second_idx != -1:
    # Delete everything from first_idx to just before second_idx
    content = content[second_idx:]

# 2. Fix the broken Endo array
# Find the broken part:
broken_str = "    ]', 'K-file (grey)"
fix_idx = content.find(broken_str)

if fix_idx != -1:
    # We need to replace the `]'` and convert all strings to IDS.X.
    # Actually, full_refactor.py would convert valid strings to IDS.X.
    # To fix it, let's just restore the raw array for Endo, and NOT run full_refactor.py because full_refactor.py is broken for non-greedy arrays with ].
    # Wait, full_refactor.py already created all IDS in the second IDS block!
    # So we CAN just use the IDS.X constants for all items.
    
    # We can reconstruct the Endo items list using IDS.X constants:
    # Let's extract all the item names and map them to their IDS keys from name_to_id.json
    import json
    with open('/Users/james/dispensary-app/name_to_id.json', 'r') as f:
        name_to_id = json.load(f)
        
    def make_const(name):
        s = re.sub(r'[^a-zA-Z0-9]+', '_', name).upper().strip('_')
        if s and s[0].isdigit():
            s = 'ITEM_' + s
        return s
        
    endo_items_raw = [
      'CASSETTE:Endo Cassette', 'CASSETTE:Rubber Dam Cassette',
      '330 Carbide', '557 Carbide', 'Round Carbide 4', 'Round Carbide 2', 'Endo Z Bur', 'Enhance Finishing Point',
      'NOMAD (Portable X-ray gun)', 'X-Ray Digital Sensor / PSP Plate', 'X-Ray Sensor USB Adapter', 'X-Ray XCP & Sensor Holder Rings',
      'High Speed Handpiece', 'Slow Speed Handpiece',
      'S1 rotary file (0.18 mm, 0.02 v)', 'S2 rotary file (0.20 mm, 0.04 v)', 'WaveOne Gold Primary Reciprocating file (0.25 mm, variable taper)',
      'K-file (pink), [0.06 mm tip diameter, 0.02 mm taper]', 'K-file (grey), [0.08 mm tip diameter, 0.02 mm taper]', 'K-file (purple), [0.10 mm tip diameter, 0.02 mm taper]', 'K-file (white), [0.15 mm tip diameter, 0.02 mm taper]', 'K-file (yellow), [0.20 mm tip diameter, 0.02 mm taper]', 'K-file (red), [0.25 mm tip diameter, 0.02 mm taper]', 'K-file (blue), [0.30 mm tip diameter, 0.02 mm taper]', 'K-file (green), [0.35 mm tip diameter, 0.02 mm taper]', 'K-file (black), [0.40 mm tip diameter, 0.02 mm taper]', 'K-file (white), [0.45 mm tip diameter, 0.02 mm taper]', 'K-file (yellow), [0.50 mm tip diameter, 0.02 mm taper]', 'K-file (red), [0.55 mm tip diameter, 0.02 mm taper]', 'K-file (blue), [0.60 mm tip diameter, 0.02 mm taper]', 'K-file (green), [0.70 mm tip diameter, 0.02 mm taper]', 'K-file (black), [0.80 mm tip diameter, 0.02 mm taper]', 'K-file (white), [0.90 mm tip diameter, 0.02 mm taper]', 'K-file (yellow), [1.00 mm tip diameter, 0.02 mm taper]', 'K-file (red), [1.10 mm tip diameter, 0.02 mm taper]', 'K-file (blue), [1.20 mm tip diameter, 0.02 mm taper]', 'K-file (green), [1.30 mm tip diameter, 0.02 mm taper]', 'K-file (black), [1.40 mm tip diameter, 0.02 mm taper]', 'K-file (white), [1.50 mm tip diameter, 0.02 mm taper]',
      'Hedstrom file (pink), [0.06 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (grey), [0.08 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (purple), [0.10 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (white), [0.15 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (yellow), [0.20 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (red), [0.25 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (blue), [0.30 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (green), [0.35 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (black), [0.40 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (white), [0.45 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (yellow), [0.50 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (red), [0.55 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (blue), [0.60 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (green), [0.70 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (black), [0.80 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (white), [0.90 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (yellow), [1.00 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (red), [1.10 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (blue), [1.20 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (green), [1.30 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (black), [1.40 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (white), [1.50 mm tip diameter, 0.02 mm taper]',
      'Endo ring and sponge', 'Rotary system', 'Lubricant', 'NaOCl', 'EDTA', 'Endo Activator', 'Mixing pad', 'Gauze (2x2)', 'Isopropyl Alcohol 70%', 'Sealer', 'Gutta Percha (0.15 - 1.50 mm)', 'Paper point', 'System B', 'Calamus', 'Biodentine', 'MTA', 'Calcium Hydroxide Placement', 'Glass Ionomer (Fuji II LC), [Shades A1-A4]', 'Carbon Fiber Post', 'Rely X Unicem 2 Automix Cement A2', 'Grandio-Core Core Buildup', 'Apex locator'
    ]
    
    new_items_list = []
    for item in endo_items_raw:
        if item.startswith('CASSETTE:'):
            new_items_list.append(f"'{item}'")
        else:
            const = make_const(item)
            new_items_list.append(f"IDS.{const}")
            
    # Now find the whole Endo block and replace it
    endo_block_regex = r"name:\s*'Endo',\s*items:\s*\[([^\{]*?)\]\s*\}"
    match = re.search(endo_block_regex, content, re.DOTALL)
    if match:
        replacement = "name: 'Endo',\n    items: [\n      " + ", ".join(new_items_list) + "\n    ]\n  }"
        # Wait, new_list is not defined! new_items_list!
        pass

# Since regex is risky with broken structures, let's just replace the exact text
start_text = "  {\n    name: 'Endo',\n    items: ["
end_text = "    ]\n  },"
start_idx = content.find(start_text)
if start_idx != -1:
    end_idx = content.find(end_text, start_idx) + len(end_text)
    
    # We will build the correct string:
    correct_endo = "  {\n    name: 'Endo',\n    items: [\n      " + ", ".join(new_items_list) + "\n    ]\n  },"
    
    content = content[:start_idx] + correct_endo + content[end_idx:]

with open(file_path, 'w') as f:
    f.write(content)

print("Fixed seedService.js successfully.")
