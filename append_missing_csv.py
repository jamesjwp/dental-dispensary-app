import csv
import json

with open('/Users/james/dispensary-app/name_to_id.json', 'r') as f:
    name_to_id = json.load(f)

csv_file = '/Users/james/Downloads/dental_inventory.csv'
existing_ids = set()

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        existing_ids.add(row.get('itemId', '').strip())

missing_items = []
for name, item_id in name_to_id.items():
    if item_id not in existing_ids:
        missing_items.append({'itemId': item_id, 'name': name, 'category': 'Cassette Instrument', 'type': 'instrument', 'tags': ''})

if missing_items:
    with open(csv_file, 'a', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['itemId', 'name', 'category', 'type', 'tags'])
        for item in missing_items:
            writer.writerow(item)
    print(f"Appended {len(missing_items)} missing items to CSV.")
else:
    print("No missing items to append.")
