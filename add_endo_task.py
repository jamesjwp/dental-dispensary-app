import json
import csv
import re
import os

SEED_FILE = '/Users/james/dispensary-app/src/services/seedService.js'
CSV_FILE = '/Users/james/Downloads/dental_inventory.csv'
NAME_TO_ID_FILE = '/Users/james/dispensary-app/name_to_id.json'

with open(SEED_FILE, 'r') as f:
    seed_content = f.read()

# 1. Update Endo Cassette
endo_cassette_old = """  {
    name: 'Endo Cassette',
    color: '#6b7280',
    description: 'Endodontic hand instruments',
    instrumentNames: [
      IDS.ENDODONTIC_RULER, IDS.ENDODONTIC_FILE_STAND_BLOCK, IDS.SPREADER, IDS.PLUGGER, IDS.LENTULO_SPIRAL
    ],
  },"""

endo_cassette_new = """  {
    name: 'Endo Cassette',
    color: '#6b7280',
    description: 'Endodontic hand instruments',
    instrumentNames: [
      IDS.ENDODONTIC_RULER, IDS.ENDODONTIC_FILE_STAND_BLOCK, IDS.SPREADER, IDS.PLUGGER, IDS.LENTULO_SPIRAL, 'Probe Exam', 'Mouth Mirror', 'Cotton Pliers', 'Small Excavator/Spoon', 'Endo Explorer'
    ],
  },"""

seed_content = seed_content.replace(endo_cassette_old, endo_cassette_new)

# 2. Add Endo Procedure List
# We'll insert it right after the Oral Surgery list
oral_surgery_list = """  {
    name: 'Oral Surgery',
    items: [
      IDS.BLOOD_PRESSURE_CUFF, IDS.PULSE_OXIMETER, IDS.SAFETY_GLASSES_PATIENT, IDS.SAFETY_GLASSES_OPERATOR, IDS.STETHOSCOPE, 'CASSETTE:Oral Surgery Cassette', IDS.BITE_BLOCK_ANTERIOR_OR_POSTERIOR, IDS.X_RAY_DIGITAL_SENSOR_PSP_PLATE, IDS.X_RAY_XCP_SENSOR_HOLDER_RINGS, IDS.NOMAD_PORTABLE_X_RAY_GUN, IDS.X_RAY_SENSOR_USB_ADAPTER, IDS.POST_OP_INSTRUCTIONS, IDS.IRRIGATING_SYRINGE_W_SALINE, IDS.SURGICAL_AIR_DRIVEN_HANDPIECE, IDS.SURGICAL_BUR_557, IDS.SURGICAL_BUR_701, IDS.SURGICAL_BUR_4_ROUND, IDS.SURGICAL_BUR_6_ROUND, IDS.GAUZE_2X2, IDS.COTTON_ROLLS, IDS.FLOSS
    ],
  },"""

