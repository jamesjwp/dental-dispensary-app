import csv
import os

input_file = '/Users/james/Downloads/dental_inventory.csv'
output_file = '/Users/james/Downloads/dental_inventory.csv.tmp'

xray_equipment = [
  'X-Ray Digital Sensor / PSP Plate',
  'X-Ray XCP & Sensor Holder Rings',
  'X-Ray Sensor USB Adapter',
  'NOMAD (Portable X-ray gun)'
]

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    if 'tags' not in fieldnames:
        fieldnames.append('tags')
        
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    existing_names = set()
    
    for row in reader:
        name = row['name'].strip()
        
        if name in xray_equipment:
            tags = [t.strip() for t in row.get('tags', '').split(',') if t.strip()]
            if 'X-ray Equipment' not in tags:
                tags.append('X-ray Equipment')
                row['tags'] = ', '.join(tags)
                
        writer.writerow(row)
        existing_names.add(name.lower())
        
    for item in xray_equipment:
        if item.lower() not in existing_names:
            row = {fn: '' for fn in fieldnames}
            row['name'] = item
            row['category'] = 'X-ray Equipment'
            row['type'] = 'supply'
            row['tags'] = 'X-ray Equipment'
            writer.writerow(row)
            existing_names.add(item.lower())

os.replace(output_file, input_file)
print("CSV updated with X-ray Equipment successfully.")
