import React, { useState, useEffect, useRef } from 'react';
import { Coordinate, SavedLocation } from '../types';
import { convertToMSL } from './GeoidUtils';

interface Props {
  onComplete: (coord: Coordinate, folderName: string, pointName: string, description: string, photo: string | null) => void;
  onCancel: () => void;
  isContinuing?: boolean;
  existingLocations: SavedLocation[];
}

const GPSCapture: React.FC<Props> = ({ onComplete, onCancel, isContinuing = false, existingLocations }) => {
  const [step, setStep] = useState<'SELECT_MODE' | 'FORM' | 'READY' | 'COUNTDOWN'>(isContinuing ? 'READY' : 'SELECT_MODE');
  const [isNewProject, setIsNewProject] = useState(true);
  const [folderName, setFolderName] = useState(localStorage.getItem('last_folder_name') || '');
  const [pointName, setPointName] = useState('Nokta 1');
  const [seconds, setSeconds] = useState(5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [geoError, setGeoError] = useState<string | null>(null);
  
  // Anlık hassasiyeti göstermek için state
  const [instantAccuracy, setInstantAccuracy] = useState<number | null>(null);
  
  const samplesRef = useRef<Coordinate[]>([]);
  const watchIdRef = useRef<number | null>(null);
  
  // Callback içerisindeki 'step' değerinin güncel kalması için Ref kullanıyoruz (Stale Closure Fix)
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const getUniqueProjects = () => Array.from(new Set(existingLocations.map(l => l.folderName))).sort();

  const getNextPointNameForProject = (projName: string) => {
    const projPoints = existingLocations.filter(l => l.folderName === projName);
    if (projPoints.length === 0) return "Nokta 1";
    let maxNum = 0;
    projPoints.forEach(p => {
      const match = p.name.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `Nokta ${maxNum + 1}`;
  };

  // GPS Bağlantısını Başlatma ve Yönetme
  useEffect(() => {
    // Sadece bu modlarda GPS açık olsun
    if (step === 'FORM' || step === 'READY' || step === 'COUNTDOWN') {
      startGPSWatcher();
    }
    
    // Cleanup: Bileşenden çıkıldığında durdur
    return () => {
      // Mod değiştiğinde hemen durdurmuyoruz, çünkü FORM -> READY -> COUNTDOWN arası geçişlerde kopukluk istemiyoruz.
      // Sadece component unmount olduğunda durduruyoruz (React otomatik halleder).
      // Ancak manuel durdurma gerekirse 'stopSampling' çağrılacak.
    };
  }, [step]); // step dependency'si watcher'ı yeniden başlatmamalı, sadece kontrol etmeli

  useEffect(() => {
    if (folderName) setPointName(getNextPointNameForProject(folderName));
  }, [folderName]);

  useEffect(() => {
    let timer: any;
    if (step === 'COUNTDOWN') {
      // Sayaç başladığında önceki verileri temizle
      if (seconds === 5 && samplesRef.current.length > 0) {
         samplesRef.current = [];
         setSampleCount(0);
      }

      if (seconds > 0) {
        timer = setInterval(() => setSeconds(prev => prev - 1), 1000);
      } else if (seconds <= 0) {
        processAndComplete();
      }
      
      if (!isCapturing) setIsCapturing(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [seconds, step, isCapturing]);

  const handleGeoError = (error: GeolocationPositionError) => {
    let msg = "Konum alınamadı.";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        msg = "Konum izni reddedildi. Lütfen ayarlardan izin verin.";
        break;
      case error.POSITION_UNAVAILABLE:
        msg = "GPS sinyali çok zayıf veya kapalı.";
        break;
      case error.TIMEOUT:
        msg = "Konum alma isteği zaman aşımına uğradı.";
        break;
    }
    setGeoError(msg);
    setIsCapturing(false);
  };

  const startGPSWatcher = () => {
    if (watchIdRef.current !== null) return; // Zaten çalışıyorsa tekrar başlatma
    
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          // 1. Anlık monitör güncellemesi (Her zaman)
          setInstantAccuracy(pos.coords.accuracy);

          // 2. Veri Kaydı (Sadece COUNTDOWN modundaysak)
          // stepRef.current kullanarak güncel modu kontrol ediyoruz
          if (stepRef.current === 'COUNTDOWN') {
            const mslHeight = convertToMSL(pos.coords.latitude, pos.coords.longitude, pos.coords.altitude);
            
            samplesRef.current.push({
              lat: pos.coords.latitude, 
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy, 
              altitude: mslHeight, 
              timestamp: pos.timestamp
            });
            
            // Sayaç güncelle
            setSampleCount(prev => prev + 1);
          }
        },
        (err) => {
          console.warn("GPS Hatası:", err);
          // Hata durumunda sadece anlık monitörü sıfırla, hemen hata ekranına atma (belki düzelir)
          setInstantAccuracy(null);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    } else {
      setGeoError("Cihazınızda GPS desteği bulunmuyor.");
    }
  };

  const stopSampling = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsCapturing(false);
  };

  // Component unmount olurken veya işlem bittiğinde temizlik
  useEffect(() => {
    return () => stopSampling();
  }, []);

  const processAndComplete = () => {
    stopSampling();
    const allSamples = samplesRef.current;

    if (allSamples.length > 0) {
      // Kademeli Filtreleme (Tiered Processing)
      let validSamples: Coordinate[] = [];
      const highAccuracy = allSamples.filter(s => s.accuracy <= 20);
      const mediumAccuracy = allSamples.filter(s => s.accuracy <= 100);

      if (highAccuracy.length >= 2) {
        validSamples = highAccuracy;
      } else if (mediumAccuracy.length > 0) {
        validSamples = mediumAccuracy;
      } else {
        validSamples = allSamples;
      }

      // Aykırı Değer Temizliği (Trimmed Mean)
      const sortedSamples = [...validSamples].sort((a, b) => a.accuracy - b.accuracy);
      const keepCount = Math.max(1, Math.floor(sortedSamples.length * 0.8));
      const cleanSamples = sortedSamples.slice(0, keepCount);

      const avgLat = cleanSamples.reduce((a, b) => a + b.lat, 0) / cleanSamples.length;
      const avgLng = cleanSamples.reduce((a, b) => a + b.lng, 0) / cleanSamples.length;
      const avgAcc = cleanSamples.reduce((a, b) => a + b.accuracy, 0) / cleanSamples.length;
      
      const altSamples = cleanSamples.filter(s => s.altitude !== null);
      const avgAlt = altSamples.length > 0 
        ? altSamples.reduce((a, b) => a + (b.altitude || 0), 0) / altSamples.length 
        : null;
      
      const finalFolderName = folderName || "Genel Kayıtlar";
      localStorage.setItem('last_folder_name', finalFolderName);
      
      onComplete(
        { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: avgAlt, timestamp: Date.now() }, 
        finalFolderName, 
        pointName, 
        "", 
        null
      );
    } else {
      setGeoError("Veri toplanamadı. Lütfen GPS izinlerinin açık olduğundan ve açık havada olduğunuzdan emin olun.");
    }
  };

  const renderHeader = (title: string, onBack: () => void) => (
    <div className="relative flex items-center justify-center sticky top-0 bg-[#F1F5F9]/90 backdrop-blur-md z-20 pt-12 pb-6 -mx-6 px-6 w-full shrink-0">
      <button 
        onClick={onBack}
        className="absolute left-6 bottom-4 w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-90 transition-all"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <h2 className="text-xl font-extrabold text-slate-800 text-center">{title}</h2>
    </div>
  );

  if (geoError) {
    return (
      <div className="w-full flex flex-col h-full items-center">
        {renderHeader("Ölçüm Hatası", onCancel)}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in-95 max-w-[340px] px-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
            <i className="fas fa-triangle-exclamation text-3xl"></i>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">{geoError}</p>
          <div className="pt-4 space-y-3 w-full">
            <button onClick={() => { setGeoError(null); setStep('READY'); setSeconds(5); samplesRef.current = []; setSampleCount(0); setInstantAccuracy(null); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold active:scale-95 transition-all">Tekrar Dene</button>
            <button onClick={onCancel} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase">İptal</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'SELECT_MODE') {
    return (
      <div className="w-full flex flex-col h-full items-center">
        {renderHeader("Yeni Ölçüm", onCancel)}
        <div className="flex-1 w-full max-w-[340px] space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 px-4">
          <div className="flex flex-col gap-4">
            <button onClick={() => { setIsNewProject(true); setStep('FORM'); setFolderName(''); }} className="w-full p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl text-left flex flex-col gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] mb-2 group-hover:scale-110 transition-transform"><i className="fas fa-folder-plus"></i></div>
              <span className="text-base font-black text-slate-800">Yeni Proje Oluştur</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sıfırdan Başla</span>
            </button>
            <button onClick={() => { setIsNewProject(false); setStep('FORM'); }} disabled={getUniqueProjects().length === 0} className="w-full p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl text-left flex flex-col gap-2 group disabled:opacity-40">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-110 transition-transform"><i className="fas fa-folder-open"></i></div>
              <span className="text-base font-black text-slate-800">Mevcut Projeye Devam Et</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Kayıtlı Projelerden Seç</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'FORM') {
    return (
      <div className="w-full flex flex-col h-full items-center">
        {renderHeader("Proje Bilgisi", () => setStep('SELECT_MODE'))}
        <div className="flex-1 w-full max-w-[340px] space-y-6 text-center px-4">
          <div className="soft-card p-6 border-slate-100 space-y-6">
            {!isNewProject ? (
              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-black mb-1.5 text-left px-2">Proje Seçin</label>
                <select className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-slate-800 font-bold appearance-none outline-none" value={folderName} onChange={(e) => setFolderName(e.target.value)}>
                  <option value="">Seçiniz...</option>
                  {getUniqueProjects().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-black mb-1.5 text-left px-2">Yeni Proje Adı</label>
                <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Örn: Proje A" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-bold outline-none" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button onClick={() => setStep('READY')} disabled={!folderName.trim()} className="w-full py-5 bg-[#2563eb] text-white rounded-2xl font-bold disabled:opacity-40 shadow-lg shadow-blue-50">İleri</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full items-center">
      {renderHeader("Yeni Ölçüm", () => setStep('FORM'))}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 w-full max-w-[340px] mx-auto px-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-extrabold text-[#2563eb] truncate px-4">{folderName}</h3>
        </div>
        <div className="relative w-56 h-56 flex items-center justify-center">
          <div className={`absolute inset-0 border-2 rounded-full transition-colors duration-500 ${step === 'READY' ? 'border-slate-100' : 'border-blue-100'}`}></div>
          {step === 'COUNTDOWN' && <><div className="absolute inset-4 border border-blue-400/20 rounded-full animate-pulse"></div><div className="scanner-line"></div></>}
          <div className="text-8xl font-black text-slate-800 z-10 mono-font">
            {step === 'COUNTDOWN' ? seconds : <i className="fas fa-location-crosshairs text-6xl text-slate-200"></i>}
          </div>
        </div>
        {step === 'READY' ? (
          <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
              <label className="block text-[9px] uppercase text-slate-400 font-black text-left">Nokta İsmi</label>
              <input type="text" value={pointName} onChange={(e) => setPointName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-black text-center text-lg focus:ring-2 focus:ring-blue-100 outline-none" />
              
              {/* Canlı Sinyal Göstergesi */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                     <div className={`w-2.5 h-2.5 rounded-full ${instantAccuracy !== null ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Sinyal Durumu</span>
                  </div>
                  <span className={`text-xs font-bold mono-font ${instantAccuracy !== null ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {instantAccuracy !== null ? `±${instantAccuracy.toFixed(1)}m` : 'Aranıyor...'}
                  </span>
              </div>

              <button onClick={() => setStep('COUNTDOWN')} disabled={!pointName.trim()} className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-100"><i className="fas fa-play"></i>BAŞLA</button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 w-full animate-in fade-in duration-500">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 inline-block px-8">
              <span className="text-xs font-bold text-[#2563eb] uppercase tracking-widest">{pointName}</span>
            </div>
            <div className="space-y-2">
              {sampleCount === 0 ? (
                <div className="flex flex-col items-center gap-3 py-2">
                   <div className="w-4 h-4 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-slate-500 text-sm px-4 font-bold animate-pulse">GPS Sinyali Bekleniyor...</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-500 text-sm px-4 leading-relaxed font-medium">Cihazınız <span className="text-[#2563eb] font-bold">5 saniye</span> boyunca sinyal topluyor.</p>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-600">{sampleCount} Veri Paketi Alındı</span>
                  </div>
                </>
              )}
            </div>
            <button onClick={onCancel} className="px-12 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold text-xs uppercase active:scale-95 transition-all">Durdur</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPSCapture;