with open('/Users/james/dispensary-app/src/services/seedService.js', 'r') as f:
    code = f.read()

code = code.replace("IDS.BONDING_AGENT_VOCO_FUTURABOND_U_SINGLE_DOSE\n    IDS.FLOWABLE_COMPOSITE", "IDS.BONDING_AGENT_VOCO_FUTURABOND_U_SINGLE_DOSE,\n    IDS.FLOWABLE_COMPOSITE")

with open('/Users/james/dispensary-app/src/services/seedService.js', 'w') as f:
    f.write(code)
print("Added comma")
