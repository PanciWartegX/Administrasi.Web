import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUsers } from '@/services/userService';
import { getAllAgenda } from '@/services/agendaService';
import { getAllAbsensiWithAgenda } from '@/services/absensiService';
import type { Agenda } from '@/types';
import { Users, Calendar, QrCode, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAnggota: 0,
    totalAgenda: 0,
    totalAbsensi: 0,
    totalHadir: 0
  });
  const [recentAgenda, setRecentAgenda] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, agendas, absensiList] = await Promise.all([
          getAllUsers(),
          getAllAgenda(),
          getAllAbsensiWithAgenda()
        ]);

        const totalHadir = absensiList.reduce((acc, abs) => acc + abs.daftarHadir.length, 0);

        setStats({
          totalAnggota: users.length,
          totalAgenda: agendas.length,
          totalAbsensi: absensiList.length,
          totalHadir
        });

        setRecentAgenda(agendas.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { 
      title: 'Total Anggota', 
      value: stats.totalAnggota, 
      icon: Users, 
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    { 
      title: 'Total Agenda', 
      value: stats.totalAgenda, 
      icon: Calendar, 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    { 
      title: 'Total Absensi', 
      value: stats.totalAbsensi, 
      icon: QrCode, 
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    { 
      title: 'Total Kehadiran', 
      value: stats.totalHadir, 
      icon: CheckCircle, 
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel administrasi FOKSI</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAgenda.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada agenda</p>
          ) : (
            <div className="space-y-4">
              {recentAgenda.map((agenda) => (
                <div 
                  key={agenda.agendaId} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{agenda.judul}</h3>
                    <p className="text-sm text-gray-600">{agenda.lokasi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {agenda.tanggal.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
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
