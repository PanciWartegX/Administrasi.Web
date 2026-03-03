import { useEffect, useState } from 'react';
import { getAllAgenda } from '@/services/agendaService';
import { 
  createAbsensi, 
  getAbsensiByAgenda, 
  getAllAbsensiWithAgenda,
  toggleAbsensiStatus
} from '@/services/absensiService';
import { getAllUsers } from '@/services/userService';
import type { Agenda, Absensi, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { exportAbsensiToXLSX } from '@/utils/exportUtils';
import { QrCode, Download, Play, Pause, Users, FileSpreadsheet, RefreshCw, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

export default function AbsensiPage() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [absensiList, setAbsensiList] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAgenda, setSelectedAgenda] = useState('');
  const [durasi, setDurasi] = useState('60');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [currentAbsensi, setCurrentAbsensi] = useState<Absensi | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agendasData, absensiData, usersData] = await Promise.all([
        getAllAgenda(),
        getAllAbsensiWithAgenda(),
        getAllUsers()
      ]);
      setAgendas(agendasData);
      setAbsensiList(absensiData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    if (!selectedAgenda) return;
    
    setIsGenerating(true);
    try {
      // Check if absensi already exists
      let absensi = await getAbsensiByAgenda(selectedAgenda);
      
      if (!absensi) {
        // Create new absensi
        await createAbsensi(selectedAgenda, parseInt(durasi));
        absensi = await getAbsensiByAgenda(selectedAgenda);
      }
      
      if (absensi) {
        setCurrentAbsensi(absensi);
        const qrUrl = await QRCode.toDataURL(absensi.kode, {
          width: 400,
          margin: 2,
          color: {
            dark: '#dc2626',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(qrUrl);
        setIsDialogOpen(true);
        fetchData();
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleStatus = async (absensiId: string, currentStatus: boolean) => {
    try {
      await toggleAbsensiStatus(absensiId, !currentStatus);
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleExport = (absensi: Absensi, agenda: Agenda) => {
    exportAbsensiToXLSX(users, absensi, agenda);
  };

  const getHadirCount = (daftarHadir: string[]) => {
    return daftarHadir.length;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Absensi</h1>
        <p className="text-gray-600">Generate QR code dan kelola daftar hadir</p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="generate">Generate QR</TabsTrigger>
          <TabsTrigger value="list">Daftar Absensi</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Kode Absensi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Agenda</Label>
                <Select value={selectedAgenda} onValueChange={setSelectedAgenda}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih agenda" />
                  </SelectTrigger>
                  <SelectContent>
                    {agendas.map((agenda) => (
                      <SelectItem key={agenda.agendaId} value={agenda.agendaId}>
                        {agenda.judul} - {agenda.tanggal.toLocaleDateString('id-ID')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Durasi Aktif (menit)</Label>
                <Select value={durasi} onValueChange={setDurasi}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 menit</SelectItem>
                    <SelectItem value="30">30 menit</SelectItem>
                    <SelectItem value="60">1 jam</SelectItem>
                    <SelectItem value="120">2 jam</SelectItem>
                    <SelectItem value="240">4 jam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateQR} 
                disabled={!selectedAgenda || isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {absensiList.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada data absensi</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {absensiList.map((item) => (
                <Card key={item.absensiId}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{item.agenda?.judul}</h3>
                          <Badge variant={item.aktif ? 'default' : 'secondary'}>
                            {item.aktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.agenda?.lokasi}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <QrCode className="w-4 h-4" />
                            Kode: {item.kode}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Hadir: {getHadirCount(item.daftarHadir)} orang
                          </span>
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-4 h-4" />
                            Expired: {item.expiredAt.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(item.absensiId, item.aktif)}
                        >
                          {item.aktif ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                          {item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(item, item.agenda)}
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>

                    {/* Daftar Hadir */}
                    {item.daftarHadir.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-sm text-gray-700 mb-3">Daftar Hadir:</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.daftarHadir.map((userId: string) => {
                            const user = users.find(u => u.userId === userId);
                            return user ? (
                              <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {user.nama}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Absensi</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {qrCodeUrl && (
              <>
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto rounded-lg border-2 border-gray-200"
                />
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Kode Absensi:</p>
                  <p className="text-2xl font-bold text-red-600">{currentAbsensi?.kode}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Scan QR code ini untuk melakukan absensi
                </p>
                <Button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `QR-${currentAbsensi?.kode}.png`;
                    link.href = qrCodeUrl;
                    link.click();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
