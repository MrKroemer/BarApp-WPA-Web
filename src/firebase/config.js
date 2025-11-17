import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAFVNbRkH8miFD455orGufn7-kO0I0xCKU",
  authDomain: "ornate-opus-254118.firebaseapp.com",
  projectId: "ornate-opus-254118",
  storageBucket: "ornate-opus-254118.firebasestorage.app",
  messagingSenderId: "831100772405",
  appId: "1:831100772405:web:f2cb181af004d13f09117c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();