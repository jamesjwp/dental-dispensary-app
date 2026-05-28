import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

const CASSETTES = [
  {
    name: 'Perio Cassette',
    color: '#a855f7',
    description: 'Scaling, probing, perio instruments',
    instrumentNames: [
      'Mouth Mirror', 'Periodontal Probe UNC-15', 'Double Ended Explorer', '11/12 Explorer',
      'Nabers Probe', '137 Mini Five Curette / H5 Hygienist Scaler', '204S Sickle Scaler',
      '4R/4L Columbia Universal Curette', '5/6 Gracey Curette', '15/16 Gracey Curette',
      '13/14 Gracey Curette', 'Titanium Implant Scaler', 'Dual Grit Ceramic Stone',
      'Plastic Test Stick', 'Cotton Pliers',
    ],
  },
  {
    name: 'Rubber Dam Cassette',
    color: '#3b82f6',
    description: 'Clamps, frames, hole puncher',
    instrumentNames: [
      'Rubber Dam Child Frame', 'Rubber Dam Adult Frame', 'Rubber Dam Hole Puncher',
      'Rubber Dam Clamp Forcep', 'Rubber Dam Clamp #1', 'Rubber Dam Clamp #2AS',
      'Rubber Dam Clamp #209', 'Rubber Dam Clamp #4', 'Rubber Dam Clamp #5',
      'Rubber Dam Clamp #6', 'Rubber Dam Clamp #7', 'Rubber Dam Clamp #12A',
      'Rubber Dam Clamp #13A', 'Rubber Dam Clamp #14', 'Rubber Dam Clamp #14A',
      'Rubber Dam Clamp #212',
    ],
  },
  {
    name: 'Operatory Cassette',
    color: '#f97316',
    description: 'General restorative instruments',
    instrumentNames: [
      'Mouth Mirror', 'Explorer/Probe', 'Large Excavator/Spoon', 'Small Excavator/Spoon',
      'Posterior Sickle Scaler', 'Cord Packer', 'Hatchet', 'Hoe', 'Hollenback Carver',
      'Discoid Cleoid Carver', 'Large Amalgam Packer', 'Small Amalgam Packer',
      'Egg/Ball Burnisher', 'Acorn Burnisher', 'Calcium Hydroxide Placement', 'Angled Plastic',
      'Plastic', 'Composite Condenser', 'Acorn', 'Ladmore Burnisher', 'Cotton Pliers',
      'Articulating Paper Forceps', 'Spatula/Blade', 'Tofflemire Holder', 'Amalgam Carrier',
      'Amalgam Well', 'Straight Hemostat', 'Scissors',
    ],
  },
  {
    name: 'XTS/Composite Cassette',
    color: '#f97316',
    description: 'XTS composite placement instruments',
    instrumentNames: [
      'TNCCII Condenser', 'TNCIGFTM13 Sculpting/Removing Excess Cement',
      'TNBB21B Form Occlusal Anatomy', 'TNCIGFTM14 Sculpting/Removing Excess Material',
      'TNBBL3 Burnisher/Condenser',
    ],
  },
  {
    name: 'Waxing Cassette',
    color: '#eab308',
    description: 'Wax carving and shaping instruments',
    instrumentNames: ['PKT1', 'PKT2', 'PKT3', 'PKT4', 'PKT5', 'CD3/66', 'CVHL3', 'BB21B6', 'WS7'],
  },
  {
    name: 'Oral Surgery Cassette',
    color: '#ef4444',
    description: 'Elevators, forceps, suture instruments',
    instrumentNames: [
      'Elevator Straight #301', 'Elevator Right Cryer #302', 'Elevator Left Cryer #303',
      'E44/45 Small Cryers', 'E25/26 Medium Cryers', 'Periosteal Elevator Molt #9',
      '#8 Crane Pick Elevator', 'EHB2/3 Root Tip Elevator Picks', 'E19/20 Root Tip Elevators',
      'E6/7 Potts Elevators', 'Proximator Aetranox Sharpened', 'Spade Elevators',
      '13/14 Heidbrink Root Tip Pick', 'Luxator 3mm Curved 1L-3C', 'Luxator 5mm Curved 1L-5C',
      'Forceps Maxillary Universal #150', 'Forceps Mandibular Universal #151',
      '150S Pedo Forceps (Upper)', '151S Pedo Forceps (Lower)', 'Forceps Max Molar #53R',
      'Forceps Max Molar #53L', 'Forceps Mand Molar Cowhorn #17', '23 Forceps (Cowhorn)',
      '23S Pedo Forceps (Cowhorn)', '88R Forceps (UR Molar)', '88L Forceps (UL Molar)',
      '1 Apical Forceps (Upper Anterior)', '74N Apical Forceps (Lower Anterior)',
      '51S Forceps (Upper Roots Serrated)', '45S Forceps (Lower Roots Serrated)',
      '210S Forceps (Upper 3rd Molar)', 'Needle Holder', 'Tissue Forceps Adson',
      'Scissors Suture', 'Hemostat', 'Rongeur', 'Bone File', 'Surgical Curette Lucas',
      'Scalpel Handle #3',
    ],
  },
  {
    name: 'Endo Cassette',
    color: '#6b7280',
    description: 'Endodontic hand instruments',
    instrumentNames: [
      'Endodontic Ruler', 'Endodontic File Stand/Block', 'Spreader', 'Plugger', 'Lentulo Spiral',
    ],
  },
  {
    name: 'Exam Cassette',
    color: '#6b7280',
    description: 'Limited oral exam instruments',
    instrumentNames: ['Probe Exam', 'Mirror Exam', 'Cotton Pliers Exam'],
  },
  {
    name: 'Prosthodontics Cassette',
    color: '#3b82f6',
    description: 'Crown/bridge/prosth instruments',
    instrumentNames: [
      'Retraction Cord Packer', 'Spatula Cement', 'Spatula Mixing Flexible',
      'Glass Slab', 'Crown Remover', 'Scissors Iris',
    ],
  },
];

