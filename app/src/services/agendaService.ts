import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Agenda } from '@/types';

export const createAgenda = async (agenda: Omit<Agenda, 'agendaId'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'agenda'), {
    ...agenda,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getAllAgenda = async (): Promise<Agenda[]> => {
  const agendaRef = collection(db, 'agenda');
  const q = query(agendaRef, orderBy('tanggal', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    agendaId: doc.id,
    tanggal: doc.data().tanggal?.toDate(),
    createdAt: doc.data().createdAt?.toDate()
  } as Agenda));
};

export const getUpcomingAgenda = async (): Promise<Agenda[]> => {
  const agendaRef = collection(db, 'agenda');
  const now = Timestamp.now();
  const q = query(
    agendaRef, 
    where('tanggal', '>=', now),
    orderBy('tanggal', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    agendaId: doc.id,
    tanggal: doc.data().tanggal?.toDate(),
    createdAt: doc.data().createdAt?.toDate()
  } as Agenda));
};

export const getAgendaById = async (agendaId: string): Promise<Agenda | null> => {
  const agendaDoc = await getDoc(doc(db, 'agenda', agendaId));
  if (agendaDoc.exists()) {
    const data = agendaDoc.data();
    return {
      ...data,
      agendaId: agendaDoc.id,
      tanggal: data.tanggal?.toDate(),
      createdAt: data.createdAt?.toDate()
    } as Agenda;
  }
  return null;
};

export const updateAgenda = async (agendaId: string, data: Partial<Agenda>): Promise<void> => {
  await updateDoc(doc(db, 'agenda', agendaId), data);
};

export const deleteAgenda = async (agendaId: string): Promise<void> => {
  await deleteDoc(doc(db, 'agenda', agendaId));
};
