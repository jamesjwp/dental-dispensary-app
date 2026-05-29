with open('/Users/james/dispensary-app/src/services/seedService.js', 'r') as f:
    code = f.read()

code = code.replace("IDS.STETHOSCOPE, IDS.STETHOSCOPE", "IDS.STETHOSCOPE")

with open('/Users/james/dispensary-app/src/services/seedService.js', 'w') as f:
    f.write(code)
print("Fixed double stethoscopes")
