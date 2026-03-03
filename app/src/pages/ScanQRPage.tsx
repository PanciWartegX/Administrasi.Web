import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateAbsensi, recordKehadiran } from '@/services/absensiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Scan, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function ScanQRPage() {
  const { userData } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'qr-reader';

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setResult(null);

    try {
      scannerRef.current = new Html5Qrcode(qrRegionId);
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleScanSuccess,
        handleScanError
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      setResult({
        success: false,
        message: 'Gagal mengakses kamera. Pastikan Anda memberikan izin kamera.'
      });
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanning(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    await stopScanning();

    try {
      const validation = await validateAbsensi(decodedText, userData?.userId || '');
      
      if (validation.valid && validation.absensi) {
        await recordKehadiran(validation.absensi.absensiId, userData?.userId || '');
        setResult({
          success: true,
          message: 'Absensi berhasil! Anda telah terdaftar hadir.'
        });
      } else {
        setResult({
          success: false,
          message: validation.message
        });
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setResult({
        success: false,
        message: 'Terjadi kesalahan. Silakan coba lagi.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanError = (_err: any) => {
    // Ignore scan errors, they're normal when no QR is in view
  };

  const handleRetry = () => {
    setResult(null);
    startScanning();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
        <p className="text-gray-600">Scan QR code untuk melakukan absensi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Scanner Absensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!scanning && !result && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Siap Scan QR Code?
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Klik tombol di bawah untuk memulai scanner dan arahkan kamera ke QR code absensi.
              </p>
              <Button 
                onClick={startScanning}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Mulai Scan
              </Button>
            </div>
          )}

          {scanning && (
            <div className="space-y-4">
              <div 
                id={qrRegionId} 
                className="w-full max-w-sm mx-auto rounded-lg overflow-hidden"
              />
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Arahkan kamera ke QR code absensi
                </p>
                <Button 
                  variant="outline" 
                  onClick={stopScanning}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
          )}

          {result && (
            <div className="text-center py-8">
              {result.success ? (
                <>
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-700 mb-2">
                    Berhasil!
                  </h3>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-red-700 mb-2">
                    Gagal
                  </h3>
                </>
              )}
              <Alert className={result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="mt-6"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Lagi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Petunjuk Penggunaan</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Klik tombol "Mulai Scan" untuk mengaktifkan kamera</li>
            <li>Arahkan kamera ke QR code yang ditampilkan oleh panitia</li>
            <li>Tunggu hingga sistem memproses scan</li>
            <li>Jika berhasil, Anda akan mendapat notifikasi konfirmasi</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
