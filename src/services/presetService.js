import { db } from '../firebase';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getActiveProfile } from './authService';

function groupsRef() {
  const profileId = getActiveProfile();
  if (!profileId) throw new Error('Not logged in');
  return collection(db, 'profiles', profileId, 'presetGroups');
}

function presetsRef(groupId) {
  const profileId = getActiveProfile();
  if (!profileId) throw new Error('Not logged in');
  return collection(db, 'profiles', profileId, 'presetGroups', groupId, 'presets');
}

function presetDoc(groupId, presetId) {
  const profileId = getActiveProfile();
  return doc(db, 'profiles', profileId, 'presetGroups', groupId, 'presets', presetId);
}

// --- PRESET GROUPS ---
export async function createGroup(name) {
  return await addDoc(groupsRef(), { name, createdAt: serverTimestamp() });
}

export async function getGroups() {
  const snapshot = await getDocs(groupsRef());
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function renameGroup(groupId, newName) {
  const profileId = getActiveProfile();
  await updateDoc(doc(db, 'profiles', profileId, 'presetGroups', groupId), { name: newName });
}

export async function deleteGroup(groupId) {
  const profileId = getActiveProfile();
  // Cascade delete all presets in this group first
  const presets = await getDocs(presetsRef(groupId));
  await Promise.all(presets.docs.map(p => deleteDoc(p.ref)));
  await deleteDoc(doc(db, 'profiles', profileId, 'presetGroups', groupId));
}

// --- PRESETS ---
export async function createPreset(groupId, name, items = []) {
  return await addDoc(presetsRef(groupId), {
    name, items, createdAt: serverTimestamp(),
  });
}

export async function getPresets(groupId) {
  const snapshot = await getDocs(presetsRef(groupId));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function renamePreset(groupId, presetId, newName) {
  await updateDoc(presetDoc(groupId, presetId), { name: newName });
}

export async function deletePreset(groupId, presetId) {
  await deleteDoc(presetDoc(groupId, presetId));
}

export async function duplicatePreset(groupId, presetId) {
  const snap = await getDoc(presetDoc(groupId, presetId));
  if (!snap.exists()) throw new Error('Preset not found');
  const original = snap.data();
  return await addDoc(presetsRef(groupId), {
    name: `${original.name} (copy)`,
    items: original.items || [],
    createdAt: serverTimestamp(),
  });
}

// Add a supply or instrument to a preset
// If same inventoryId already exists (no customName), increment quantity
export async function addItemToPreset(groupId, presetId, inventoryId, customName = '', notes = '') {
  const snap = await getDoc(presetDoc(groupId, presetId));
  if (!snap.exists()) throw new Error('Preset not found');
  const items = snap.data().items || [];
  const existingIdx = items.findIndex(it =>
    it.type !== 'cassette' && it.inventoryId === inventoryId && !it.customName
  );
  if (existingIdx >= 0) {
    items[existingIdx].quantity = (items[existingIdx].quantity || 1) + 1;
  } else {
    items.push({ type: 'item', inventoryId, customName, notes, quantity: 1 });
  }
  await updateDoc(presetDoc(groupId, presetId), { items });
}

// Add a cassette to a preset (one cassette per preset, no duplicates)
export async function addCassetteToPreset(groupId, presetId, cassetteId) {
  const snap = await getDoc(presetDoc(groupId, presetId));
  if (!snap.exists()) throw new Error('Preset not found');
  const items = snap.data().items || [];
  const alreadyIn = items.some(it => it.type === 'cassette' && it.cassetteId === cassetteId);
  if (alreadyIn) throw new Error('Cassette already in this preset');
  items.push({ type: 'cassette', cassetteId });
  await updateDoc(presetDoc(groupId, presetId), { items });
}

export async function removeItemFromPreset(groupId, presetId, itemIndex) {
  const snap = await getDoc(presetDoc(groupId, presetId));
  if (!snap.exists()) throw new Error('Preset not found');
  const items = snap.data().items || [];
  items.splice(itemIndex, 1);
  await updateDoc(presetDoc(groupId, presetId), { items });
}

export async function updateItemInPreset(groupId, presetId, itemIndex, updates) {
  const snap = await getDoc(presetDoc(groupId, presetId));
  if (!snap.exists()) throw new Error('Preset not found');
  const items = snap.data().items || [];
  items[itemIndex] = { ...items[itemIndex], ...updates };
  await updateDoc(presetDoc(groupId, presetId), { items });
}

export async function reorderItemInPreset(groupId, presetId, fromIndex, toIndex) {
  const snap = await getDoc(presetDoc(groupId, presetId));
  if (!snap.exists()) throw new Error('Preset not found');
  const items = snap.data().items || [];
  if (toIndex < 0 || toIndex >= items.length) return;
  const [moved] = items.splice(fromIndex, 1);
  items.splice(toIndex, 0, moved);
  await updateDoc(presetDoc(groupId, presetId), { items });
}