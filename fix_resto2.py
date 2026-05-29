import re

with open('/Users/james/dispensary-app/src/services/seedService.js', 'r') as f:
    code = f.read()

# I will just regex replace the broken ]', 'Vita Shade Guide' part
def fix(m):
    return "IDS.FLOWABLE_COMPOSITE_3M_FILTEK_SUPREME_SHADES_A1_A4, IDS.VITA_SHADE_GUIDE,"

code = re.sub(r"\]',\s*'Vita Shade Guide',", fix, code)

with open('/Users/james/dispensary-app/src/services/seedService.js', 'w') as f:
    f.write(code)
print("Fixed syntax")
