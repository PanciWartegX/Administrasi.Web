import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { User } from '@/types';

export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('nama'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as User);
};

export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  const users = snapshot.docs.map(doc => doc.data() as User);
  
  if (!searchTerm) return users;
  
  const lowerTerm = searchTerm.toLowerCase();
  return users.filter(user => 
    user.nama?.toLowerCase().includes(lowerTerm) ||
    user.asalSekolah?.toLowerCase().includes(lowerTerm) ||
    user.regional?.toLowerCase().includes(lowerTerm)
  );
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};

export const getUsersByRegional = async (regional: string): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('regional', '==', regional));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as User);
};
