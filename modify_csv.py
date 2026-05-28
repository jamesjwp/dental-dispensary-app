import csv

input_file = '/Users/james/Downloads/dental_inventory.csv'
output_file = '/Users/james/Downloads/dental_inventory.csv.tmp'

renames = {
    "Plastic Dispensing Well": "Dampen Dish",
    "Etch Gel 1.2 Syringe": "Etchant",
    "VOCO Futurabond U Single Dose Bond": "Bonding Agent (VOCO Futurabond U Single Dose)",
    "3M Filtek Supreme Flowable Composite Syringe A1-A4": "Flowable Composite (3M Filtek Supreme Flowable Composite), [Shades A1-A4]",
    "Filtek Supreme Ultra Capsule A1-C4": "Packable Composite (Filtek Supreme Ultra), [Shades A1-C4]",
    "Fuji II LC Capsule A1-A4": "Glass Ionomer (Fuji II LC), [Shades A1-A4]",
    "Sof-lex Finishing Strips": "Finishing Strips",
    "GC Capsule Applier": "Glass Ionomer Capsule Applier",
    "Digital Sensor / PSP Plate": "X-Ray Digital Sensor / PSP Plate",
    "Sensor Holder Rings": "X-Ray XCP & Sensor Holder Rings",
    "Endo ICE Cool Spray": "Endo ICE",
    "Tofflemire bands": "Tofflemire Bands",
    "Irrigating Syringe": "Irrigating Syringe w/ Saline",
    "Bite Block (Anterior)": "Bite Block (Anterior or Posterior)",
    "Bite Block (Posterior)": "Bite Block (Anterior or Posterior)",
    "Isolite Anterior Mouthpiece": "Isolite Mouthpiece (Anterior or Posterior)",
    "Isolite Posterior Mouthpiece": "Isolite Mouthpiece (Anterior or Posterior)",
    "Impression Tray Small": "Impression Trays (Small, Medium, Large)",
    "Impression Tray Medium": "Impression Trays (Small, Medium, Large)",
    "Impression Tray Large": "Impression Trays (Small, Medium, Large)"
}

deletes = {"Rubber Dam Clamp (assorted)", "Anatomical Wooden Wedge", "Saline Syringe"}

add_tags = {
    "Dampen Dish": "Drawer Supplies",
    "Tofflemire Bands": "Drawer Supplies",
    "Fender Wedge": "Drawer Supplies",
    "Surgical Bur 557": "Burs & Polishers",
    "Surgical Bur 701": "Burs & Polishers",
    "Surgical Bur 4 Round": "Burs & Polishers",
    "Surgical Bur 6 Round": "Burs & Polishers"
}

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()

    seen_names = set()

    for row in reader:
        name = row['name'].strip()
        if name in deletes:
            continue
        
        if name in renames:
            name = renames[name]
            row['name'] = name

        # Add tags if needed
        if name in add_tags:
            existing_tags = [t.strip() for t in row['tags'].split(',') if t.strip()]
            tag_to_add = add_tags[name]
            if tag_to_add not in existing_tags:
                existing_tags.append(tag_to_add)
                row['tags'] = ', '.join(existing_tags)

        # deduplicate merges (e.g. Bite Block (Anterior or Posterior) might appear twice)
        if name in seen_names:
            continue
        seen_names.add(name)

        writer.writerow(row)

import os
os.replace(output_file, input_file)
print("CSV modified successfully.")
