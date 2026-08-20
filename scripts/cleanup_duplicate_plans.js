import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBy6s123sntfr869PqbCtB-70Ee1hx5ZHk",
  authDomain: "website-cf544.firebaseapp.com",
  projectId: "website-cf544",
  storageBucket: "website-cf544.firebasestorage.app",
  messagingSenderId: "850601207355",
  appId: "1:850601207355:web:86566ef3e4620ace2a9e1e",
  measurementId: "G-EWVKPXNPQ5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function normalizeKey(str) {
  if (!str) return '';
  const s = String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s.includes('1day') || s === '1d') return '1day';
  if (s.includes('3day') || s === '3d') return '3days';
  if (s.includes('1week') || s.includes('7day') || s.includes('7d') || s === '1w') return '1week';
  if (s.includes('2week') || s.includes('14day') || s.includes('14d') || s === '2w') return '2weeks';
  if (s.includes('1month') || s.includes('30day') || s.includes('30d') || s === '1m') return '1month';
  if (s.includes('2month') || s.includes('60day') || s.includes('60d') || s === '2m') return '2months';
  if (s.includes('1year') || s.includes('365day') || s === '1y') return '1year';
  if (s.includes('2year') || s.includes('730day') || s === '2y') return '2years';
  if (s.includes('developing') || s.includes('lifetime') || s.includes('forever') || s.includes('perm')) return 'lifetime';
  return s;
}

async function cleanup() {
  console.log('Fetching price_plans from Firestore...');
  const snap = await getDocs(collection(db, 'price_plans'));
  console.log(`Found total ${snap.docs.length} plan documents.`);

  const seen = new Map();
  const toDelete = [];

  // Sort docs: prefer docs with latest updated_date or created_date
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  for (const docData of docs) {
    const panel = docData.panel_type || 'external';
    const category = docData.category || 'general';
    const normDuration = normalizeKey(docData.label || docData.days);
    const key = `${panel}_${category}_${normDuration}`;

    if (seen.has(key)) {
      console.log(`Duplicate found to delete: ID ${docData.id} [${panel} / ${category} / ${docData.label} / Rs. ${docData.lkr}]`);
      toDelete.push(docData.id);
    } else {
      seen.set(key, docData.id);
    }
  }

  console.log(`\nDeleting ${toDelete.length} duplicate documents...`);
  for (const id of toDelete) {
    await deleteDoc(doc(db, 'price_plans', id));
    console.log(`Deleted doc ID: ${id}`);
  }

  console.log('Cleanup complete! Remaining unique plans:', seen.size);
  process.exit(0);
}

cleanup().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
