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

  useEffect(() => {
    const requestGPSPermission = async () => {
      try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
      } catch (error) {
        console.error("GPS İzin hatası:", error);
      }
    };
    requestGPSPermission();
  }, []);

  const getNextPointName = useCallback((projName: string) => {
    const projPoints = existingLocations.filter(l => l.folderName === projName);
    return `Nokta ${projPoints.length + 1}`;
  }, [existingLocations]);

  useEffect(() => {
    if (folderName) setPointName(getNextPointName(folderName));
  }, [folderName, getNextPointName]);

  useEffect(() => {
    if (step === 'READY' || step === 'COUNTDOWN') {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setInstantAccuracy(pos.coords.accuracy);
          lastPositionRef.current = pos;
          if (step === 'COUNTDOWN' && waitingForSignal) setWaitingForSignal(false);
          if (step === 'COUNTDOWN' && !waitingForSignal) {
            const msl = convertToMSL(pos.coords.latitude, pos.coords.longitude, pos.coords.altitude);
            samplesRef.current.push({
              lat: pos.coords.latitude, lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy, altitude: msl, timestamp: Date.now()
            });
            setSampleCount(samplesRef.current.length);
          }
        },
        (err) => { setInstantAccuracy(null); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
    return () => { 
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [step, waitingForSignal]);

  const processSamples = useCallback(() => {
    let samples = [...samplesRef.current];
    if (samples.length === 0 && lastPositionRef.current) {
      const p = lastPositionRef.current;
      samples.push({ 
        lat: p.coords.latitude, 
        lng: p.coords.longitude, 
        accuracy: p.coords.accuracy, 
        altitude: convertToMSL(p.coords.latitude, p.coords.longitude, p.coords.altitude), 
        timestamp: Date.now() 
      });
    }
    if (samples.length === 0) {
      alert("Konum verisi alınamadı.");
      setStep('READY');
      return;
    }
    const avg = {
      lat: samples.reduce((a, b) => a + b.lat, 0) / samples.length,
      lng: samples.reduce((a, b) => a + b.lng, 0) / samples.length,
      accuracy: samples.reduce((a, b) => a + b.accuracy, 0) / samples.length,
      altitude: samples.reduce((a, b) => a + (b.altitude || 0), 0) / samples.length,
      timestamp: Date.now()
    };
    onComplete(avg, folderName, pointName, '');
  }, [folderName, pointName, onComplete]);

  useEffect(() => {
    let timer: any;
    if (step === 'COUNTDOWN' && !waitingForSignal && seconds > 0) {
      timer = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (step === 'COUNTDOWN' && !waitingForSignal && seconds === 0) {
      processSamples();
    }
    return () => clearInterval(timer);
  }, [step, seconds, processSamples, waitingForSignal]);

  const handleStartMeasurement = () => {
    samplesRef.current = [];
    setSeconds(5);
    if (lastPositionRef.current && instantAccuracy !== null) setWaitingForSignal(false);
    else setWaitingForSignal(true);
    setStep('COUNTDOWN');
  };

  const getAccuracyColor = (acc: number | null) => {
    if (acc === null) return "text-slate-300";
    if (acc <= 5) return "text-emerald-500";
    if (acc <= 15) return "text-amber-500";
    return "text-red-500";
  };
  
  const getAccuracyBg = (acc: number | null) => {
     if (acc === null) return "bg-slate-50 border-slate-200";
     if (acc <= 5) return "bg-emerald-50 border-emerald-200";
     if (acc <= 15) return "bg-amber-50 border-amber-200";
     return "bg-red-50 border-red-200";
  };

  if (step === 'SELECT_MODE') return (
    <div className="w-full flex flex-col bg-[#F8FAFC] h-full relative overflow-hidden">
      <header className="px-8 pt-10 pb-6 flex items-center gap-5 bg-white w-full">
        <button onClick={onCancel} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 text-slate-800"><i className="fas fa-chevron-left"></i></button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ölçüm Başlat</h2>
      </header>
      <div className="w-full max-w-sm px-8 pt-8 space-y-4 mx-auto">
        <button onClick={() => { setIsNewProject(true); setFolderName(''); setStep('FORM'); }} className="w-full p-6 bg-white rounded-3xl shadow-md border border-slate-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fas fa-folder-plus text-xl"></i></div>
          <span className="font-black text-lg text-slate-900">Yeni Proje Oluştur</span>
        </button>
        <button onClick={() => { setIsNewProject(false); setStep('FORM'); }} className="w-full p-6 bg-white rounded-3xl shadow-md border border-slate-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fas fa-folder-open text-xl"></i></div>
          <span className="font-black text-lg text-slate-900">Mevcut Proje Seç</span>
        </button>
      </div>
    </div>
  );

  if (step === 'FORM') return (
    <div className="w-full flex flex-col bg-[#F8FAFC] h-full relative overflow-hidden">
      <header className="px-8 pt-10 pb-6 flex items-center gap-5 bg-white w-full">
        <button onClick={() => setStep('SELECT_MODE')} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 text-slate-800"><i className="fas fa-chevron-left"></i></button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Proje Bilgisi</h2>
      </header>
      <div className="w-full max-w-sm px-8 pt-8 mx-auto">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Proje Adı</label>
            {isNewProject ? (
              <input type="text" placeholder="Örn: Saha Çalışması A" value={folderName} onChange={e => setFolderName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all" />
            ) : (
              <select value={folderName} onChange={e => setFolderName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none w-full">
                <option value="">Seçiniz...</option>
                {Array.from(new Set(existingLocations.map(l => l.folderName))).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
          </div>
          <button 
            disabled={!folderName.trim()}
            onClick={() => { localStorage.setItem('last_folder_name', folderName); setStep('READY'); }} 
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] disabled:opacity-30"
          >
            ÖLÇÜME HAZIRLAN
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-around p-8 bg-white h-full text-center relative overflow-hidden">
      <button onClick={() => step === 'COUNTDOWN' ? setStep('READY') : setStep('FORM')} className="absolute left-6 top-10 w-11 h-11 flex items-center justify-center rounded-2xl bg-white shadow-lg border border-slate-100 text-slate-800 z-20">
        <i className="fas fa-chevron-left text-sm"></i>
      </button>
      
      <div className="space-y-2 pt-10 shrink-0">
        <h3 className="text-2xl font-black text-slate-900 truncate max-w-[320px] px-4 leading-tight">{folderName}</h3>
      </div>

      <div className="relative flex items-center justify-center flex-1 w-full max-h-[350px]">
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-[3.5rem] border-8 border-slate-50 shadow-2xl flex items-center justify-center relative bg-white">
          <div className={`absolute inset-4 border-2 rounded-[2.8rem] ${instantAccuracy && instantAccuracy <= 10 ? 'border-emerald-100' : 'border-slate-50'}`}></div>
          
          <span className="text-7xl md:text-9xl font-black text-slate-900 z-10 tracking-tighter">
            {waitingForSignal ? (
              <i className="fas fa-satellite fa-spin text-blue-600 text-4xl"></i>
            ) : (
              step === 'COUNTDOWN' ? seconds : <i className={`fas fa-satellite-dish text-5xl transition-all ${getAccuracyColor(instantAccuracy)}`}></i>
            )}
          </span>

          {instantAccuracy !== null && (
             <div className={`absolute -bottom-4 px-5 py-2.5 rounded-2xl border-2 shadow-xl flex items-center gap-2.5 bg-white ${getAccuracyBg(instantAccuracy)}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${getAccuracyColor(instantAccuracy).replace('text','bg')} animate-pulse`}></div>
                <span className={`text-[12px] font-black ${getAccuracyColor(instantAccuracy)}`}>±{instantAccuracy.toFixed(1)}m</span>
             </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-sm shrink-0 pb-6">
        {step === 'READY' ? (
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nokta İsmi</label>
              <input type="text" value={pointName} onChange={e => setPointName(e.target.value)} className="w-full p-4 bg-white rounded-2xl font-black text-center text-xl text-slate-900 outline-none border border-slate-200" />
            </div>
            
            <button 
              onClick={handleStartMeasurement} 
              disabled={instantAccuracy === null}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-[13px] active:scale-[0.96] disabled:bg-slate-200 transition-all uppercase tracking-[0.25em] shadow-xl shadow-emerald-100"
            >
              ÖLÇÜMÜ BAŞLAT
            </button>
          </div>
        ) : (
          <div className="space-y-2 py-4">
            <p className="font-black text-emerald-600 text-[12px] uppercase tracking-[0.3em]">{sampleCount} PAKET VERİ</p>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">SABİT TUTUN</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPSCapture;
