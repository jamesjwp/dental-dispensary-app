import csv
with open('/Users/james/Downloads/dental_inventory.csv', 'r') as f:
    content = f.read()
    print("Length of file:", len(content))
    print("First 100 chars:", repr(content[:100]))
