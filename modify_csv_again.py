import csv
import shutil
import os

input_file = '/Users/james/Downloads/dental_inventory.csv'
output_file = '/Users/james/Downloads/dental_inventory.csv.tmp'

burs_to_add = ['Enhance Finishing Cup', 'Enhance Finishing Point']

rename_map = {
    'Flowable Composite (3M Filtek Supreme Flowable Composite), [Shades A1-A4]': 'Flowable Composite (3M Filtek Supreme), [Shades A1-A4]'
}

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
        
        if name in rename_map:
            name = rename_map[name]
            row['name'] = name
            
        existing_names.add(name.lower())
        writer.writerow(row)
        
    for new_bur in burs_to_add:
        if new_bur.lower() not in existing_names:
            row = {fn: '' for fn in fieldnames}
            row['name'] = new_bur
            row['category'] = 'Burs & Polishers'
            row['type'] = 'supply'
            row['tags'] = 'Burs & Polishers'
            writer.writerow(row)
            existing_names.add(new_bur.lower())

os.replace(output_file, input_file)
print("CSV updated successfully.")
