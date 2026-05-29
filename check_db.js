import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = { projectId: "demo-dispensary" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const invSnap = await getDocs(collection(db, "inventory"));
  const items = invSnap.docs.map(d => d.data());
  const cup = items.find(i => i.name === "Enhance Finishing Cup");
  console.log("Enhance Finishing Cup:", cup);
  
  const floss = items.find(i => i.name === "Floss");
  console.log("Floss:", floss);
}

check();
