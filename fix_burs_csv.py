import csv
csv_file = '/Users/james/Downloads/dental_inventory.csv'
rows = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        if row['category'] == 'Burs & Polishers':
            row['type'] = 'burs_polishers'
        rows.append(row)

with open(csv_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
print("Updated CSV type for Burs")
