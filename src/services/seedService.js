import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

const CASSETTES = [
  {
    name: 'Perio Cassette',
    color: '#a855f7',
    description: 'Scaling, probing, perio instruments',
    instrumentNames: [
      'Mouth Mirror',
      'Periodontal Probe UNC-15',
      'Double Ended Explorer',
      '11/12 Explorer',
      'Nabers Probe',
      '137 Mini Five Curette / H5 Hygienist Scaler',
      '204S Sickle Scaler',
      '4R/4L Columbia Universal Curette',
      '5/6 Gracey Curette',
      '15/16 Gracey Curette',
      '13/14 Gracey Curette',
      'Titanium Implant Scaler',
      'Dual Grit Ceramic Stone',
      'Plastic Test Stick',
      'Cotton Pliers',
    ],
  },
  {
    name: 'Rubber Dam Cassette',
    color: '#3b82f6',
    description: 'Clamps, frames, hole puncher',
    instrumentNames: [
      'Rubber Dam Child Frame',
      'Rubber Dam Adult Frame',
      'Rubber Dam Hole Puncher',
      'Rubber Dam Clamp Forcep',
      'Rubber Dam Clamp #1',
      'Rubber Dam Clamp #2AS',
      'Rubber Dam Clamp #209',
      'Rubber Dam Clamp #4',
      'Rubber Dam Clamp #5',
      'Rubber Dam Clamp #6',
      'Rubber Dam Clamp #7',
      'Rubber Dam Clamp #12A',
      'Rubber Dam Clamp #13A',
      'Rubber Dam Clamp #14',
      'Rubber Dam Clamp #14A',
      'Rubber Dam Clamp #212',
    ],
  },
  {
    name: 'Operatory Cassette',
    color: '#f97316',
    description: 'General restorative instruments',
    instrumentNames: [
      'Mouth Mirror',
      'Explorer/Probe',
      'Large Excavator/Spoon',
      'Small Excavator/Spoon',
      'Posterior Sickle Scaler',
      'Cord Packer',
      'Hatchet',
      'Hoe',
      'Hollenback Carver',
      'Discoid Cleoid Carver',
      'Large Amalgam Packer',
      'Small Amalgam Packer',
      'Egg/Ball Burnisher',
      'Acorn Burnisher',
      'Calcium Hydroxide Placement',
      'Angled Plastic',
      'Plastic',
      'Composite Condenser',
      'Acorn',
      'Ladmore Burnisher',
      'Cotton Pliers',
      'Articulating Paper Forceps',
      'Spatula/Blade',
      'Tofflemire Holder',
      'Amalgam Carrier',
      'Amalgam Well',
      'Straight Hemostat',
      'Scissors',
    ],
  },
  {
    name: 'XTS/Composite Cassette',
    color: '#f97316',
    description: 'XTS composite placement instruments',
    instrumentNames: [
      'TNCCII Condenser',
      'TNCIGFTM13 Sculpting/Removing Excess Cement',
      'TNBB21B Form Occlusal Anatomy',
      'TNCIGFTM14 Sculpting/Removing Excess Material',
      'TNBBL3 Burnisher/Condenser',
    ],
  },
  {
    name: 'Waxing Cassette',
    color: '#eab308',
    description: 'Wax carving and shaping instruments',
    instrumentNames: [
      'PKT1', 'PKT2', 'PKT3', 'PKT4', 'PKT5',
      'CD3/66', 'CVHL3', 'BB21B6', 'WS7',
    ],
  },
  {
    name: 'Oral Surgery Cassette',
    color: '#ef4444',
    description: 'Elevators, forceps, suture instruments',
    instrumentNames: [
      'Elevator Straight #301',
      'Elevator Right Cryer #302',
      'Elevator Left Cryer #303',
      'E44/45 Small Cryers',
      'E25/26 Medium Cryers',
      'Periosteal Elevator Molt #9',
      '#8 Crane Pick Elevator',
      'EHB2/3 Root Tip Elevator Picks',
      'E19/20 Root Tip Elevators',
      'E6/7 Potts Elevators',
      'Proximator Aetranox Sharpened',
      'Spade Elevators',
      '13/14 Heidbrink Root Tip Pick',
      'Luxator 3mm Curved 1L-3C',
      'Luxator 5mm Curved 1L-5C',
      'Forceps Maxillary Universal #150',
      'Forceps Mandibular Universal #151',
      '150S Pedo Forceps (Upper)',
      '151S Pedo Forceps (Lower)',
      'Forceps Max Molar #53R',
      'Forceps Max Molar #53L',
      'Forceps Mand Molar Cowhorn #17',
      '23 Forceps (Cowhorn)',
      '23S Pedo Forceps (Cowhorn)',
      '88R Forceps (UR Molar)',
      '88L Forceps (UL Molar)',
      '1 Apical Forceps (Upper Anterior)',
      '74N Apical Forceps (Lower Anterior)',
      '51S Forceps (Upper Roots Serrated)',
      '45S Forceps (Lower Roots Serrated)',
      '210S Forceps (Upper 3rd Molar)',
      'Needle Holder',
      'Tissue Forceps Adson',
      'Scissors Suture',
      'Hemostat',
      'Rongeur',
      'Bone File',
      'Surgical Curette Lucas',
      'Scalpel Handle #3',
    ],
  },
  {
    name: 'Endo Cassette',
    color: '#6b7280',
    description: 'Endodontic hand instruments',
    instrumentNames: [
      'Endodontic Ruler',
      'Endodontic File Stand/Block',
      'Spreader',
      'Plugger',
      'Lentulo Spiral',
    ],
  },
  {
    name: 'Exam Cassette',
    color: '#6b7280',
    description: 'Limited oral exam instruments',
    instrumentNames: [
      'Probe Exam',
      'Mirror Exam',
      'Cotton Pliers Exam',
    ],
  },
  {
    name: 'Prosthodontics Cassette',
    color: '#3b82f6',
    description: 'Crown/bridge/prosth instruments',
    instrumentNames: [
      'Retraction Cord Packer',
      'Spatula Cement',
      'Spatula Mixing Flexible',
      'Glass Slab',
      'Crown Remover',
      'Scissors Iris',
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

  // Delete all existing cassettes first — wait for ALL deletes before proceeding
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

// Drawer Supplies template
// Items found in the portable table/drawer of every operatory.
// Matches existing inventory by name and adds the "Drawer Supplies" tag.
// Items not found get CREATED with the tag.
const DRAWER_SUPPLIES = [
  // Likely already in dispensary inventory (will be tagged):
  'Topical Benzo-Gel : 20% Benzocaine Bubble Gum, Grape, Mint, Pina Colada, Strawberry',
  'Protector Single Handle Needle Sheath Prop Disposable',
  'Prophy Paste Coarse/Med w/Fluoride Asst',
  'Floss Single Nylon Strands',
  'Rubber Dam',
  'Reveal Disclosing Solution',
  'Surgical Aspirator Tip Green 1/4"',
  'Surgical Aspirator Tip White 1/2"',
  'Curved Utility syringe',
  '0.9 Sodium Chloride Irrigation',

  // Drawer-only items (will be created if missing):
  'Disposable Air/Water Syringe Tips',
  'Gauze 2x2',
  'Slow Speed Suction Tube',
  'High Speed Suction Tube',
  'Patient Bib',
  'Bib Clip',
  'Plastic Dispensing Well',
  'Microbrush',
  'Cardboard Needle ProTector',
  'Cotton Swabs',
  'Cotton Rolls',
  'Wooden Tongue Depressor',
  'Wooden Wedges Medium',
  'Wooden Wedges Large',
  'Yellow Plastic Wedges',
  'Flowable Composite Tip',
  'Etchant Tip',
  'Composite Tips',
  'Handheld Mirror',
];

const DRAWER_TAG = 'Drawer Supplies';

// Helper: add a tag to a comma-separated tag string without duplicating
function addTagToString(existingTags, newTag) {
  const tags = (existingTags || '').split(',').map(t => t.trim()).filter(Boolean);
  if (tags.includes(newTag)) return existingTags || '';
  tags.push(newTag);
  return tags.join(', ');
}

export async function seedDrawerSupplies() {
  const { updateDoc } = await import('firebase/firestore');
  const invSnap = await getDocs(collection(db, 'inventory'));
  const itemsByName = new Map();
  invSnap.docs.forEach(d => {
    const data = d.data();
    if (data.name) itemsByName.set(data.name.toLowerCase().trim(), { id: d.id, data });
  });

  let tagged = 0;
  let created = 0;
  const taggedNames = [];
  const createdNames = [];

  for (const name of DRAWER_SUPPLIES) {
    const key = name.toLowerCase().trim();
    const existing = itemsByName.get(key);
    if (existing) {
      const newTags = addTagToString(existing.data.tags, DRAWER_TAG);
      if (newTags !== (existing.data.tags || '')) {
        await updateDoc(doc(db, 'inventory', existing.id), { tags: newTags });
        tagged++;
        taggedNames.push(name);
      }
    } else {
      await addDoc(collection(db, 'inventory'), {
        name,
        category: 'Drawer',
        type: 'supply',
        tags: DRAWER_TAG,
        createdAt: serverTimestamp(),
      });
      created++;
      createdNames.push(name);
    }
  }
  return { tagged, created, taggedNames, createdNames };
}

// Burs and Polishers template
// Rotary instruments stocked in the dispensary. Tagged by type for filtering.
const BURS_AND_POLISHERS = [
  // Carbide burs
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

  // Diamond burs
  { name: 'Diamond Football', tags: ['Burs', 'Diamond'] },
  { name: '8274 016 Diamond', tags: ['Burs', 'Diamond'] },
  { name: 'Coarse Modified Shoulder', tags: ['Burs', 'Diamond', 'Coarse'] },
  { name: 'Coarse Chamfer', tags: ['Burs', 'Diamond', 'Coarse'] },
  { name: 'Fine Shoulder', tags: ['Burs', 'Diamond', 'Fine'] },
  { name: 'End Cutting', tags: ['Burs', 'Diamond'] },
  { name: 'Coarse Needle', tags: ['Burs', 'Diamond', 'Coarse'] },
  { name: 'Extra-Fine Needle', tags: ['Burs', 'Diamond', 'Fine'] },
  { name: 'Coarse Football', tags: ['Burs', 'Diamond', 'Coarse'] },

  // Finishers
  { name: '9mm Finisher', tags: ['Burs', 'Finishing'] },
  { name: '6mm Finisher', tags: ['Burs', 'Finishing'] },
  { name: 'Q Finisher', tags: ['Burs', 'Finishing'] },

  // Polishers
  { name: 'Enhance Finishing Cup', tags: ['Polishers', 'Finishing'] },
  { name: 'Enhance Finishing Point', tags: ['Polishers', 'Finishing'] },
  { name: 'DC9518M Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Medium'] },
  { name: 'DC9519M Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Medium'] },
  { name: 'DC9520M Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Medium'] },
  { name: 'DC9518F Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Fine'] },
  { name: 'DC9519F Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Fine'] },
  { name: 'DC9520F Diamond Composite Polisher', tags: ['Polishers', 'Diamond', 'Fine'] },

  // Super Snap Disks
  { name: 'Super Snap Disk Coarse', tags: ['Polishers', 'Disks', 'Coarse'] },
  { name: 'Super Snap Disk Medium', tags: ['Polishers', 'Disks', 'Medium'] },
  { name: 'Super Snap Disk Fine', tags: ['Polishers', 'Disks', 'Fine'] },
  { name: 'Super Snap Disk Super Fine', tags: ['Polishers', 'Disks', 'Fine'] },
];