endo_list = """  {
    name: 'Endo',
    items: [
      IDS.BLOOD_PRESSURE_CUFF, IDS.PULSE_OXIMETER, IDS.SAFETY_GLASSES_PATIENT, IDS.SAFETY_GLASSES_OPERATOR, IDS.STETHOSCOPE,
      'CASSETTE:Endo Cassette', 'CASSETTE:Rubber Dam Cassette',
      '330 Carbide', '557 Carbide', 'Round Carbide 4', 'Round Carbide 2', 'Endo Z Bur', 'Enhance Finishing Point',
      'NOMAD (Portable X-ray gun)', 'X-Ray Digital Sensor / PSP Plate', 'X-Ray Sensor USB Adapter', 'X-Ray XCP & Sensor Holder Rings',
      'High Speed Handpiece', 'Slow Speed Handpiece',
      'S1 rotary file (0.18 mm, 0.02 v)', 'S2 rotary file (0.20 mm, 0.04 v)', 'WaveOne Gold Primary Reciprocating file (0.25 mm, variable taper)',
      'K-file (pink), [0.06 mm tip diameter, 0.02 mm taper]', 'K-file (grey), [0.08 mm tip diameter, 0.02 mm taper]', 'K-file (purple), [0.10 mm tip diameter, 0.02 mm taper]', 'K-file (white), [0.15 mm tip diameter, 0.02 mm taper]', 'K-file (yellow), [0.20 mm tip diameter, 0.02 mm taper]', 'K-file (red), [0.25 mm tip diameter, 0.02 mm taper]', 'K-file (blue), [0.30 mm tip diameter, 0.02 mm taper]', 'K-file (green), [0.35 mm tip diameter, 0.02 mm taper]', 'K-file (black), [0.40 mm tip diameter, 0.02 mm taper]', 'K-file (white), [0.45 mm tip diameter, 0.02 mm taper]', 'K-file (yellow), [0.50 mm tip diameter, 0.02 mm taper]', 'K-file (red), [0.55 mm tip diameter, 0.02 mm taper]', 'K-file (blue), [0.60 mm tip diameter, 0.02 mm taper]', 'K-file (green), [0.70 mm tip diameter, 0.02 mm taper]', 'K-file (black), [0.80 mm tip diameter, 0.02 mm taper]', 'K-file (white), [0.90 mm tip diameter, 0.02 mm taper]', 'K-file (yellow), [1.00 mm tip diameter, 0.02 mm taper]', 'K-file (red), [1.10 mm tip diameter, 0.02 mm taper]', 'K-file (blue), [1.20 mm tip diameter, 0.02 mm taper]', 'K-file (green), [1.30 mm tip diameter, 0.02 mm taper]', 'K-file (black), [1.40 mm tip diameter, 0.02 mm taper]', 'K-file (white), [1.50 mm tip diameter, 0.02 mm taper]',
      'Hedstrom file (pink), [0.06 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (grey), [0.08 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (purple), [0.10 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (white), [0.15 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (yellow), [0.20 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (red), [0.25 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (blue), [0.30 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (green), [0.35 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (black), [0.40 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (white), [0.45 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (yellow), [0.50 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (red), [0.55 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (blue), [0.60 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (green), [0.70 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (black), [0.80 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (white), [0.90 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (yellow), [1.00 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (red), [1.10 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (blue), [1.20 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (green), [1.30 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (black), [1.40 mm tip diameter, 0.02 mm taper]', 'Hedstrom file (white), [1.50 mm tip diameter, 0.02 mm taper]',
      'Endo ring and sponge', 'Rotary system', 'Lubricant', 'NaOCl', 'EDTA', 'Endo Activator', 'Mixing pad', 'Gauze (2x2)', 'Isopropyl Alcohol 70%', 'Sealer', 'Gutta Percha (0.15 - 1.50 mm)', 'Paper point', 'System B', 'Calamus', 'Biodentine', 'MTA', 'Calcium Hydroxide Placement', 'Glass Ionomer (Fuji II LC), [Shades A1-A4]', 'Carbon Fiber Post', 'Rely X Unicem 2 Automix Cement A2', 'Grandio-Core Core Buildup', 'Apex locator'
    ]
  },"""

if "name: 'Endo'" not in seed_content:
    seed_content = seed_content.replace(oral_surgery_list, oral_surgery_list + "\n" + endo_list)

with open(SEED_FILE, 'w') as f:
    f.write(seed_content)

print("Injected raw strings to seedService.js")

# Now run full_refactor.py
os.system('python3 /Users/james/dispensary-app/full_refactor.py')
print("Ran full_refactor.py")

# Now load name_to_id.json and dental_inventory.csv to append new ones
with open(NAME_TO_ID_FILE, 'r') as f:
    name_to_id = json.load(f)

csv_items = {}
with open(CSV_FILE, 'r') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        csv_items[row['name'].lower()] = row

with open(CSV_FILE, 'a', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    for name, item_id in name_to_id.items():
        if name.lower() not in csv_items:
            # We need to add it!
            # determine tags and category
            category = 'Procedural'
            tags = 'Procedural'
            if 'file' in name.lower() or 'endo' in name.lower() or name in ['NaOCl', 'EDTA', 'Sealer', 'Gutta Percha (0.15 - 1.50 mm)', 'Paper point', 'System B', 'Calamus', 'Biodentine', 'MTA', 'Carbon Fiber Post', 'Apex locator', 'Rotary system']:
                category = 'Endodontic'
                tags = 'Endodontic'
                if name == 'NaOCl':
                    tags = 'Irrigant, Endodontic'
                if name == 'EDTA':
                    tags = 'Chelator, Endodontic'
            
            row = {
                'itemId': item_id,
                'name': name,
                'category': category,
                'type': 'supply', # default
                'tags': tags
            }
            if 'handpiece' in name.lower() or 'locator' in name.lower() or name == 'Endo Activator' or name == 'Rotary system':
                row['type'] = 'instrument'
            
            writer.writerow(row)
            print(f"Added {name} to CSV")

print("Done with endo update")
