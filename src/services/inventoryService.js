import { db } from '../firebase';
import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  writeBatch, serverTimestamp
} from 'firebase/firestore';
import Papa from 'papaparse';

const COLLECTION = 'inventory';

// CREATE a single item
export async function addItem(item) {
  return await addDoc(collection(db, COLLECTION), {
    ...item,
    createdAt: serverTimestamp(),
  });
}

// READ items
// By default, archived items are excluded. Pass { includeArchived: true } to get everything.
export async function getAllItems({ includeArchived = false } = {}) {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return includeArchived ? items : items.filter(i => !i.archived);
}

// UPDATE an item
export async function updateItem(itemId, updates) {
  await updateDoc(doc(db, COLLECTION, itemId), updates);
}

// Archive (soft delete) an item. Pass { hard: true } to permanently delete.
export async function deleteItem(itemId, { hard = false } = {}) {
  if (hard) {
    await deleteDoc(doc(db, COLLECTION, itemId));
  } else {
    await updateDoc(doc(db, COLLECTION, itemId), { archived: true, archivedAt: serverTimestamp() });
  }
}

// Restore an archived item
export async function restoreItem(itemId) {
  await updateDoc(doc(db, COLLECTION, itemId), { archived: false, archivedAt: null });
}

// BULK IMPORT from CSV with duplicate detection
// Matches existing items by name (case-insensitive). Existing items are UPDATED, new ones are ADDED.
export async function importCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const existingSnap = await getDocs(collection(db, COLLECTION));
          const existingByName = new Map();
          existingSnap.docs.forEach(d => {
            const name = (d.data().name || '').toLowerCase().trim();
            if (name) existingByName.set(name, d.id);
          });

          const items = results.data;
          let added = 0;
          let updated = 0;
          const batches = [];
          let batch = writeBatch(db);
          let opsInBatch = 0;

          for (const item of items) {
            const key = (item.name || '').toLowerCase().trim();
            if (!key) continue;

            if (existingByName.has(key)) {
              const ref = doc(db, COLLECTION, existingByName.get(key));
              batch.update(ref, { ...item });
              updated++;
            } else {
              const ref = doc(collection(db, COLLECTION));
              batch.set(ref, { ...item, createdAt: serverTimestamp() });
              added++;
            }
            opsInBatch++;

            if (opsInBatch >= 500) {
              batches.push(batch.commit());
              batch = writeBatch(db);
              opsInBatch = 0;
            }
          }
          if (opsInBatch > 0) batches.push(batch.commit());
          await Promise.all(batches);
          resolve({ added, updated, total: added + updated });
        } catch (err) {
          reject(err);
        }
      },
      error: reject,
    });
  });
}

// DELETE ALL items (hard delete, useful for re-importing fresh)
export async function deleteAllItems() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const batches = [];
  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += 500) {
    const batch = writeBatch(db);
    docs.slice(i, i + 500).forEach(d => batch.delete(d.ref));
    batches.push(batch.commit());
  }
  await Promise.all(batches);
  return docs.length;
}