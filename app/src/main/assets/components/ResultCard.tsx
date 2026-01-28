import React, { useState, useRef, useEffect } from 'react';
import { SavedLocation } from '../types';

interface Props {
  location: SavedLocation;
  onUpdatePhoto?: (photo: string) => void;
}

const ResultCard: React.FC<Props> = ({ location, onUpdatePhoto }) => {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera error:", err);
          setShowCamera(false);
          alert("Kameraya erişilemedi.");
        });
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && onUpdatePhoto) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onUpdatePhoto(dataUrl);
      setShowCamera(false);
    }
  };

  if (showCamera) {
    return (
      <div className="soft-card p-6 border-blue-200 shadow-2xl space-y-6 animate-in zoom-in-95 duration-500">
         <div className="text-center space-y-1">
            <h3 className="text-lg font-extrabold text-slate-800">Saha Fotoğrafı Al</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Kamerayı Odağa Alın</p>
        </div>
        
        <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden shadow-inner">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none border-[20px] border-white/5"></div>
        </div>

        <div className="flex gap-3">
            <button 
                onClick={capturePhoto}
                className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95"
            >
                <i className="fas fa-camera"></i> Çek
            </button>
            <button 
                onClick={() => setShowCamera(false)}
                className="px-6 py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase active:scale-95"
            >
                Vazgeç
            </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="soft-card p-8 border-blue-100 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-500 text-center">
      {location.photo ? (
        <div className="w-full h-48 rounded-[1.5rem] overflow-hidden mb-2 shadow-inner border border-slate-100 relative group">
           <img src={location.photo} className="w-full h-full object-cover" alt="Saha Görünümü" />
           <button 
             onClick={() => setShowCamera(true)}
             className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center text-blue-600 active:scale-90"
           >
             <i className="fas fa-camera-rotate"></i>
           </button>
        </div>
      ) : (
        <div className="w-full py-8 bg-slate-50 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group hover:bg-blue-50/30 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-400 transition-colors">
                <i className="fas fa-camera text-2xl"></i>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Görsel Kanıt Bulunamadı</p>
                <button 
                    onClick={() => setShowCamera(true)}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white px-4 py-2 rounded-lg shadow-sm active:scale-95"
                >
                    Şimdi Fotoğraf Ekle
                </button>
            </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-1">
        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Ölçüm Detayları</h3>
        <p className="text-xl font-extrabold text-slate-800">{location.name}</p>
        <p className="text-[10px] text-slate-400 font-bold">{location.folderName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Enlem */}
        <div 
          onClick={() => copyToClipboard(location.lat.toString())}
          className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-100 transition-all cursor-pointer text-left"
        >
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Enlem</div>
          <div className="text-lg font-bold text-slate-800 mono-font truncate">{location.lat.toFixed(6)}</div>
        </div>

        {/* Boylam */}
        <div 
          onClick={() => copyToClipboard(location.lng.toString())}
          className="bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-100 transition-all cursor-pointer text-left"
        >
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Boylam</div>
          <div className="text-lg font-bold text-slate-800 mono-font truncate">{location.lng.toFixed(6)}</div>
        </div>

        {/* Yükseklik */}
        <div 
          className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left relative"
        >
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Yükseklik (m)</div>
          <div className="text-lg font-bold text-slate-800 mono-font truncate">
            {location.altitude !== null ? Math.round(location.altitude) : '---'}
          </div>
        </div>

        {/* Hassasiyet */}
        <div 
          className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left"
        >
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 text-emerald-600">Hassasiyet</div>
          <div className="text-lg font-bold text-slate-800 mono-font truncate">
            ±{location.accuracy.toFixed(1)}m
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;