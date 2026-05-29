import re

with open('/Users/james/dispensary-app/src/services/seedService.js', 'r') as f:
    code = f.read()

# Replace the broken Restorative block
broken = """    name: 'Restorative',
    items: [
      IDS.BLOOD_PRESSURE_CUFF, IDS.PULSE_OXIMETER, IDS.SAFETY_GLASSES_PATIENT, IDS.SAFETY_GLASSES_OPERATOR, IDS.STETHOSCOPE, 'CASSETTE:Operatory Cassette', 'CASSETTE:Rubber Dam Cassette', 'CASSETTE:XTS/Composite Cassette', IDS.IRRIGATING_SYRINGE_W_SALINE, IDS.ISOLITE_CORE, IDS.ISOLITE_MOUTHPIECE_ANTERIOR_OR_POSTERIOR, IDS.BITE_BLOCK_ANTERIOR_OR_POSTERIOR, IDS.CURING_LIGHT, IDS.ETCHANT, IDS.BONDING_AGENT_VOCO_FUTURABOND_U_SINGLE_DOSE
    ]', 'Vita Shade Guide',
      'Packable Composite (Filtek Supreme Ultra), [Shades A1-C4]', 'Composite Gun',
      'Tofflemire Bands',
      'Glass Ionomer (Fuji II LC), [Shades A1-A4]', 'Glass Ionomer Capsule Applier',
      'Mylar Matrix Strips (.002 mm)', 'Wooden Wedges Medium', 'Fender Wedge',
      'Microbrush', 'Finishing Strips',
      'Enhance Finishing Cup', 'Enhance Finishing Point', 'Super Snap Disk Medium',
      'Dampen Dish', 'Articulating Paper', 'Floss', 'Bur Block',
      'Gauze (2x2)', 'Cotton Rolls',
    ],"""

fixed = """    name: 'Restorative',
    items: [
      IDS.BLOOD_PRESSURE_CUFF, IDS.PULSE_OXIMETER, IDS.SAFETY_GLASSES_PATIENT, IDS.SAFETY_GLASSES_OPERATOR, IDS.STETHOSCOPE,
      'CASSETTE:Operatory Cassette', 'CASSETTE:Rubber Dam Cassette', 'CASSETTE:XTS/Composite Cassette',
      IDS.IRRIGATING_SYRINGE_W_SALINE, IDS.ISOLITE_CORE, IDS.ISOLITE_MOUTHPIECE_ANTERIOR_OR_POSTERIOR,
      IDS.BITE_BLOCK_ANTERIOR_OR_POSTERIOR, IDS.CURING_LIGHT, IDS.ETCHANT, IDS.BONDING_AGENT_VOCO_FUTURABOND_U_SINGLE_DOSE,
      IDS.FLOWABLE_COMPOSITE_3M_FILTEK_SUPREME_SHADES_A1_A4, IDS.VITA_SHADE_GUIDE,
      IDS.PACKABLE_COMPOSITE_FILTEK_SUPREME_ULTRA_SHADES_A1_C4, IDS.COMPOSITE_GUN,
      IDS.TOFFLEMIRE_BANDS,
      IDS.GLASS_IONOMER_FUJI_II_LC_SHADES_A1_A4, IDS.GLASS_IONOMER_CAPSULE_APPLIER,
      IDS.MYLAR_MATRIX_STRIPS_0_002_MM, IDS.WOODEN_WEDGES_MEDIUM, IDS.FENDER_WEDGE,
      IDS.MICROBRUSH, IDS.FINISHING_STRIPS,
      IDS.ENHANCE_FINISHING_CUP, IDS.ENHANCE_FINISHING_POINT, IDS.SUPER_SNAP_DISK_MEDIUM,
      IDS.DAMPEN_DISH, IDS.ARTICULATING_PAPER, IDS.FLOSS, IDS.BUR_BLOCK,
      IDS.GAUZE_2X2, IDS.COTTON_ROLLS
    ],"""

if broken in code:
    code = code.replace(broken, fixed)
    print("Fixed!")
else:
    print("Could not find broken block to replace.")

with open('/Users/james/dispensary-app/src/services/seedService.js', 'w') as f:
    f.write(code)
