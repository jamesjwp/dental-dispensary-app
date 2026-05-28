import csv
import json

input_file = '/Users/james/Downloads/dental_inventory.csv'
output_file = '/Users/james/Downloads/dental_inventory.csv.tmp'

# Define the groups
drawer_supplies = [
  'Topical Benzo-Gel : 20% Benzocaine Bubble Gum, Grape, Mint, Pina Colada, Strawberry',
  'Protector Single Handle Needle Sheath Prop Disposable',
  'Prophy Paste Coarse/Med w/Fluoride Asst',
  'Floss Single Nylon Strands', 'Rubber Dam', 'Reveal Disclosing Solution',
  'Surgical Aspirator Tip Green 1/4"', 'Surgical Aspirator Tip White 1/2"',
  'Curved Utility syringe', '0.9 Sodium Chloride Irrigation',
  'Disposable Air/Water Syringe Tips', 'Gauze 2x2', 'Slow Speed Suction Tube',
  'High Speed Suction Tube', 'Patient Bib', 'Bib Clip', 'Dampen Dish',
  'Microbrush', 'Cardboard Needle ProTector', 'Cotton Swabs', 'Cotton Rolls',
  'Wooden Tongue Depressor', 'Wooden Wedges Medium', 'Wooden Wedges Large',
  'Yellow Plastic Wedges', 'Flowable Composite Tip', 'Etchant Tip', 'Composite Tips',
  'Handheld Mirror',
  'Irrigating Syringe w/ Saline',
  'Tofflemire Bands',
  'Fender Wedge',
]

vitals = [
  'Blood Pressure Cuff',
  'Pulse Oximeter',
  'Safety Glasses (Patient)',
  'Safety Glasses (Operator)',
  'Stethoscope',
]

burs = [
  '330 Carbide', '330 Diamond', 'Round Carbide 1/4', 'Round Carbide 2', 'Round Carbide 4',
  'Round Carbide 6', 'Round Carbide 8', 'Friction Grip 557', 'Friction Grip 245',
  'Diamond Football', 'Diamond Flame', 'Diamond Barrel', 'Diamond Tapered',
  'Diamond Pointed', 'Diamond Round End Cylinder', 'Diamond Flat End Cylinder',
  'Endo Access Bur', 'Endo Z Bur', 'Gates Glidden', 'Peeso Reamer',
  'Brownie Point', 'Greenie Point', 'White Point',
  'Brownie Cup', 'Greenie Cup', 'White Cup',
  'Super Snap Disk Coarse', 'Super Snap Disk Medium', 'Super Snap Disk Fine', 'Super Snap Disk Super Fine',
  'Surgical Bur 557', 'Surgical Bur 701', 'Surgical Bur 4 Round', 'Surgical Bur 6 Round',
]

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    if 'tags' not in fieldnames:
        fieldnames.append('tags')
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    for row in reader:
        name = row['name'].strip()
        tags = [t.strip() for t in row.get('tags', '').split(',') if t.strip()]

        if name in drawer_supplies and 'Drawer Supplies' not in tags:
            tags.append('Drawer Supplies')
        if name in vitals and 'Vitals' not in tags:
            tags.append('Vitals')
        if name in burs and 'Burs & Polishers' not in tags:
            tags.append('Burs & Polishers')
            
        row['tags'] = ', '.join(tags)
        writer.writerow(row)

import os
os.replace(output_file, input_file)
print("Tags added to CSV successfully.")
