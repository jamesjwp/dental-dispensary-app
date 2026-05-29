import csv
import json
import os

input_file = '/Users/james/Downloads/dental_inventory.csv'
output_file = '/Users/james/Downloads/dental_inventory.csv.tmp'
mapping_file = '/Users/james/dispensary-app/name_to_id.json'

current_id = 1000
mapping = {}

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    
    if 'itemId' not in fieldnames:
        fieldnames.insert(0, 'itemId')
        
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    for row in reader:
        name = row.get('name', '').strip()
        if 'itemId' not in row or not row['itemId']:
            row['itemId'] = str(current_id)
            current_id += 1
            
        if name:
            mapping[name] = row['itemId']
            
        writer.writerow(row)

os.replace(output_file, input_file)

with open(mapping_file, 'w', encoding='utf-8') as f:
    json.dump(mapping, f, indent=2)

print(f"Assigned up to {current_id - 1}.")
print("CSV updated and mapping saved.")
