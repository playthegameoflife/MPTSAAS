import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBa2YB8NQxwb7zAsQA2CTLme9FrMtyaa4k',
  authDomain: 'moneyprinterturbo-dcaf8.firebaseapp.com',
  projectId: 'moneyprinterturbo-dcaf8',
  storageBucket: 'moneyprinterturbo-dcaf8.firebasestorage.app',
  messagingSenderId: '461728106511',
  appId: '1:461728106511:web:f18d434470596cbd4f3b7a',
  measurementId: 'G-DC0X0G10M6',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle(): Promise<User> {
  return signInWithPopup(auth, googleProvider).then((result) => result.user);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { User };