export async function seedCassettes() {
  const invSnap = await getDocs(collection(db, 'inventory'));
  const itemsByName = new Map();
  invSnap.docs.forEach(d => {
    const data = d.data();
    if (data.name) itemsByName.set(data.name.toLowerCase().trim(), d.id);
  });

  const existing = await getDocs(collection(db, 'cassettes'));
  await Promise.all(existing.docs.map(c => deleteDoc(doc(db, 'cassettes', c.id))));

  const results = [];
  for (const template of CASSETTES) {
    const matched = [];
    const missing = [];
    for (const name of template.instrumentNames) {
      const id = itemsByName.get(name.toLowerCase().trim());
      if (id) matched.push(id);
      else missing.push(name);
    }
    await addDoc(collection(db, 'cassettes'), {
      name: template.name,
      color: template.color,
      description: template.description,
      instrumentIds: matched,
      createdAt: serverTimestamp(),
    });
    results.push({ name: template.name, added: matched.length, missing });
  }
  return results;
}

// Shared tag-or-create helper for inventory seeding.
// templates: [{ name, tags: string|string[], category? }]
async function tagOrCreate(templates, { defaultCategory }) {
  const { updateDoc } = await import('firebase/firestore');
  const invSnap = await getDocs(collection(db, 'inventory'));
  const byName = new Map();
  invSnap.docs.forEach(d => {
    const x = d.data();
    if (x.name) byName.set(x.name.toLowerCase().trim(), { id: d.id, data: x });
  });

  let tagged = 0, created = 0;
  const taggedNames = [], createdNames = [];

  for (const t of templates) {
    const tags = Array.isArray(t.tags) ? t.tags : [t.tags];
    const existing = byName.get(t.name.toLowerCase().trim());
    if (existing) {
      const cur = (existing.data.tags || '').split(',').map(s => s.trim()).filter(Boolean);
      const merged = [...new Set([...cur, ...tags])].join(', ');
      if (merged !== (existing.data.tags || '')) {
        await updateDoc(doc(db, 'inventory', existing.id), { tags: merged });
        tagged++;
        taggedNames.push(t.name);
      }
    } else {
      await addDoc(collection(db, 'inventory'), {
        name: t.name,
        category: t.category || defaultCategory,
        type: 'supply',
        tags: tags.join(', '),
        createdAt: serverTimestamp(),
      });
      created++;
      createdNames.push(t.name);
    }
  }
  return { tagged, created, taggedNames, createdNames };
}

