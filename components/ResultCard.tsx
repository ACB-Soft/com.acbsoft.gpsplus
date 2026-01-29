import React from 'react';
import { SavedLocation } from '../types';

interface Props {
  location: SavedLocation;
}

const ResultCard: React.FC<Props> = ({ location }) => {
  return (
    <div className="soft-card p-6 md:p-8 border-blue-100 space-y-6 md:space-y-8 text-center animate-in relative overflow-hidden bg-white max-w-sm mx-auto">
      <div className="space-y-2 md:space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] leading-none">Kayıt Edildi</span>
        </div>
        <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none tracking-tight truncate px-4">{location.name}</h3>
        <p className="text-[11px] md:text-[12px] font-black text-blue-600 uppercase tracking-[0.3em] opacity-80 leading-none">{location.folderName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-slate-50/80 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 text-left">
          <div className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase mb-1 leading-none">Enlem</div>
          <div className="text-[14px] md:text-[16px] font-bold text-slate-900 mono-font leading-none">{location.lat.toFixed(6)}</div>
        </div>
        <div className="bg-slate-50/80 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 text-left">
          <div className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase mb-1 leading-none">Boylam</div>
          <div className="text-[14px] md:text-[16px] font-bold text-slate-900 mono-font leading-none">{location.lng.toFixed(6)}</div>
        </div>
        <div className="bg-blue-50/80 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-blue-100 text-left">
          <div className="text-[9px] md:text-[10px] text-blue-500 font-black uppercase mb-1 leading-none">Yükseklik</div>
          <div className="text-xl md:text-2xl font-black text-blue-600 mono-font leading-none">{location.altitude !== null ? Math.round(location.altitude) : '---'}<span className="text-[10px] ml-1">m</span></div>
        </div>
        <div className="bg-emerald-50/80 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-emerald-100 text-left">
          <div className="text-[9px] md:text-[10px] text-emerald-500 font-black uppercase mb-1 leading-none">Hassasiyet</div>
          <div className="text-xl md:text-2xl font-black text-emerald-600 mono-font leading-none">±{location.accuracy.toFixed(1)}<span className="text-[10px] ml-1">m</span></div>
        </div>
      </div>
      
      <div className="pt-5 md:pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] md:text-[11px] font-black text-slate-400 uppercase px-1">
        <span>Kayıt Tarihi</span>
        <span className="text-slate-800 opacity-80 mono-font">{new Date(location.timestamp).toLocaleString('tr-TR')}</span>
      </div>
    </div>
  );
};

export default ResultCard;