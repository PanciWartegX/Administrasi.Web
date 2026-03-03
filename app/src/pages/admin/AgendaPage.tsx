import React, { useEffect, useState } from 'react';
import { getAllAgenda, createAgenda, deleteAgenda } from '@/services/agendaService';
import type { Agenda } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, MapPin, Plus, Trash2, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export default function AgendaPage() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    tanggal: '',
    lokasi: ''
  });

  useEffect(() => {
    fetchAgendas();
  }, []);

  const fetchAgendas = async () => {
    try {
      const data = await getAllAgenda();
      setAgendas(data);
    } catch (error) {
      console.error('Error fetching agendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createAgenda({
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        tanggal: Timestamp.fromDate(new Date(formData.tanggal)),
        lokasi: formData.lokasi,
        createdAt: Timestamp.now()
      } as any);

      setFormData({ judul: '', deskripsi: '', tanggal: '', lokasi: '' });
      setIsDialogOpen(false);
      fetchAgendas();
    } catch (error) {
      console.error('Error creating agenda:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (agendaId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      try {
        await deleteAgenda(agendaId);
        fetchAgendas();
      } catch (error) {
        console.error('Error deleting agenda:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Agenda</h1>
          <p className="text-gray-600">Kelola agenda kegiatan FOKSI</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Agenda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Agenda Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Agenda</Label>
                <Input
                  id="judul"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Masukkan judul agenda"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Masukkan deskripsi agenda"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal & Waktu</Label>
                <Input
                  id="tanggal"
                  type="datetime-local"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input
                  id="lokasi"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  placeholder="Masukkan lokasi kegiatan"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Agenda'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          {agendas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada agenda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agendas.map((agenda) => (
                <div 
                  key={agenda.agendaId} 
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{agenda.judul}</h3>
                      <p className="text-gray-600 mt-1">{agenda.deskripsi}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {agenda.tanggal.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {agenda.lokasi}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(agenda.agendaId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