const DRAWER_TAG = 'Drawer Supplies';
const DRAWER_SUPPLIES = [
  'Topical Benzo-Gel : 20% Benzocaine Bubble Gum, Grape, Mint, Pina Colada, Strawberry',
  'Protector Single Handle Needle Sheath Prop Disposable',
  'Prophy Paste Coarse/Med w/Fluoride Asst',
  'Floss', 'Rubber Dam', 'Reveal Disclosing Solution',
  'Surgical Aspirator Tip Green 1/4"', 'Surgical Aspirator Tip White 1/2"',
  'Curved Utility syringe', '0.9 Sodium Chloride Irrigation',
  'Disposable Air/Water Syringe Tips', 'Gauze (2x2)', 'Slow Speed Suction Tube',
  'High Speed Suction Tube', 'Patient Bib', 'Bib Clip', 'Dampen Dish',
  'Microbrush', 'Cardboard Needle ProTector', 'Cotton Swabs', 'Cotton Rolls',
  'Wooden Tongue Depressor', 'Wooden Wedges Medium', 'Wooden Wedges Large',
  'Yellow Plastic Wedges', 'Flowable Composite Tip', 'Etchant Tip', 'Composite Tips',
  'Handheld Mirror',
  'Irrigating Syringe w/ Saline',
  'Tofflemire Bands',
  'Fender Wedge',
  'Articulating Paper',
  'Finishing Strips',
];

const BURS_AND_POLISHERS = [
  { name: '330 Carbide', tags: ['Burs', 'Carbide'] },
  { name: '330 Diamond', tags: ['Burs', 'Diamond'] },
  { name: 'Round Carbide 1/4', tags: ['Burs', 'Carbide', 'Round'] },
  { name: 'Round Carbide 2', tags: ['Burs', 'Carbide', 'Round'] },
  { name: 'Round Carbide 4', tags: ['Burs', 'Carbide', 'Round'] },
  { name: 'Round Carbide 8', tags: ['Burs', 'Carbide', 'Round'] },
  { name: '34 Carbide', tags: ['Burs', 'Carbide'] },
  { name: '56 Carbide', tags: ['Burs', 'Carbide'] },
  { name: '245 Carbide', tags: ['Burs', 'Carbide'] },
  { name: '557 Carbide', tags: ['Burs', 'Carbide'] },
  { name: '7404 Carbide', tags: ['Burs', 'Carbide'] },
  { name: '7664 Carbide', tags: ['Burs', 'Carbide'] },
  { name: 'Diamond Football', tags: ['Burs', 'Diamond'] },
  { name: '8274 016 Diamond', tags: ['Burs', 'Diamond'] },
  { name: 'Coarse Modified Shoulder', tags: ['Burs', 'Diamond', 'Coarse'] },
  { name: 'Coarse Chamfer', tags: ['Burs', 'Diamond', 'Coarse'] },
  { name: 'Fine Shoulder', tags: ['Burs', 'Diamond', 'Fine'] },
  { name: 'End Cutting', tags: ['Burs', 'Diamond'] },
  { name: 'Coarse Needle', tags: ['Burs', 'Diamond', 'Coarse'] },
  { name: 'Extra-Fine Needle', tags: ['Burs', 'Diamond', 'Fine'] },
  { name: 'Coarse Football', tags: ['Burs', 'Diamond', 'Coarse'] },
  { name: '9mm Finisher', tags: ['Burs', 'Finishing'] },
  { name: '6mm Finisher', tags: ['Burs', 'Finishing'] },
  { name: 'Q Finisher', tags: ['Burs', 'Finishing'] },
  { name: 'Enhance Finishing Cup', tags: ['Polishers', 'Finishing'] },
  { name: 'Enhance Finishing Point', tags: ['Polishers', 'Finishing'] },
  { name: 'DC9518M Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Medium'] },
  { name: 'DC9519M Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Medium'] },
  { name: 'DC9520M Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Medium'] },
  { name: 'DC9518F Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Fine'] },
  { name: 'DC9519F Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Fine'] },
  { name: 'DC9520F Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Fine'] },
  { name: 'Super Snap Disk Coarse', tags: ['Polishers', 'Disks', 'Coarse'] },
  { name: 'Super Snap Disk Medium', tags: ['Polishers', 'Disks', 'Medium'] },
  { name: 'Super Snap Disk Fine', tags: ['Polishers', 'Disks', 'Fine'] },
  { name: 'Super Snap Disk Super Fine', tags: ['Polishers', 'Disks', 'Fine'] },
  { name: 'Surgical Bur 557', tags: ['Burs', 'Surgical'] },
  { name: 'Surgical Bur 701', tags: ['Burs', 'Surgical'] },
  { name: 'Surgical Bur 4 Round', tags: ['Burs', 'Surgical', 'Round'] },
  { name: 'Surgical Bur 6 Round', tags: ['Burs', 'Surgical', 'Round'] },
];

