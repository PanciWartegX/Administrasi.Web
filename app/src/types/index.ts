export interface User {
  userId: string;
  nama: string;
  jabatan: string;
  regional: string;
  asalSekolah: string;
  role: 'admin' | 'anggota';
  email: string;
  createdAt: Date;
}

export interface Agenda {
  agendaId: string;
  judul: string;
  deskripsi: string;
  tanggal: Date;
  lokasi: string;
  createdAt: Date;
}

export interface Absensi {
  absensiId: string;
  agendaId: string;
  kode: string;
  expiredAt: Date;
  aktif: boolean;
  daftarHadir: string[];
  createdAt?: Date;
}

export interface AbsensiWithAgenda extends Absensi {
  agenda?: Agenda;
}

export interface UserWithAbsensi extends User {
  hadir?: boolean;
}
