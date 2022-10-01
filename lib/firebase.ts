import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
  // Firebase config
});

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const database = getFirestore(app);

export { auth, database, provider };