export const seedDrawerSupplies = () =>
  tagOrCreate(DRAWER_SUPPLIES.map(name => ({ name, tags: [DRAWER_TAG] })), { defaultCategory: 'Drawer' });

const VITALS_TAG = 'Vitals';
const VITALS = [
  'Blood Pressure Cuff',
  'Pulse Oximeter',
  'Safety Glasses (Patient)',
  'Safety Glasses (Operator)',
  'Stethoscope',
];

export const seedVitals = () =>
  tagOrCreate(VITALS.map(name => ({ name, tags: [VITALS_TAG] })), { defaultCategory: 'Vitals' });

const XRAY_EQUIPMENT_TAG = 'X-ray Equipment';
const XRAY_EQUIPMENT = [
  'X-Ray Digital Sensor / PSP Plate',
  'X-Ray XCP & Sensor Holder Rings',
  'X-Ray Sensor USB Adapter',
  'NOMAD (Portable X-ray gun)',
];

export const seedXrayEquipment = () =>
  tagOrCreate(XRAY_EQUIPMENT.map(name => ({ name, tags: [XRAY_EQUIPMENT_TAG] })), { defaultCategory: 'X-ray Equipment' });

export const seedBursAndPolishers = () =>
  tagOrCreate(BURS_AND_POLISHERS.map(t => ({ ...t, tags: [...t.tags, 'Burs & Polishers'], category: 'Burs & Polishers' })), { defaultCategory: 'Burs & Polishers' });



