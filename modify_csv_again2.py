import csv
import os

input_file = '/Users/james/Downloads/dental_inventory.csv'
output_file = '/Users/james/Downloads/dental_inventory.csv.tmp'

deletes = {
    'Pro-matrix Band Wide 6mm (Preset tofflemire bands)',
    'AutoMatrix Kit'
}

renames = {
    'Mylar Matrix Strips .002': 'Mylar Matrix Strips (.002 mm)'
}

add_tags = {
    'Articulating Paper': 'Drawer Supplies',
    'Finishing Strips': 'Drawer Supplies'
}

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    for row in reader:
        name = row['name'].strip()
        
        if name in deletes:
            continue
            
        if name in renames:
            name = renames[name]
            row['name'] = name
            
        if name in add_tags:
            tags = [t.strip() for t in row.get('tags', '').split(',') if t.strip()]
            tag_to_add = add_tags[name]
            if tag_to_add not in tags:
                tags.append(tag_to_add)
                row['tags'] = ', '.join(tags)
                
        writer.writerow(row)

os.replace(output_file, input_file)
print("CSV updated successfully.")
