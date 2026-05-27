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
      'Periosteal Elevator Molt #9',
      'Forceps Maxillary Universal #150',
      'Forceps Mandibular Universal #151',
      'Forceps Max Molar #53R',
      'Forceps Max Molar #53L',
      'Forceps Mand Molar Cowhorn #17',
      'Needle Holder',
      'Tissue Forceps Adson',
      'Scissors Suture',
      'Hemostat',
      'Rongeur',
      'Bone File',
      'Surgical Curette Lucas',
      'Scalpel Handle #3',
      'Crane Pick',
      'Root Tip Elevator',
      'Cryer Elevator',
      'Potts Elevator',
      'Proximator',
      'Spade',
      'Heidbrink Root Tip Pick',
      'Luxator 3mm Curved 1L-3C',
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