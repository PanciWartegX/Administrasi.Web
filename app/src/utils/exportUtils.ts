import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import type { User, Agenda, Absensi } from '@/types';

export const exportAbsensiToXLSX = (
  users: User[],
  absensi: Absensi,
  agenda: Agenda
): void => {
  const data = users.map(user => ({
    'Nama': user.nama,
    'Jabatan': user.jabatan,
    'Regional': user.regional,
    'Asal Sekolah': user.asalSekolah,
    'Status': absensi.daftarHadir.includes(user.userId) ? 'Hadir' : 'Tidak Hadir'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Hadir');
  
  const fileName = `Absensi_${agenda.judul.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const generateBuktiHadirPDF = (
  user: User,
  agenda: Agenda
): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text('BUKTI KEHADIRAN', 105, 30, { align: 'center' });
  
  // Subheader
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Forum OSIS MPK Kabupaten Sukabumi', 105, 45, { align: 'center' });
  
  // Garis pemisah
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.line(20, 55, 190, 55);
  
  // Informasi Peserta
  doc.setFontSize(12);
  doc.text('Informasi Peserta:', 20, 70);
  
  const infoData = [
    ['Nama', ':', user.nama],
    ['Jabatan', ':', user.jabatan],
    ['Regional', ':', user.regional],
    ['Asal Sekolah', ':', user.asalSekolah],
  ];
  
  let yPos = 85;
  infoData.forEach(([label, separator, value]) => {
    doc.text(label, 20, yPos);
    doc.text(separator, 60, yPos);
    doc.text(value || '-', 70, yPos);
    yPos += 10;
  });
  
  // Informasi Agenda
  doc.text('Informasi Kegiatan:', 20, yPos + 10);
  yPos += 25;
  
  const agendaData = [
    ['Judul', ':', agenda.judul],
    ['Tanggal', ':', agenda.tanggal.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })],
    ['Lokasi', ':', agenda.lokasi],
  ];
  
  agendaData.forEach(([label, separator, value]) => {
    doc.text(label, 20, yPos);
    doc.text(separator, 60, yPos);
    doc.text(value || '-', 70, yPos);
    yPos += 10;
  });
  
  // Status Kehadiran
  doc.setFillColor(200, 255, 200);
  doc.rect(20, yPos + 10, 170, 20, 'F');
  doc.setFontSize(14);
  doc.setTextColor(0, 128, 0);
  doc.text('STATUS: HADIR', 105, yPos + 23, { align: 'center' });
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Dokumen ini digenerate secara otomatis pada:`, 105, 280, { align: 'center' });
  doc.text(new Date().toLocaleString('id-ID'), 105, 287, { align: 'center' });
  
  const fileName = `Bukti_Hadir_${user.nama.replace(/\s+/g, '_')}_${agenda.judul.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
