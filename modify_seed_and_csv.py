import csv
import os

# Update seedService.js
seed_file = '/Users/james/dispensary-app/src/services/seedService.js'
with open(seed_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'Floss Single Nylon Strands'", "'Floss'")
content = content.replace("'Gauze 2x2'", "'Gauze (2x2)'")
content = content.replace(
    "'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)'",
    "'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)', 'Stethoscope'"
)

with open(seed_file, 'w', encoding='utf-8') as f:
    f.write(content)

# Update dental_inventory.csv
input_file = '/Users/james/Downloads/dental_inventory.csv'
output_file = '/Users/james/Downloads/dental_inventory.csv.tmp'

renames = {
    'Floss Single Nylon Strands': 'Floss',
    'Gauze 2x2': 'Gauze (2x2)'
}

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    
    for row in reader:
        name = row['name'].strip()
        if name in renames:
            name = renames[name]
            row['name'] = name
        writer.writerow(row)

os.replace(output_file, input_file)
print("Updated successfully.")