// General Setup Lists template — matches Procedural_Supplies file
const PROCEDURAL_LISTS = [
  {
    name: 'Comprehensive Exam',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)', 'Stethoscope',
      'CASSETTE:Exam Cassette',
      'X-Ray Digital Sensor / PSP Plate', 'X-Ray XCP & Sensor Holder Rings', 'Intraoral Camera', 'Cheek Retractor',
      'Alginate', 'Impression Trays (Small, Medium, Large)',
      'Mixing Bowl', 'Alginate Spatula', 'Graduated Cylinder', 'Scanning Tip',
      'Gauze (2x2)', 'Cotton Rolls', 'Floss',
    ],
  },
  {
    name: 'Prophy / SRP',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)', 'Stethoscope',
      'CASSETTE:Perio Cassette',
      'Newtron Handpiece (Ultrasonic Scaler)', 'Prophy Handpiece', 'Irrigating Syringe w/ Saline',
      'Chlorhexidine', 'X-Ray Digital Sensor / PSP Plate', 'X-Ray XCP & Sensor Holder Rings',
      'Gauze (2x2)', 'Cotton Rolls', 'Floss',
    ],
  },
  {
    name: 'Urgent Care',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)', 'Stethoscope',
      'CASSETTE:Exam Cassette',
      'X-Ray Digital Sensor / PSP Plate', 'X-Ray XCP & Sensor Holder Rings', 'Intraoral Camera',
      'Tooth Sloth', 'Endo ICE',
      'Gauze (2x2)', 'Cotton Rolls', 'Floss',
    ],
  },
  {
    name: 'Restorative',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)', 'Stethoscope',
      'CASSETTE:Operatory Cassette', 'CASSETTE:Rubber Dam Cassette', 'CASSETTE:XTS/Composite Cassette',
      'Irrigating Syringe w/ Saline',
      'Isolite Core', 'Isolite Mouthpiece (Anterior or Posterior)',
      'Bite Block (Anterior or Posterior)',
      'Curing Light', 'Etchant', 'Bonding Agent (VOCO Futurabond U Single Dose)',
      'Flowable Composite (3M Filtek Supreme), [Shades A1-A4]', 'Vita Shade Guide',
      'Packable Composite (Filtek Supreme Ultra), [Shades A1-C4]', 'Composite Gun',
      'Tofflemire Bands',
      'Glass Ionomer (Fuji II LC), [Shades A1-A4]', 'Glass Ionomer Capsule Applier',
      'Mylar Matrix Strips (.002 mm)', 'Wooden Wedges Medium', 'Fender Wedge',
      'Microbrush', 'Finishing Strips',
      'Enhance Finishing Cup', 'Enhance Finishing Point', 'Super Snap Disk Medium',
      'Dampen Dish', 'Articulating Paper', 'Floss', 'Bur Block',
      'Gauze (2x2)', 'Cotton Rolls',
    ],
  },
  {
    name: 'Oral Surgery',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)', 'Stethoscope',
      'CASSETTE:Oral Surgery Cassette',
      'Bite Block (Anterior or Posterior)',
      'X-Ray Digital Sensor / PSP Plate', 'X-Ray XCP & Sensor Holder Rings',
      'Post-Op Instructions', 'Irrigating Syringe w/ Saline',
      'Surgical Air Driven Handpiece',
      'Surgical Bur 557', 'Surgical Bur 701', 'Surgical Bur 4 Round', 'Surgical Bur 6 Round',
      'Gauze (2x2)', 'Cotton Rolls', 'Floss',
    ],
  },
];

const GENERAL_GROUP_NAME = 'General Setup Lists';

export const PROCEDURAL_LIST_NAMES = PROCEDURAL_LISTS.map(t => t.name);
export async function seedProceduralSetupLists() {
  const { getActiveProfile } = await import('./authService');
  const { addDoc: addDocFn } = await import('firebase/firestore');
  const profileId = getActiveProfile();
  if (!profileId) throw new Error('Not logged in');

  const invSnap = await getDocs(collection(db, 'inventory'));
  const itemsByName = new Map();
  invSnap.docs.forEach(d => {
    const data = d.data();
    if (data.name) itemsByName.set(data.name.toLowerCase().trim(), d.id);
  });

  const cassetteSnap = await getDocs(collection(db, 'cassettes'));
  const cassettesByName = new Map();
  cassetteSnap.docs.forEach(d => {
    const data = d.data();
    if (data.name) cassettesByName.set(data.name.toLowerCase().trim(), d.id);
  });

  const groupsRef = collection(db, 'profiles', profileId, 'presetGroups');
  const groupsSnap = await getDocs(groupsRef);
  const generalGroup = groupsSnap.docs.find(d => d.data().name === GENERAL_GROUP_NAME);
  let generalGroupId;
  if (generalGroup) {
    generalGroupId = generalGroup.id;
  } else {
    const newGroup = await addDocFn(groupsRef, { name: GENERAL_GROUP_NAME, createdAt: serverTimestamp() });
    generalGroupId = newGroup.id;
  }

  const presetsRef = collection(db, 'profiles', profileId, 'presetGroups', generalGroupId, 'presets');
  const existingPresets = await getDocs(presetsRef);
  const existingNames = new Set(existingPresets.docs.map(d => d.data().name));

  let created = 0, skipped = 0;
  const missingItems = [];

  for (const template of PROCEDURAL_LISTS) {
    if (existingNames.has(template.name)) { skipped++; continue; }

    const presetItems = [];
    for (const entry of template.items) {
      if (entry.startsWith('CASSETTE:')) {
        const cassetteName = entry.slice('CASSETTE:'.length);
        const cassetteId = cassettesByName.get(cassetteName.toLowerCase().trim());
        if (cassetteId) presetItems.push({ type: 'cassette', cassetteId });
        else missingItems.push(`[Cassette] ${cassetteName}`);
      } else {
        let inventoryId = itemsByName.get(entry.toLowerCase().trim());
        if (!inventoryId) {
          const newItem = await addDocFn(collection(db, 'inventory'), {
            name: entry, category: 'Procedural', type: 'supply', tags: 'Procedural',
            createdAt: serverTimestamp(),
          });
          inventoryId = newItem.id;
          itemsByName.set(entry.toLowerCase().trim(), inventoryId);
          missingItems.push(entry);
        }
        presetItems.push({ type: 'item', inventoryId, customName: '', notes: '', quantity: 1 });
      }
    }

    await addDocFn(presetsRef, { name: template.name, items: presetItems, createdAt: serverTimestamp() });
    created++;
  }

  return { created, skipped, missingItems };
}

