import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCircle, Mail, School, MapPin, Briefcase, Save, CheckCircle } from 'lucide-react';

const JABATAN_OPTIONS = [
  'Ketua Umum',
  'Ketua 1',
  'Ketua 2',
  'Sekretaris Umum',
  'Sekretaris 1',
  'Bendahara Umum',
  'Bendahara 1',
  'Departemen Agama',
  'Divisi Agama',
  'Departemen Minat Bakat',
  'Divisi Minat Bakat',
  'Departemen Kominfo',
  'Divisi Kominfo',
  'Departemen KWU',
  'Divisi KWU',
  'Departemen Pensos',
  'Divisi Pensos',
  'Departemen MPKP',
  'Divisi MPKP'
];

const REGIONAL_OPTIONS = [
  'Regional 1',
  'Regional 2',
  'Regional 3',
  'Regional 4',
  'Regional 5',
  'Regional 6',
  'Regional 7'
];

export default function ProfilPage() {
  const { userData, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    regional: '',
    asalSekolah: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        nama: userData.nama || '',
        jabatan: userData.jabatan || '',
        regional: userData.regional || '',
        asalSekolah: userData.asalSekolah || ''
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await updateUserProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-600">Kelola informasi profil Anda</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{userData?.nama || 'Belum mengisi nama'}</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                {userData?.email}
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 capitalize">
                  {userData?.role}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Profil berhasil diperbarui!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">
                <UserCircle className="w-4 h-4 inline mr-1" />
                Nama Lengkap
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jabatan">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Jabatan
              </Label>
              <Select 
                value={formData.jabatan} 
                onValueChange={(value) => setFormData({ ...formData, jabatan: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {JABATAN_OPTIONS.map((jabatan) => (
                    <SelectItem key={jabatan} value={jabatan}>
                      {jabatan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regional">
                <MapPin className="w-4 h-4 inline mr-1" />
                Regional
              </Label>
              <Select 
                value={formData.regional} 
                onValueChange={(value) => setFormData({ ...formData, regional: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih regional" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONAL_OPTIONS.map((regional) => (
                    <SelectItem key={regional} value={regional}>
                      {regional}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asalSekolah">
                <School className="w-4 h-4 inline mr-1" />
                Asal Sekolah
              </Label>
              <Input
                id="asalSekolah"
                value={formData.asalSekolah}
                onChange={(e) => setFormData({ ...formData, asalSekolah: e.target.value })}
                placeholder="Masukkan nama sekolah"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
