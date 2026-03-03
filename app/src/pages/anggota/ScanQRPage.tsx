import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateAbsensi, recordKehadiran } from '@/services/absensiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  Scan, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  CameraOff,
  Key,
  Copy,
  Check
} from 'lucide-react';

export default function ScanQRPage() {
  const { userData } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'qr-reader';
  const inputRef = useRef<HTMLInputElement>(null);

  // Dummy code untuk demo (akan diisi dari API sebenarnya)
  const dummyCodes = [
    'ABSEN-001-2024',
    'ABSEN-002-2024',
    'ABSEN-003-2024',
    'ABSEN-004-2024'
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          scannerRef.current.stop().catch(console.error);
        } catch (error) {
          console.error('Error stopping scanner:', error);
        }
      }
    };
  }, []);

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        // Prefer back camera if available
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera?.id || devices[0].id);
        setCameraError(null);
      } else {
        setCameraError('Tidak ada kamera yang terdeteksi');
      }
    } catch (error) {
      console.error('Error getting cameras:', error);
      setCameraError('Gagal mendapatkan daftar kamera');
    }
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setResult(null);
    setCameraError(null);

    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera');
      }

      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Stop all tracks immediately after permission granted
          stream.getTracks().forEach(track => track.stop());
        });

      // Get available cameras
      await getCameras();

      // Initialize scanner
      scannerRef.current = new Html5Qrcode(qrRegionId);
      
      const qrCodeSuccessCallback = (decodedText: string) => {
        if (isSubmitting) return;
        handleScanSuccess(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Start scanning with selected or default camera
      await scannerRef.current.start(
        selectedCamera || { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Ignore scan errors, they're normal when no QR is in view
          // Only log if it's a critical error
          if (errorMessage?.includes('NotAllowedError')) {
            setCameraError('Izin kamera ditolak. Mohon berikan izin akses kamera.');
          }
        }
      );
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      
      let errorMessage = 'Gagal mengakses kamera. ';
      if (error.name === 'NotAllowedError' || error.message?.includes('permission')) {
        errorMessage += 'Mohon berikan izin akses kamera di browser Anda.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Tidak ada kamera yang terdeteksi.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Kamera sedang digunakan oleh aplikasi lain.';
      } else {
        errorMessage += 'Pastikan kamera terhubung dan coba lagi.';
      }
      
      setCameraError(errorMessage);
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
          message: validation.message || 'QR Code tidak valid'
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

  const handleManualSubmit = async () => {
    if (!manualCode.trim() || isManualSubmitting) return;
    
    setIsManualSubmitting(true);
    setResult(null);

    try {
      const validation = await validateAbsensi(manualCode.trim(), userData?.userId || '');
      
      if (validation.valid && validation.absensi) {
        await recordKehadiran(validation.absensi.absensiId, userData?.userId || '');
        setResult({
          success: true,
          message: 'Absensi berhasil! Anda telah terdaftar hadir.'
ir.'
        });
        });
        set        setManualCodeManualCode('');
     ('');
      } else } else {
        {
        setResult setResult({
         ({
          success: success: false,
 false,
          message          message: validation: validation.message ||.message || 'K 'Kode absode absensi tidakensi tidak valid'
 valid'
        });
        });
      }
      }
    }    } catch ( catch (error)error) {
      {
      console.error('Error console.error('Error processing manual processing manual code:', code:', error);
 error);
      set      setResult({
Result({
        success        success: false: false,
       ,
        message: message: 'Terjadi 'Terjadi kesalahan kesalahan. Sil. Silakan coba lagiakan coba lagi.'
     .'
      });
    });
    } finally } finally {
      {
      setIsManual setIsManualSubmitting(false);
Submitting(false);
    }
    }
  };

  };

  const  const handleRet handleRetry =ry = () => {
    () => {
    setResult(null);
 setResult(null);
    set    setCameraError(null);
CameraError(null);
    set    setActiveTabActiveTab('scan('scan');
 ');
  };

  };

  const handle const handleManualPermissionManualPermission = () = () => {
 => {
    // Try to    // Try to request permission request permission explicitly
 explicitly
    navigator.    navigator.mediaDevmediaDevices.getices.getUserMedia({ videoUserMedia({ video: true: true })
      .then })
      .then(stream(stream => {
 => {
        stream.getT        stream.getTracks().racks().forEach(track =>forEach(track => track.stop track.stop());
       ());
        startScanning();
 startScanning();
      })
      })
      .      .catch(error => {
catch(error => {
        console        console.error('Error requesting.error('Error requesting permission:', permission:', error);
 error);
        setCameraError        setCameraError('T('Tidak dapatidak dapat mengakses kamera mengakses kamera. Per. Periksa pengaturaniksa pengaturan izin izin browser Anda browser Anda.');
      });
 .');
      });
  };

  };

  const copy const copyToClipboardToClipboard = ( = (code: string)code: string) => {
 => {
    navig    navigator.clipboardator.clipboard.writeText.writeText(code);
(code);
    setCopied    setCopied(true);
(true);
    setTimeout(() =>    setTimeout(() setCop => setCopied(falseied(false), 200), 20000);
  };

 );
  };

  const fill const fillDDummyCodeummyCode = ( = (code: string)code: string) => {
 => {
    set    setManualCodeManualCode(code);
    if(code);
    if (input (inputRef.currentRef.current) {
) {
      input      inputRef.currentRef.current.focus();
.focus();
       }
  }
  };

  };

  return (
    return (
    <div className <div className="space="space-y-6">
-y-6">
           <div>
 <div>
               <h1 <h1 className=" className="text-2xltext-2xl font-bold font-bold text-gray- text-gray-900">Scan900 QR Code">Scan QR Code</h1>
</h1>
               <p className <p className="text-gray-="text-gray-600">600">Scan QRScan QR code atau code atau masukkan masukkan kode manual untuk kode manual untuk absensi absensi</p</p>
      </div>
     >

      </div>

      <Card>
        <Card>
        <Card <CardHeader>
Header>
                   <CardTitle <CardTitle className=" className="flex itemsflex items-center gap-center gap-2-2">
           ">
            <Scan <Scan className="w- className="w-5 h5 h-5-5" />
" />
            Abs            Absensi
ensi
          </          </CardTitleCardTitle>
       >
        </Card </CardHeader>
Header>
               <CardContent <CardContent>
         >
          <T <Tabs valueabs value={activeTab}={activeTab} onValue onValueChange={Change={setActiveTabsetActiveTab} className="} className="w-fullw-full">
           ">
            <T <TabsListabsList className="grid w className="grid w-full grid-full grid-cols-cols-2 mb--2 mb-6">
6">
              <T              <absTabsTrigger valueTrigger value="scan="scan" className" className="flex items-center="flex items-center gap-2">
 gap-               2">
                <Camera className <Camera className="w="w-4 h-4"-4 h-4" />
                />
                Scan QR Scan QR Code
 Code
              </              </TabsTabsTrigger>
             Trigger>
              <Tabs <TabsTrigger valueTrigger value="manual="manual" className" className="flex="flex items-center items-center gap- gap-2">
2">
                               <Key className="w <-4 h-Key className="w-44" h-4" />
                Input Manual />
               
              Input Manual
              </T </TabsTriggerabsTrigger>
           >
            </T </TabsListabsList>

           >

            <T <TabsContentabsContent value=" value="scan">
scan">
              {              {!scan!scanning &&ning && !result && ! !result && !cameraError &&cameraError && (
                (
                <div <div className=" className="text-centertext-center py- py-8">
8">
                                   <div className <div className="w-24 h-="w-2424 bg h-24 bg-red-100 rounded-red-100 rounded-full flex-full flex items-center items-center justify-center justify-center mx-auto mx-auto mb- mb-6">
                    <Camera className6">
                    <Camera className="w="w-12-12 h- h-12 text12 text-red--red-600"600" />
                  />
                  </div </div>
                 >
                  <h <h3 className="3 className="text-lg font-semibold text-gray-text-lg font-semibold text-gray-900 mb900 mb-2">
                   -2">
                    S Siap Scan QR Code?
                  </h3>
                 iap Scan <p className=" QR Code?
                  </h3>
                  <p className="text-graytext-gray-600 mb-6 max-w-sm-600 mb-6 max-w-sm mx-auto">
                    mx-auto">
                    Klik Klik tombol tombol di bawah di bawah untuk mem untuk memulai scanner dan aulai scanner dan arahkanrahkan kamera ke QR kamera ke QR code abs code absensi.
                  </ensi.
                  </p>
                 p>
                  <Button 
                    onClick <Button 
                    onClick={start={startScanning}
                   Scanning}
                    className=" className="bg-bluebg-blue-600 hover:bg-blue-600 hover:bg-blue-700-700"
                   "
                    size="lg"
 size="lg"
                  >
                    <Camera className                  >
                    <Camera className="w-5 h-="w-5 h-5 mr5 mr-2" />
                    Mul-2" />
                    Mulai Scanai Scan
                 
                  </Button </Button>
               >
                </div>
              </div>
              )}

 )}

              {              {cameracameraError &&Error && (
                (
                <div <div className=" className="text-centertext-center py- py-6">
                 6">
                  <div className <div className="w-20="w h--20 h-20 bg20 bg-yellow-100-yellow-100 rounded-full rounded-full flex items flex items-center justify-center justify-center mx-center mx-auto mb-4-auto mb-4">
                   ">
                    <Camera <CameraOff classNameOff className="w="w--1010 h- h-10 text10 text-yellow-yellow-600" />
-600" />
                  </div>
                  </div>
                                   <h3 <h3 className=" className="text-lgtext-lg font-sem font-semiboldibold text-y text-yellow-ellow-700 mb700 mb-2">
-2                   ">
                    Masalah Kamera Masalah Kamera
                  </h
                 3>
 </h3>
                  <Alert className                  <Alert className="bg="bg-yellow-yellow-50-50 border-y border-yellow-200 mbellow--4200 mb-4">
                   ">
                    <Alert <AlertDescription classNameDescription className="text="text-yellow-yellow-800-800">
                     ">
                      {c {cameraErrorameraError}
                   }
                    </Alert </AlertDescription>
Description>
                  </                  </Alert>
Alert>
                  <div className="                  <div className="spacespace-y--y-3">
3">
                                       <Button 
 <Button 
                      onClick                      onClick={handle={handleManualPermissionManualPermission}
                     }
                      className=" className="bg-blue-600bg-blue-600 hover: hover:bg-bluebg-blue-700-700"
                   "
                    >
                      >
                      <RefreshCw <Refresh className="Cw className="w-4w- h-44 h-4 mr- mr-2" />
                     2" />
                      Minta Minta Izin Izin Ulang
                    Ulang
                    </Button>
                    </Button>
                    <Button <Button 
                      
                      variant=" variant="outlineoutline"
                      onClick={()"
                      onClick={() => set => setActiveTab('manualActiveTab('manual')}
')}
                    >
                    >
                      <Key className                      <Key className="w="w-4-4 h- h-4 mr4 mr-2-2" />
" />
                      Gunakan Input                      Gunakan Input Manual
 Manual
                    </                    </Button>
                   Button>
                    < <p className="text-sm textp className="text-sm text-gray-500 mt-3">
                      Tips: Pastikan-gray-500 mt-3">
                      Tips: Pastikan browser memiliki izin akses kamera. 
 browser memiliki izin akses kamera. 
                      Cek pengaturan                      Cek pengaturan izin izin browser Anda browser Anda.
                   .
                    </p </p>
                 >
                  </div </div>
               >
                </div>
              </div>
              )}

 )}

              {              {scanningscanning && (
                <div className && (
                <div className="space="space-y--y-4">
4">
                  {                  {camerascameras.length >.length > 1 && (
 1                    <div && (
                    className="flex <div className justify-center="flex justify-center mb-4">
 mb-4">
                                           <select
                        className <select
                        className="px="px-3-3 py-2 border py-2 border rounded-md text-sm rounded-md text-sm"
                        value={"
                       selectedCamera value={selectedCamera}
                       }
                        onChange={( onChange={(e)e) => set => setSelectedCameraSelectedCamera(e.target(e.target.value.value)}
)}
                      >
                      >
                        {                        {camerascameras.map((camera.map(() =>camera (
                          <option) => (
                          <option key={ key={camera.id}camera.id} value={camera value={camera.id}>
                            {camera.id}>
                            {camera.label ||.label || `Kamera ${ `Kamera ${cameracamera.id}`.id}`}
                         }
                          </option </option>
                        ))}
                     >
                        </select>
                    ))}
                      </select </div>
                   >
                  )}
                 </div>
                  )}
                  
                   
                  <div 
                    <div id={ 
                    id={qrRegionId}qrRegionId} 
                    
                    className=" className="ww-full-full max-w-sm mx max-w-sm mx-auto rounded-lg overflow-auto rounded-hidden bg-lg overflow-black"
-hidden bg-black"
                    style                    style={{ min={{ minHeight:Height: '300px' '300px' }}
                  }}
                  />
                 />
                  
                   
                  <div <div className=" className="text-center">
text-center">
                                       <p className <p className="text="text-sm text-sm text-gray--gray-600 mb600 mb-4-4">
                     ">
                      Arah Arahkan kamkan kamera keera ke QR code absensi QR code
                    absensi </p
                    </p>
                   >
                    <div <div className=" className="flex gapflex gap-2-2 justify-center justify-center">
                     ">
                      <Button <Button 
                        variant=" 
                        variant="outline" 
outline" 
                        onClick                        onClick={stop={stopScanningScanning}
                     }
                      >
                        >
                        <X <XCircle classNameCircle className="w-4="w-4 h- h-4 mr4 mr-2-2" />
" />
                        B                        Batal
atal
                      </                      </Button>
Button>
                                           <Button 
                        variant <Button 
="out                        variantline"
                        onClick="outline"
                        onClick={() =>={() => setActive setActiveTab('Tab('manual')manual')}
}
                                           >
                        >
                        <Key className=" <Key className="w-w-4 h4 h-4-4 mr- mr-2"2" />
                        />
                        Input Manual Input Manual
                     
                      </Button>
 </Button>
                    </div                    </div>
                 >
                  </div </div>
               >
                </div </div>
             >
              )}
            </T )}
            </TabsContentabsContent>

           >

            <T <TabsContentabsContent value=" value="manual">
manual">
              <div className="space              <div className="space-y--y-6 py-46 py">
               -4">
                <div className="space-y-4 <div className="space-y-4">
                 ">
                  <div <div>
                   >
                    <label <label htmlFor="manual htmlForCode"="manualCode" className=" className="block textblock text-sm font-medium text-sm font-medium text-gray-700 mb-2-gray-700 mb">
                     -2">
                      Masukkan Masukkan Kode Kode Absensi Absensi
                   
                    </label>
                    <div </label>
                    <div className=" className="flex gapflex gap-2-2">
                      <Input">
                      <Input
                       
                        ref={ ref={inputRefinputRef}
                       }
                        id=" id="manualCodemanualCode"
                       "
                        type="text"
 type="text"
                        placeholder                        placeholder="Cont="Contoh:oh: ABSEN-001 ABSEN-001-202-2024"
4"
                        value                        value={manual={manualCode}
                       Code}
                        onChange={(e onChange={(e) =>) => setManual setManualCode(eCode(e.target.value.target.value.toUpperCase.toUpperCase())}
())}
                                               onKeyPress={(e onKeyPress) =>={(e {
                         ) => {
                          if (e.key if (e.key === ' === 'Enter') {
                           Enter') {
                            handleManual handleManualSubmit();
Submit();
                          }
                          }
                        }}
                        }}
                        className                        className="flex="flex-1"
                       -1"
                        disabled={ disabled={isManualisManualSubmittingSubmitting}
}
                                           />
                      <Button 
                        />
                      <Button 
                        onClick onClick={={handleManualhandleManualSubmitSubmit}
}
                                               disabled={ disabled={!manual!manualCode.trim()Code.trim() || || isManualSubmitting}
                        isManualSubmitting}
                        className="bg-blue- className="bg-blue-600 hover:bg-blue-700"
600 hover:bg-blue-700"
                      >
                      >
                        {                        {isManualisManualSubmittingSubmitting ? (
 ? (
                                                   <>
                            <>
                            <Refresh <RefreshCw className="w-Cw className="w-44 h-4 mr-2 animate-spin" />
                            h-4 mr-2 animate-spin" />
                            Mem Memproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submitproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit
                          </>
                        )}

                          </>
                        )}
                      </                      </Button>
Button>
                    </                    </div>
div>
                  </div>

                                   </div>

                  {/* {/* Dummy Codes untuk Demo */}
                  Dummy Codes untuk Demo */}
                  <div className <div className="bg-gray="bg-gray--50 p50 p-4-4 rounded-lg">
                    <p rounded-lg">
                    <p className=" className="text-smtext-sm font-medium font-medium text-gray text-gray-700-700 mb- mb-3">
3">
                      Kode Contoh                      Kode Contoh ( (KKlik untuklik untuk mengisi):
 mengisi):
                    </p>
                    </p>
                                       <div className <div className="grid grid="grid grid-c-cols-ols-2 gap2 gap--2">
                      {dummyCodes.map((2">
                      {dummyCodes.map((code)code) => (
 => (
                        <div
                        <div
                          key                          key={code={code}
}
                                                   className=" className="flex itemsflex items-center justify-center justify-between bg-between bg-white p-white p-2-2 rounded border rounded border hover:border hover:border-blue-500 cursor-blue--pointer group500 cursor-pointer group"
                         "
                          onClick={() onClick={() => fill => fillDummyDummyCode(codeCode(code)}
                       )}
                        >
                          <span >
                          <span className=" className="text-smtext-sm font-m font-mono">{ono">{code}</code}</span>
span>
                                                   <Button
 <Button
                            variant                            variant="ghost"
="ghost"
                            size                            size="sm="sm"
                           "
                            className=" className="opacity-0opacity group-h-0 group-hover:over:opacityopacity-100-100"
                           "
                            onClick={(e) onClick={(e) => {
 => {
                              e                              e.stopProp.stopPropagation();
                              copyagation();
                              copyToClipToClipboard(codeboard(code);
                           );
                            }}
                          }}
                          >
                            >
                            {cop {copied ? (
ied ? (
                                                           < <Check className="wCheck className="w-3-3 h- h-3 text-green-3 text-green-600"600" />
                            ) : />
                            ) : (
                              (
                              <Copy <Copy className="w- className="w-3 h3 h-3" />
-3" />
                            )}
                            )}
                          </                          </Button>
Button>
                        </div>
                        </div>
                      ))}
                      ))}
                    </div>
                    </div>
                    <p                    <p className="text-xs className="text-xs text-gray- text-gray-500500 mt-3">
 mt-3">
                      *                      *Untuk testingUntuk, gun testing, gunakan kode diakan k atas. Diode di atas. Di implementasi se implementasi sebenarnya, kbenarnya, kode akanode akan diberikan oleh panitia.
                    </p>
 diberikan oleh panitia.
                    </p>
                  </                  </div>

div>

                  <div className="                  <div className="bg-blue-50bg-blue-50 p- p-4 rounded-lg">
                   4 rounded-lg">
                    <h4 <h4 className="text-sm className="text-sm font-medium font-medium text-blue-800 text-blue- mb800 mb-2">Pet-2">Petunjunjuk Input Manualuk Input Manual:</:</h4h4>
                   >
                    <ul className=" <ul className="text-sm texttext-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>Mas-blue-700 space-y-1 list-disc list-inside">
                      <li>Masukkan kode absensi yang diberikan panitia</li>
ukkan kode absensi yang diberikan panitia</li>
                      <li>Kode                      <li>Kode bersifat case bersifat case-sensitive,-sensitive, pastikan pen pastikan penulisan benar</ulisan benar</li>
li>
                                           <li> <li>Klik contohKlik contoh kode di k atas untukode di atas untuk mengisi otomat mengisi otomatis</is</li>
li>
                      <li>                      <li>TekanTekan Enter atau klik Submit Enter atau klik Submit setelah setelah seles selesai</ai</li>
li>
                    </                    </ul>
ul>
                  </div>
                  </div>
                </                </div>

div>

                               <div className=" <div className="flex justifyflex justify-center">
-center">
                  <Button 
                  <Button 
                    variant                    variant="outline"
                    onClick="outline"
                    onClick={() =>={() => setActive setActiveTab('Tab('scan')scan')}
                 }
                  >
                    >
                    <Camera className=" <Camera className="w-w-4 h4 h-4-4 mr- mr-2" />
                   2" />
                    Kemb Kembali keali ke Scan QR Scan QR
                 
                  </Button </Button>
                </div>
               >
              </div </div>
              </div>
           >
            </TabsContent </TabsContent>
         >
          </T </Tabs>

abs>

          {          {result &&result && (
            <div (
            <div className=" className="text-centertext-center py- py-8 mt8 mt-4 border-t">
              {result.success-4 border-t">
              {result.success ? (
 ? (
                <>
                <>
                                   <div className <div className="w="w-20-20 h- h-20 bg20 bg-green--green-100 rounded-full flex100 rounded-full flex items-center items-center justify-center justify-center mx-auto mx-auto mb-4">
 mb-                    <CheckCircle4">
                    className=" <CheckCirclew-10 h className="w--1010 h-10 text-green text-green-600-600" />
" />
                  </div>
                  </div>
                                   <h3 className <h3 className="="text-lg font-semtext-lgib font-semibold text-greenold text-green-700-700 mb-2">
 mb-2">
                    Berhasil!
                    Ber                  </hasil!
                  </h3h3>
               >
                </>
              </>
              ) : ) : (
                (
                <>
                  <div className=" <>
                  <div className="w-w-20 h20 h-20-20 bg-red bg-red-100 rounded-full-100 rounded-full flex items flex items-center justify-center mx-center justify-center mx-auto mb-auto mb-4-4">
                    <XCircle className">
                    <XCircle className="w="w-10-10 h-10 text h-10 text-red--red-600"600" />
                  </div />
                  </div>
                 >
                  < <h3 className="texth3 className="text-lg font-lg font-semib-semold text-red-ibold text-red-700 mb-700 mb-22">
                   ">
                    Gag Gagal
                  </al
                  </h3h3>
                </>
             >
                </>
              )}
              )}
              <Alert <Alert className={`max className={`max-w-md-w-md mx-auto ${result mx-auto ${result.success ?.success ? 'bg 'bg-green--green-50 border50 border-green-200' : '-green-200' : 'bg-red-50bg-red-50 border-red border-red-200-200'}`'}`}>
                <AlertDescription className={result.success ? 'text-green-}>
                <AlertDescription className={result.success ? 'text-green-800' : '800' : 'text-red-text-red800'}>
-800                  {'}>
                  {result.messageresult.message}
               }
                </Alert </AlertDescription>
Description>
              </              </Alert>
Alert>
                           <Button 
                onClick <Button 
                onClick={handleRetry={handleRetry}
}
                               variant=" variant="outlineoutline"
               "
                className=" className="mt-mt-4"
              >
4"
              >
                               <RefreshCw className="w-4 h- <RefreshCw className="w-44 mr h-4 mr-2-2" />
                {" />
                {activeactiveTab ===Tab === 'scan 'scan' ?' ? 'Scan 'Scan Lagi Lagi' :' : 'Input Lagi'}
              'Input Lagi'}
              </Button </Button>
           >
            </div>
          )}
        </div>
          )}
        </Card </CardContent>
Content>
      </      </Card>

Card>

      {/* Instructions      {/* Instructions */}
      */}
      <Card>
 <Card>
               <CardHeader <CardHeader>
          <Card>
          <Title className="textCardTitle className="text-sm">-sm">PetunjPetunjuk Penguk Penggunaan</gunaan</CardTitleCardTitle>
       >
        </CardHeader>
 </CardHeader>
               <CardContent>
          <div <CardContent>
          className=" <div className="space-y-4space-y">
           -4">
            <div <div>
             >
              <h <h4 className4 className="font-medium text="font-medium text-gray-gray-900-900 mb- mb-2">2">Metode ScanMetode QR:</ Scan QR:</h4h4>
             >
              <ol <ol className=" className="list-delist-decimal listcimal list-inside space-y-inside space-y-1-1 text-sm text-sm text-gray text-gray-600-600">
                <li">
                <li>P>Pilih tabilih tab "Scan "Scan QR Code QR Code"</"</li>
li>
                <li>Klik                <li>Klik tombol tombol " "Mulai ScanMulai Scan" untuk" untuk mengakt mengaktifkan kamera</liifkan kamera</li>
                <li>
                <li>Jika>Jika diminta diminta izin izin, p, pilih "Izinkanilih "Izinkan" untuk" untuk aks akses kamera</li>
es kamera</li>
                               <li>A <li>Arahkanrahkan kamera kamera ke QR code yang ditampilkan oleh panitia ke QR code yang ditampilkan oleh panitia</li</li>
               >
                <li <li>Past>Pastikan QR code beradaikan QR code berada dalam kot dalam kotak scannerak scanner</li</li>
             >
              </ol </ol>
           >
            </div>
            
            </div>
            
            <div>
              <div>
              <h4 <h4 className=" className="font-mediumfont-medium text-gray-900 mb- text-gray-9002"> mb-2">MetodeMetode Input Manual Input Manual:</h:</h4>
             4>
              <ol className <ol className="list="list-decimal-decimal list-ins list-inside space-y-ide space-y-1 text1 text-sm text-gray--sm text-gray-600">
600">
                <li>                <li>PilihPilih tab " tab "Input ManualInput Manual"</"</li>
                <li>li>
                <li>MasukkanMasukkan kode kode absensi yang diberikan pan absensi yang diberikan panitia</itia</li>
               li>
 <li>                <li>KlikKlik tom tombol Submit ataubol Submit atau tekan Enter tekan Enter</li>
               </li>
                <li <li>Tunggu kon>Tunggu konfirmasi keberhasilanfirmasi keberhasilan</li>
             </li>
              </ol>
            </div </ol>
            </div>

           >

            <div <div className="mt- className="mt-4 p4 p-3 bg-y-3 bg-yellow-ellow-50 rounded-md">
50 rounded-md">
                           <p className="text <p className="text-sm text-sm text-yellow-800-yellow-800">
               ">
                <strong <strong>Troubleshooting>Troubleshooting Kamera:</strong Kamera> Jika:</strong> Jika kamera kamera tidak muncul tidak muncul, gun, gunakan metodeakan metode input manual atau past input manual atau pastikan:
ikan:
                <br />                <br />• Browser• Browser memiliki izin a memiliki izin akseskses kamera
                kamera
                <br <br />• Tidak ada />• Tidak ada aplikasi aplikasi lain yang menggunakan kam lain yang menggunakan kamera
era
                <br />                <br />• C• Coba gunakan browseroba gunakan browser Chrome atau Chrome atau Firefox
 Firefox
              </              </p>
p>
            </div            </div>
>
                   </ </div>
        </div>
        </CardCardContent>
     Content>
      </Card </Card>
    </>
    </divdiv>
>
  );
}