import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Absensi, AbsensiWithAgenda, Agenda } from '@/types';

export const generateKodeAbsensi = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FOKSI-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createAbsensi = async (
  agendaId: string, 
  durasiMenit: number = 60
): Promise<string> => {
  const kode = generateKodeAbsensi();
  const expiredAt = new Date();
  expiredAt.setMinutes(expiredAt.getMinutes() + durasiMenit);
  
  const docRef = await addDoc(collection(db, 'absensi'), {
    agendaId,
    kode,
    expiredAt: Timestamp.fromDate(expiredAt),
    aktif: true,
    daftarHadir: [],
    createdAt: Timestamp.now()
  });
  
  return docRef.id;
};

export const getAbsensiByAgenda = async (agendaId: string): Promise<Absensi | null> => {
  const absensiRef = collection(db, 'absensi');
  const q = query(absensiRef, where('agendaId', '==', agendaId));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const docSnapshot = snapshot.docs[0];
    const data = docSnapshot.data();
    return {
      agendaId: data.agendaId,
      kode: data.kode,
      expiredAt: data.expiredAt?.toDate(),
      aktif: data.aktif,
      daftarHadir: data.daftarHadir || [],
      absensiId: docSnapshot.id,
      createdAt: data.createdAt?.toDate()
    };
  }
  return null;
};

export const getAbsensiByKode = async (kode: string): Promise<Absensi | null> => {
  const absensiRef = collection(db, 'absensi');
  const q = query(absensiRef, where('kode', '==', kode));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const docSnapshot = snapshot.docs[0];
    const data = docSnapshot.data();
    return {
      agendaId: data.agendaId,
      kode: data.kode,
      expiredAt: data.expiredAt?.toDate(),
      aktif: data.aktif,
      daftarHadir: data.daftarHadir || [],
      absensiId: docSnapshot.id,
      createdAt: data.createdAt?.toDate()
    };
  }
  return null;
};

export const validateAbsensi = async (kode: string, userId: string): Promise<{ valid: boolean; message: string; absensi?: Absensi }> => {
  const absensi = await getAbsensiByKode(kode);
  
  if (!absensi) {
    return { valid: false, message: 'Kode absensi tidak ditemukan' };
  }
  
  if (!absensi.aktif) {
    return { valid: false, message: 'Kode absensi tidak aktif' };
  }
  
  if (new Date() > absensi.expiredAt) {
    return { valid: false, message: 'Kode absensi sudah expired' };
  }
  
  if (absensi.daftarHadir.includes(userId)) {
    return { valid: false, message: 'Anda sudah absen untuk agenda ini' };
  }
  
  return { valid: true, message: 'Valid', absensi };
};

export const recordKehadiran = async (absensiId: string, userId: string): Promise<void> => {
  const absensiRef = doc(db, 'absensi', absensiId);
  await updateDoc(absensiRef, {
    daftarHadir: arrayUnion(userId)
  });
};

export const getAllAbsensiWithAgenda = async (): Promise<AbsensiWithAgenda[]> => {
  const absensiRef = collection(db, 'absensi');
  const snapshot = await getDocs(absensiRef);
  
  const result: AbsensiWithAgenda[] = [];
  
  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    const agendaDoc = await getDoc(doc(db, 'agenda', data.agendaId));
    
    const absensi: AbsensiWithAgenda = {
      agendaId: data.agendaId,
      kode: data.kode,
      expiredAt: data.expiredAt?.toDate(),
      aktif: data.aktif,
      daftarHadir: data.daftarHadir || [],
      absensiId: docSnapshot.id,
      createdAt: data.createdAt?.toDate()
    };
    
    if (agendaDoc.exists()) {
      const agendaData = agendaDoc.data();
      absensi.agenda = {
        agendaId: agendaDoc.id,
        judul: agendaData.judul,
        deskripsi: agendaData.deskripsi,
        tanggal: agendaData.tanggal?.toDate(),
        lokasi: agendaData.lokasi,
        createdAt: agendaData.createdAt?.toDate()
      } as Agenda;
    }
    
    result.push(absensi);
  }
  
  return result;
};

export const toggleAbsensiStatus = async (absensiId: string, aktif: boolean): Promise<void> => {
  await updateDoc(doc(db, 'absensi', absensiId), { aktif });
};