export async function seedBursAndPolishers() {
  const { updateDoc } = await import('firebase/firestore');
  const invSnap = await getDocs(collection(db, 'inventory'));
  const itemsByName = new Map();
  invSnap.docs.forEach(d => {
    const data = d.data();
    if (data.name) itemsByName.set(data.name.toLowerCase().trim(), { id: d.id, data });
  });

  let tagged = 0;
  let created = 0;
  const taggedNames = [];
  const createdNames = [];

  for (const template of BURS_AND_POLISHERS) {
    const key = template.name.toLowerCase().trim();
    const existing = itemsByName.get(key);
    const tagString = template.tags.join(', ');

    if (existing) {
      const existingTags = (existing.data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      const mergedTags = [...new Set([...existingTags, ...template.tags])];
      const newTagString = mergedTags.join(', ');
      if (newTagString !== (existing.data.tags || '')) {
        await updateDoc(doc(db, 'inventory', existing.id), { tags: newTagString });
        tagged++;
        taggedNames.push(template.name);
      }
    } else {
      await addDoc(collection(db, 'inventory'), {
        name: template.name,
        category: 'Burs & Polishers',
        type: 'supply',
        tags: tagString,
        createdAt: serverTimestamp(),
      });
      created++;
      createdNames.push(template.name);
    }
  }
  return { tagged, created, taggedNames, createdNames };
}

// General Setup Lists template — matches Procedural_Supplies file
// Items prefixed with "CASSETTE:" are looked up as cassettes; others are inventory items.
const PROCEDURAL_LISTS = [
  {
    name: 'Comprehensive Exam',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)',
      'CASSETTE:Exam Cassette',
      'Digital Sensor / PSP Plate', 'Sensor Holder Rings', 'Intraoral Camera', 'Cheek Retractor',
      'Alginate', 'Impression Tray Small', 'Impression Tray Medium', 'Impression Tray Large',
      'Mixing Bowl', 'Alginate Spatula', 'Graduated Cylinder', 'Scanning Tip',
    ],
  },
  {
    name: 'Prophy / SRP',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)',
      'CASSETTE:Perio Cassette',
      'Newtron Handpiece (Ultrasonic Scaler)', 'Prophy Handpiece', 'Irrigating Syringe',
      'Chlorhexidine', 'Digital Sensor / PSP Plate', 'Sensor Holder Rings',
    ],
  },
  {
    name: 'Urgent Care',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)',
      'CASSETTE:Exam Cassette',
      'Digital Sensor / PSP Plate', 'Sensor Holder Rings', 'Intraoral Camera',
      'Tooth Sloth', 'Endo ICE Cool Spray',
    ],
  },
  {
    name: 'Restorative',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)',
      'CASSETTE:Operatory Cassette', 'CASSETTE:Rubber Dam Cassette', 'CASSETTE:XTS/Composite Cassette',
      'Rubber Dam Clamp (assorted)', 'Irrigating Syringe',
      'Isolite Core', 'Isolite Anterior Mouthpiece', 'Isolite Posterior Mouthpiece',
      'Bite Block (Anterior)', 'Bite Block (Posterior)',
      'Curing Light', 'Etch Gel 1.2 Syringe', 'VOCO Futurabond U Single Dose Bond',
      '3M Filtek Supreme Flowable Composite Syringe A1-A4', 'Vita Shade Guide',
      'Filtek Supreme Ultra Capsule A1-C4', 'Composite Gun',
      'Tofflemire bands', 'Pro-matrix Band Wide 6mm (Preset tofflemire bands)', 'AutoMatrix Kit',
      'Fuji II LC Capsule A1-A4', 'GC Capsule Applier',
      'Mylar Matrix Strips .002', 'Wooden Wedges Medium', 'Anatomical Wooden Wedge', 'Fender Wedge',
      'Microbrush', 'Sof-lex Finishing Strips',
      'Enhance Finishing Cup', 'Enhance Finishing Point', 'Super Snap Disk Medium',
      'Dampen Dish', 'Articulating Paper', 'Floss Single Nylon Strands', 'Bur Block',
    ],
  },
  {
    name: 'Oral Surgery',
    items: [
      'Blood Pressure Cuff', 'Pulse Oximeter', 'Safety Glasses (Patient)', 'Safety Glasses (Operator)',
      'CASSETTE:Oral Surgery Cassette',
      'Bite Block (Anterior)',
      'Digital Sensor / PSP Plate', 'Sensor Holder Rings',
      'Post-Op Instructions', 'Saline Syringe',
      'Surgical Air Driven Handpiece',
      'Surgical Bur 557', 'Surgical Bur 701', 'Surgical Bur 4 Round', 'Surgical Bur 6 Round',
    ],
  },
];