export async function seedSingleProceduralList(name) {
  const template = PROCEDURAL_LISTS.find(t => t.name === name);
  if (!template) throw new Error(`No default list named "${name}"`);

  const { getActiveProfile } = await import('./authService');
  const { addDoc: addDocFn } = await import('firebase/firestore');
  const profileId = getActiveProfile();
  if (!profileId) throw new Error('Not logged in');

  const invSnap = await getDocs(collection(db, 'inventory'));
  const itemsByName = new Map();
  invSnap.docs.forEach(d => {
    const data = d.data();
    if (data.name) itemsByName.set(data.name.toLowerCase().trim(), d.id);
  });

  const cassetteSnap = await getDocs(collection(db, 'cassettes'));
  const cassettesByName = new Map();
  cassetteSnap.docs.forEach(d => {
    const data = d.data();
    if (data.name) cassettesByName.set(data.name.toLowerCase().trim(), d.id);
  });

  const groupsRef = collection(db, 'profiles', profileId, 'presetGroups');
  const groupsSnap = await getDocs(groupsRef);
  const generalGroup = groupsSnap.docs.find(d => d.data().name === GENERAL_GROUP_NAME);
  let generalGroupId;
  if (generalGroup) {
    generalGroupId = generalGroup.id;
  } else {
    const newGroup = await addDocFn(groupsRef, { name: GENERAL_GROUP_NAME, createdAt: serverTimestamp() });
    generalGroupId = newGroup.id;
  }

  const presetsRef = collection(db, 'profiles', profileId, 'presetGroups', generalGroupId, 'presets');
  const existingPresets = await getDocs(presetsRef);
  if (existingPresets.docs.some(d => d.data().name === name)) {
    throw new Error(`"${name}" already exists`);
  }

  const presetItems = [];
  for (const entry of template.items) {
    if (entry.startsWith('CASSETTE:')) {
      const cassetteName = entry.slice('CASSETTE:'.length);
      const cassetteId = cassettesByName.get(cassetteName.toLowerCase().trim());
      if (cassetteId) presetItems.push({ type: 'cassette', cassetteId });
    } else {
      let inventoryId = itemsByName.get(entry.toLowerCase().trim());
      if (!inventoryId) {
        const newItem = await addDocFn(collection(db, 'inventory'), {
          name: entry, category: 'Procedural', type: 'supply', tags: 'Procedural',
          createdAt: serverTimestamp(),
        });
        inventoryId = newItem.id;
      }
      presetItems.push({ type: 'item', inventoryId, customName: '', notes: '', quantity: 1 });
    }
  }

  return await addDocFn(presetsRef, {
    name: template.name,
    items: presetItems,
    order: existingPresets.docs.length,
    createdAt: serverTimestamp(),
  });
}