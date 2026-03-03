import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllAgenda } from '@/services/agendaService';
import { getAbsensiByAgenda } from '@/services/absensiService';
import type { Agenda, Absensi } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { generateBuktiHadirPDF } from '@/utils/exportUtils';

export default function AgendaPage() {
  const { userData } = useAuth();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [absensiMap, setAbsensiMap] = useState<Map<string, Absensi>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const agendasData = await getAllAgenda();
      setAgendas(agendasData);

      // Fetch absensi for each agenda
      const absensiPromises = agendasData.map(async (agenda) => {
        const absensi = await getAbsensiByAgenda(agenda.agendaId);
        return { agendaId: agenda.agendaId, absensi };
      });

      const absensiResults = await Promise.all(absensiPromises);
      const newAbsensiMap = new Map<string, Absensi>();
      absensiResults.forEach(({ agendaId, absensi }) => {
        if (absensi) {
          newAbsensiMap.set(agendaId, absensi);
        }
      });
      setAbsensiMap(newAbsensiMap);
    } catch (error) {
      console.error('Error fetching agendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const isHadir = (agendaId: string): boolean => {
    const absensi = absensiMap.get(agendaId);
    return absensi ? absensi.daftarHadir.includes(userData?.userId || '') : false;
  };

  const handleDownloadBukti = (agenda: Agenda) => {
    if (userData && isHadir(agenda.agendaId)) {
      generateBuktiHadirPDF(userData, agenda);
    }
  };

  const now = new Date();
  const upcomingAgendas = agendas.filter(a => a.tanggal >= now);
  const pastAgendas = agendas.filter(a => a.tanggal < now);

  const AgendaCard = ({ agenda }: { agenda: Agenda }) => {
    const hadir = isHadir(agenda.agendaId);
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
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
          <div className="flex flex-col items-end gap-2">
            {hadir ? (
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
            {hadir && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDownloadBukti(agenda)}
              >
                <Download className="w-4 h-4 mr-1" />
                Bukti
              </Button>
            )}
          </div>
        </div>
      </div>
    );
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agenda Kegiatan</h1>
        <p className="text-gray-600">Lihat jadwal kegiatan FOKSI</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="upcoming">Mendatang</TabsTrigger>
          <TabsTrigger value="past">Selesai</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAgendas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada agenda mendatang</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAgendas.map((agenda) => (
                <AgendaCard key={agenda.agendaId} agenda={agenda} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAgendas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada agenda yang selesai</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastAgendas.map((agenda) => (
                <AgendaCard key={agenda.agendaId} agenda={agenda} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
