import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  QrCode, 
  Users, 
  FileSpreadsheet,
  ArrowRight,
  Shield,
  Bell
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: QrCode,
      title: 'Absensi QR Code',
      description: 'Sistem absensi modern dengan scan QR code, tanpa input manual.'
    },
    {
      icon: Calendar,
      title: 'Manajemen Agenda',
      description: 'Kelola agenda kegiatan dengan notifikasi realtime.'
    },
    {
      icon: Users,
      title: 'Data Anggota',
      description: 'Kelola data anggota OSIS MPK dari seluruh sekolah.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Export XLSX',
      description: 'Export data absensi ke format Excel dengan mudah.'
    },
    {
      icon: Shield,
      title: 'Verifikasi Email',
      description: 'Keamanan akun dengan verifikasi email.'
    },
    {
      icon: Bell,
      title: 'Notifikasi',
      description: 'Dapatkan notifikasi agenda kegiatan terbaru.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">FOKSI</h1>
                <p className="text-xs text-gray-500">Forum OSIS MPK Sukabumi</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-red-600 hover:bg-red-700">Daftar</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Sistem Absensi Digital
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Forum OSIS MPK
            <span className="block text-blue-600">Kabupaten Sukabumi</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Platform digital untuk manajemen anggota, agenda kegiatan, dan sistem absensi berbasis QR code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-8">
                Gabung Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Login Anggota
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Utama</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nikmati berbagai fitur modern untuk memudahkan manajemen organisasi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cara Kerja</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tiga langkah mudah untuk menggunakan sistem absensi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Daftar Akun',
                description: 'Buat akun dengan email dan verifikasi untuk mengaktifkan.'
              },
              {
                step: '02',
                title: 'Lengkapi Profil',
                description: 'Isi data diri lengkap dengan jabatan dan asal sekolah.'
              },
              {
                step: '03',
                title: 'Scan QR Code',
                description: 'Scan QR code saat acara berlangsung untuk absensi.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Siap Bergabung dengan FOKSI?
          </h2>
          <p className="text-red-100 text-lg mb-10">
            Daftar sekarang dan jadi bagian dari Forum OSIS MPK Kabupaten Sukabumi
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-10">
              Daftar Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="font-bold text-white">FOKSI</h1>
                <p className="text-xs">Forum OSIS MPK Sukabumi</p>
              </div>
            </div>
            <p className="text-sm">
              © 2025 Forum OSIS MPK Kabupaten Sukabumi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
