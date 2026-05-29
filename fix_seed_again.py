with open('/Users/james/dispensary-app/src/services/seedService.js', 'r') as f:
    code = f.read()

code = code.replace("""  'Tofflemire Bands',
  'Fender Wedge',""", """  'Tofflemire Bands',
  'Fender Wedge',
  'Articulating Paper',
  'Finishing Strips',""")

code = code.replace("""'Flowable Composite (3M Filtek Supreme Flowable Composite), [Shades A1-A4]'""", """'Flowable Composite (3M Filtek Supreme), [Shades A1-A4]'""")

code = code.replace("""'Tofflemire Bands', 'Pro-matrix Band Wide 6mm (Preset tofflemire bands)', 'AutoMatrix Kit',""", """'Tofflemire Bands',""")

code = code.replace("""'Mylar Matrix Strips .002'""", """'Mylar Matrix Strips (.002 mm)'""")

xray_code = """
const XRAY_EQUIPMENT_TAG = 'X-ray Equipment';
const XRAY_EQUIPMENT = [
  'X-Ray Digital Sensor / PSP Plate',
  'X-Ray XCP & Sensor Holder Rings',
  'X-Ray Sensor USB Adapter',
  'NOMAD (Portable X-ray gun)',
];

export const seedXrayEquipment = () =>
  tagOrCreate(XRAY_EQUIPMENT.map(name => ({ name, tags: [XRAY_EQUIPMENT_TAG] })), { defaultCategory: 'X-ray Equipment' });
"""

if 'seedXrayEquipment' not in code:
    code = code.replace("""export const seedBursAndPolishers""", xray_code + "\nexport const seedBursAndPolishers")

with open('/Users/james/dispensary-app/src/services/seedService.js', 'w') as f:
    f.write(code)

print("Seed fixes applied.")
