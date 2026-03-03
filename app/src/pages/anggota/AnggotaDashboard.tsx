import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUpcomingAgenda } from '@/services/agendaService';
import { getAbsensiByAgenda } from '@/services/absensiService';
import type { Agenda } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, QrCode, MapPin, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnggotaDashboard() {
  const { userData } = useAuth();
  const [upcomingAgenda, setUpcomingAgenda] = useState<Agenda[]>([]);
  const [myAbsensi, setMyAbsensi] = useState<{ agenda: Agenda; hadir: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const agendas = await getUpcomingAgenda();
      setUpcomingAgenda(agendas.slice(0, 3));

      // Check attendance for each agenda
      const absensiPromises = agendas.map(async (agenda) => {
        const absensi = await getAbsensiByAgenda(agenda.agendaId);
        return {
          agenda,
          hadir: absensi ? absensi.daftarHadir.includes(userData?.userId || '') : false
        };
      });

      const absensiResults = await Promise.all(absensiPromises);
      setMyAbsensi(absensiResults);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang, {userData?.nama || 'Anggota'}!</h1>
        <p className="text-red-100">
          {userData?.jabatan} - {userData?.asalSekolah}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/anggota/scan">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Scan QR</h3>
                <p className="text-sm text-gray-600">Lakukan absensi</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/anggota/agenda">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lihat Agenda</h3>
                <p className="text-sm text-gray-600">Jadwal kegiatan</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Agenda */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agenda Mendatang</CardTitle>
          <Link to="/anggota/agenda">
            <Button variant="ghost" size="sm">
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingAgenda.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada agenda mendatang</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAgenda.map((agenda) => {
                const myAbsen = myAbsensi.find(a => a.agenda.agendaId === agenda.agendaId);
                return (
                  <div 
                    key={agenda.agendaId} 
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{agenda.judul}</h3>
                        <p className="text-sm text-gray-600 mt-1">{agenda.deskripsi}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
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
                      {myAbsen?.hadir ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Hadir
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Belum Absen
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
