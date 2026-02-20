import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coordinate, SavedLocation } from '../types';
import { convertToMSL } from './GeoidUtils';
import { Geolocation } from '@capacitor/geolocation';

interface Props {
  onComplete: (coord: Coordinate, folderName: string, pointName: string, description: string) => void;
  onCancel: () => void;
  isContinuing?: boolean;
  existingLocations: SavedLocation[];
}

const GPSCapture: React.FC<Props> = ({ onComplete, onCancel, isContinuing = false, existingLocations }) => {
  const [step, setStep] = useState<'SELECT_MODE' | 'FORM' | 'READY' | 'COUNTDOWN'>(isContinuing ? 'READY' : 'SELECT_MODE');
  const [isNewProject, setIsNewProject] = useState(true);
  const [folderName, setFolderName] = useState(localStorage.getItem('last_folder_name') || '');
  const [pointName, setPointName] = useState('');
  const [seconds, setSeconds] = useState(5);
  const [sampleCount, setSampleCount] = useState(0);
  const [instantAccuracy, setInstantAccuracy] = useState<number | null>(null);
  const [waitingForSignal, setWaitingForSignal] = useState(false);
  
  const samplesRef = useRef<Coordinate[]>([]);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Geliştirilmiş İzin Kontrolü (Donmayı Engelleyen Güvenli Sürüm)
  useEffect(() => {
    const requestGPSPermission = async () => {
      try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          const request = await Geolocation.requestPermissions();
          if (request.location !== 'granted') {
            alert("Uygulamanın çalışması için konum izni gereklidir.");
            onCancel();
          }
        }
      } catch (err) {
        console.error("GPS İzin hatası:", err);
      }
    };
    requestGPSPermission();
  }, [onCancel]);

  // Konum İzleme Başlatma
  useEffect(() => {
    const startWatching = async () => {
      try {
        const id = await navigator.geolocation.watchPosition(
          (pos) => {
            lastPositionRef.current = pos;
            setInstantAccuracy(pos.coords.accuracy);
            if (pos.coords.accuracy <= 10) setWaitingForSignal(false);
          },
          (err) => console.error("Sinyal hatası:", err),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
        watchIdRef.current = id;
      } catch (e) {
        console.error("Watch başlatılamadı:", e);
      }
    };

    startWatching();
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const handleStartMeasurement = () => {
    if (instantAccuracy && instantAccuracy > 15) {
      setWaitingForSignal(true);
      return;
    }
    setStep('COUNTDOWN');
  };

  useEffect(() => {
    let timer: any;
    if (step === 'COUNTDOWN' && seconds > 0) {
      timer = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (step === 'COUNTDOWN' && seconds === 0) {
      setStep('READY'); // Ölçüm Başlasın
      startSampling();
    }
    return () => clearInterval(timer);
  }, [step, seconds]);

  const startSampling = () => {
    samplesRef.current = [];
    setSampleCount(0);
    const interval = setInterval(() => {
      if (lastPositionRef.current) {
        const p = lastPositionRef.current.coords;
        const msl = convertToMSL(p.latitude, p.longitude, p.altitude || 0);
        samplesRef.current.push({
          lat: p.latitude,
          lng: p.longitude,
          alt: p.altitude || 0,
          msl: msl,
          acc: p.accuracy,
          timestamp: Date.now()
        });
        setSampleCount(prev => prev + 1);
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      finalizeMeasurement();
    }, 10000); // 10 saniyelik hassas ölçüm
  };

  const finalizeMeasurement = () => {
    if (samplesRef.current.length === 0) {
      alert("Yeterli sinyal alınamadı.");
      setStep('READY');
      return;
    }

    const avg = {
      lat: samplesRef.current.reduce((a, b) => a + b.lat, 0) / samplesRef.current.length,
      lng: samplesRef.current.reduce((a, b) => a + b.lng, 0) / samplesRef.current.length,
      alt: samplesRef.current.reduce((a, b) => a + b.alt, 0) / samplesRef.current.length,
      msl: samplesRef.current.reduce((a, b) => a + b.msl, 0) / samplesRef.current.length,
      acc: samplesRef.current.reduce((a, b) => a + b.acc, 0) / samplesRef.current.length,
      timestamp: Date.now()
    };

    localStorage.setItem('last_folder_name', folderName);
    onComplete(avg, folderName, pointName, "");
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full overflow-hidden px-8 pt-12">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
          <i className="fas fa-times"></i>
        </button>
        <h2 className="text-xl font-black tracking-tight uppercase">Hassas Ölçüm</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {step === 'SELECT_MODE' && (
          <div className="space-y-4 animate-in">
             <button onClick={() => { setIsNewProject(true); setStep('FORM'); }} className="w-full p-6 bg-blue-600 rounded-[2rem] text-left text-white shadow-xl shadow-blue-100">
                <i className="fas fa-plus-circle text-2xl mb-4"></i>
                <span className="block font-black uppercase text-xs tracking-widest">YENİ PROJE BAŞLAT</span>
             </button>
             <button onClick={() => { setIsNewProject(false); setStep('FORM'); }} className="w-full p-6 bg-slate-900 rounded-[2rem] text-left text-white shadow-xl shadow-slate-200">
                <i className="fas fa-folder-open text-2xl mb-4"></i>
                <span className="block font-black uppercase text-xs tracking-widest">MEVCUT PROJEYE EKLE</span>
             </button>
          </div>
        )}

        {step === 'FORM' && (
          <div className="space-y-6 animate-in">
             <div className="space-y-2 text-center py-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Proje Detayları</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Veri Organizasyonu</p>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Klasör / Proje İsmi</label>
                  {isNewProject ? (
                    <input autoFocus type="text" value={folderName} onChange={e => setFolderName(e.target.value.toUpperCase())} placeholder="ÖRN: SAHA-01" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none border-2 border-transparent focus:border-blue-600 transition-all uppercase" />
                  ) : (
                    <select value={folderName} onChange={e => setFolderName(e.target.value)} className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-900 outline-none border-2 border-transparent focus:border-blue-600 appearance-none uppercase">
                      <option value="">PROJE SEÇİNİZ</option>
                      {[...new Set(existingLocations.map(l => l.folderName))].map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <button disabled={!folderName} onClick={() => setStep('READY')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-blue-100 disabled:bg-slate-200 transition-all">DEVAM ET</button>
             </div>
          </div>
        )}

        {step === 'READY' && (
          <div className="flex flex-col items-center justify-center py-10 animate-in text-center">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 relative">
              <div className="scanner-line"></div>
              <i className={`fas fa-satellite-dish text-4xl ${instantAccuracy && instantAccuracy < 10 ? 'text-emerald-500' : 'text-slate-300'}`}></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Sinyal Hazırlanıyor</h3>
            <p className="text-sm text-slate-400 font-medium max-w-[200px]">Hassas konum verisi için lütfen açık alanda bekleyiniz.</p>
            
            {instantAccuracy !== null && (
               <div className="mt-8 px-6 py-3 bg-slate-900 rounded-full">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Hassasiyet:</span>
                  <span className={`font-mono font-bold ${instantAccuracy < 5 ? 'text-emerald-400' : (instantAccuracy < 10 ? 'text-yellow-400' : 'text-red-400')}`}>±{instantAccuracy.toFixed(1)}m</span>
               </div>
            )}
          </div>
        )}

        {step === 'COUNTDOWN' && (
           <div className="flex flex-col items-center justify-center py-12 text-center animate-in">
              <div className="text-8xl font-black text-blue-600 tracking-tighter mb-4 italic italic-style">{seconds}</div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Ölçüm Başlıyor</p>
           </div>
        )}
      </div>

      <div className="w-full max-w-sm shrink-0 pb-6">
        {step === 'READY' && (
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nokta İsmi</label>
              <input type="text" value={pointName} onChange={e => setPointName(e.target.value)} placeholder="NOKTA-01" className="w-full p-4 bg-white rounded-2xl font-black text-center text-xl text-slate-900 outline-none border border-slate-200 uppercase" />
            </div>
            <button onClick={handleStartMeasurement} disabled={!pointName || !instantAccuracy} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all">ÖLÇÜMÜ BAŞLAT</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPSCapture;