const GENERAL_GROUP_NAME = 'General Setup Lists';

export async function seedProceduralSetupLists() {
  const { getActiveProfile } = await import('./authService');
  const { addDoc: addDocFn, updateDoc: updateDocFn } = await import('firebase/firestore');
  const profileId = getActiveProfile();
  if (!profileId) throw new Error('Not logged in');

  // Build lookup maps
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

  // Find or create "General Setup Lists" group
  const groupsRef = collection(db, 'profiles', profileId, 'presetGroups');
  const groupsSnap = await getDocs(groupsRef);
  let generalGroup = groupsSnap.docs.find(d => d.data().name === GENERAL_GROUP_NAME);
  let generalGroupId;
  if (generalGroup) {
    generalGroupId = generalGroup.id;
  } else {
    const newGroup = await addDocFn(groupsRef, { name: GENERAL_GROUP_NAME, createdAt: serverTimestamp() });
    generalGroupId = newGroup.id;
  }

  // Get existing presets in this group
  const presetsRef = collection(db, 'profiles', profileId, 'presetGroups', generalGroupId, 'presets');
  const existingPresets = await getDocs(presetsRef);
  const existingNames = new Set(existingPresets.docs.map(d => d.data().name));

  let created = 0;
  let skipped = 0;
  const missingItems = [];

  for (const template of PROCEDURAL_LISTS) {
    if (existingNames.has(template.name)) {
      skipped++;
      continue;
    }

    const presetItems = [];
    for (const entry of template.items) {
      if (entry.startsWith('CASSETTE:')) {
        const cassetteName = entry.slice('CASSETTE:'.length);
        const cassetteId = cassettesByName.get(cassetteName.toLowerCase().trim());
        if (cassetteId) {
          presetItems.push({ type: 'cassette', cassetteId });
        } else {
          missingItems.push(`[Cassette] ${cassetteName}`);
        }
      } else {
        const inventoryId = itemsByName.get(entry.toLowerCase().trim());
        if (inventoryId) {
          presetItems.push({ type: 'item', inventoryId, customName: '', notes: '', quantity: 1 });
        } else {
          // Create as a placeholder inventory item so it shows up
          const newItem = await addDocFn(collection(db, 'inventory'), {
            name: entry,
            category: 'Procedural',
            type: 'supply',
            tags: 'Procedural',
            createdAt: serverTimestamp(),
          });
          itemsByName.set(entry.toLowerCase().trim(), newItem.id);
          presetItems.push({ type: 'item', inventoryId: newItem.id, customName: '', notes: '', quantity: 1 });
          missingItems.push(entry);
        }
      }
    }

    await addDocFn(presetsRef, {
      name: template.name,
      items: presetItems,
      createdAt: serverTimestamp(),
    });
    created++;
  }

  return { created, skipped, missingItems };
}