import { db } from '../firebase';
import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

const COLLECTION = 'cassettes';

// Default color palette — matches the design from the slides
export const CASSETTE_COLORS = [
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'yellow', value: '#eab308' },
  { name: 'green', value: '#22c55e' },
  { name: 'teal', value: '#14b8a6' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'purple', value: '#a855f7' },
  { name: 'grey', value: '#6b7280' },
];

// CREATE
export async function addCassette({ name, color, description = '', instrumentIds = [] }) {
  return await addDoc(collection(db, COLLECTION), {
    name,
    color: color || CASSETTE_COLORS[0].value,
    description,
    instrumentIds,
    createdAt: serverTimestamp(),
  });
}

// READ all
export async function getAllCassettes() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// UPDATE (name, color, description, or instrument list)
export async function updateCassette(cassetteId, updates) {
  await updateDoc(doc(db, COLLECTION, cassetteId), updates);
}

// DELETE
export async function deleteCassette(cassetteId) {
  await deleteDoc(doc(db, COLLECTION, cassetteId));
}

// Add an instrument to a cassette
export async function addInstrumentToCassette(cassetteId, instrumentId, currentInstrumentIds) {
  if (currentInstrumentIds.includes(instrumentId)) return; // already in cassette
  await updateDoc(doc(db, COLLECTION, cassetteId), {
    instrumentIds: [...currentInstrumentIds, instrumentId],
  });
}

// Remove an instrument from a cassette
export async function removeInstrumentFromCassette(cassetteId, instrumentId, currentInstrumentIds) {
  await updateDoc(doc(db, COLLECTION, cassetteId), {
    instrumentIds: currentInstrumentIds.filter(id => id !== instrumentId),
  });
}