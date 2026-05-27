import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Hash PIN using browser's built-in crypto (SHA-256)
// We store the hash, not the PIN itself, so the database never sees raw PINs.
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create a new profile with a PIN
export async function createProfile(profileId, pin, displayName) {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error('PIN must be 4-6 digits');
  }
  if (!profileId || profileId.length < 3) {
    throw new Error('Profile ID must be at least 3 characters');
  }

  // Sign in anonymously so we satisfy the security rules
  await signInAnonymously(auth);

  // Check if profile ID is already taken
  const existing = await getDoc(doc(db, 'profiles', profileId));
  if (existing.exists()) {
    throw new Error('Profile ID already taken');
  }

  const pinHash = await hashPin(pin);
  await setDoc(doc(db, 'profiles', profileId), {
    pinHash,
    displayName: displayName || profileId,
    createdAt: serverTimestamp(),
  });

  localStorage.setItem('activeProfile', profileId);
  return profileId;
}

// Log into an existing profile
export async function loginProfile(profileId, pin) {
  await signInAnonymously(auth);

  const profileDoc = await getDoc(doc(db, 'profiles', profileId));
  if (!profileDoc.exists()) {
    throw new Error('Profile not found');
  }

  const pinHash = await hashPin(pin);
  if (profileDoc.data().pinHash !== pinHash) {
    throw new Error('Incorrect PIN');
  }

  localStorage.setItem('activeProfile', profileId);
  return profileId;
}

export function getActiveProfile() {
  return localStorage.getItem('activeProfile');
}

export function logout() {
  localStorage.removeItem('activeProfile');
  auth.signOut();
}