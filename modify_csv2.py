import csv

input_file = '/Users/james/Downloads/dental_inventory.csv'

lines = []
with open(input_file, 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        if row and len(row) > 1:
            if row[1] == 'Rely X Unicem 2 Automix Cement A2':
                row[1] = 'Dual-Cure Cement (Rely X Unicem 2 Automix, Shade A2)'
            elif row[1] == '557 Carbide' and row[2] == 'Procedural/Generated':
                row[2] = 'Burs & Polishers'
                # row structure: 0:itemId, 1:name, 2:category, 3:type, 4:tags
                while len(row) <= 4:
                    row.append('')
                row[4] = 'Burs, Carbide'
        lines.append(row)

with open(input_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(lines)
