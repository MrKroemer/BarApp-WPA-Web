import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  const loginWithEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email, password, name, isOwner = false) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      id: result.user.uid,
      name,
      email,
      isOwner
    });
    return result;
  };

  const loginWithQR = async ({ name, phone, isOwner = false }) => {
    const result = await signInAnonymously(auth);
    await setDoc(doc(db, 'users', result.user.uid), {
      id: result.user.uid,
      name,
      phone,
      isOwner,
      loginMethod: 'qr',
      createdAt: new Date().toISOString()
    });
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const existingProfile = await getUserProfile(result.user.uid);
    if (!existingProfile) {
      await setDoc(doc(db, 'users', result.user.uid), {
        id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        isOwner: false
      });
    }
    return result;
  };

  const logout = () => signOut(auth);

  return {
    user,
    userProfile,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithQR,
    loginWithGoogle,
    logout
  };
};