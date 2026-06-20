import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'

function requireDb() {
  if (!db) {
    throw new Error(
      'Firebase is not configured. Add your project credentials to .env.development (see README.md).',
    )
  }
  return db
}

export function addDeal(deal) {
  return addDoc(collection(requireDb(), 'deals'), {
    ...deal,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToDeals(callback) {
  if (!db) return () => {}
  const q = query(collection(db, 'deals'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function getDeal(id) {
  const snap = await getDoc(doc(requireDb(), 'deals', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export function addOffer(offer) {
  return addDoc(collection(requireDb(), 'offers'), {
    ...offer,
    createdAt: serverTimestamp(),
  })
}
