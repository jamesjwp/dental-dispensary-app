import csv
import json
import os

input_file = '/Users/james/Downloads/dental_inventory.csv'
output_file = '/Users/james/Downloads/dental_inventory.csv.tmp'
mapping_file = '/Users/james/dispensary-app/name_to_id.json'

current_id = 1000
mapping = {}

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    reader = csv.reader(infile)
    headers = next(reader)
    
    # headers is currently ['itemId', 'name', 'category', 'type', 'tags']
    # But the data rows have 4 columns which correspond to name, category, type, tags
    
    writer = csv.writer(outfile)
    writer.writerow(['itemId', 'name', 'category', 'type', 'tags'])
    
    for row in reader:
        # row has 4 columns: [name, category, type, tags]
        # or it might have trailing empties
        name = row[0].strip() if len(row) > 0 else ''
        category = row[1].strip() if len(row) > 1 else ''
        type_ = row[2].strip() if len(row) > 2 else ''
        tags = row[3].strip() if len(row) > 3 else ''
        
        item_id = str(current_id)
        current_id += 1
        
        mapping[name] = item_id
        
        writer.writerow([item_id, name, category, type_, tags])

os.replace(output_file, input_file)

with open(mapping_file, 'w', encoding='utf-8') as f:
    json.dump(mapping, f, indent=2)

print(f"Assigned up to {current_id - 1}.")
print("CSV fixed and mapping saved.")
