import React, { useState } from 'react';
import { SavedLocation } from '../types';
import { downloadKML } from './KMLUtils';
import { downloadExcel } from './ExcelUtils';
import { downloadTXT } from './TxtUtils';
import JSZip from 'jszip';

interface Props {
  locations: SavedLocation[];
}

const ExportUnifiedView: React.FC<Props> = ({ locations }) => {
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [isExportingPhotos, setIsExportingPhotos] = useState(false);

  const uniqueFolders: string[] = Array.from(new Set(locations.map(loc => loc.folderName)));
  
  const getFiltered = () => locations.filter(loc => selectedFolders.includes(loc.folderName));

  const toggleFolder = (name: string) => {
    setSelectedFolders(prev => 
      prev.includes(name) 
        ? prev.filter(f => f !== name) 
        : [...prev, name]
    );
  };

  const handleDownloadPhotos = async () => {
    if (selectedFolders.length === 0) return alert("Lütfen en az bir proje seçin.");
    const filtered = getFiltered().filter(loc => loc.photo);
    if (filtered.length === 0) return alert("Seçili projelerde fotoğraf bulunamadı.");
    
    setIsExportingPhotos(true);
    try {
      const zip = new JSZip();
      filtered.forEach(loc => {
        if (loc.photo) {
          const base64Data = loc.photo.split(',')[1];
          const fileName = `${loc.folderName.replace(/\s+/g, '_')}_${loc.name.replace(/\s+/g, '_')}.jpg`;
          zip.file(fileName, base64Data, { base64: true });
        }
      });
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Saha_Fotograflari_${new Date().getTime()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) { 
      console.error(e);
      alert("Hata oluştu."); 
    }
    finally { setIsExportingPhotos(false); }
  };

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
          <i className="fas fa-file-export text-xl text-slate-400"></i>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Aktarılacak Kayıt Yok</p>
      </div>
    );
  }

  const isExportDisabled = selectedFolders.length === 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-3 max-h-[35vh] overflow-y-auto no-scrollbar px-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 mb-2">Proje Seçimi</h4>
        {uniqueFolders.map((name: string) => {
          const isSelected = selectedFolders.includes(name);
          const count = locations.filter(l => l.folderName === name).length;
          
          return (
            <button 
              key={name} 
              onClick={() => toggleFolder(name)} 
              className={`w-full p-5 rounded-3xl border transition-all flex items-center justify-between text-left shadow-sm ${
                isSelected 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-blue-100' 
                  : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-white border-white' : 'border-slate-200'
                }`}>
                  {isSelected && <i className="fas fa-check text-blue-600 text-[10px]"></i>}
                </div>
                <div>
                  <div className="font-extrabold text-sm">{name}</div>
                  <div className={`text-[9px] uppercase font-black tracking-widest ${
                    isSelected ? 'text-white/60' : 'text-slate-400'
                  }`}>
                    {count} Nokta Kayıtlı
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-8 flex flex-col">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 mb-2">Aktarma Seçenekleri</h4>
        
        {/* KML */}
        <button 
          onClick={() => downloadKML(getFiltered())} 
          disabled={isExportDisabled} 
          className="w-full p-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-20 text-white rounded-3xl font-bold text-xs uppercase tracking-widest flex items-center gap-5 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
             <i className="fas fa-earth-europe text-xl"></i>
          </div>
          <span className="text-left">Google Earth Dökümanı Olarak Aktar (.KML)</span>
        </button>

        {/* EXCEL */}
        <button 
          onClick={() => downloadExcel(getFiltered())} 
          disabled={isExportDisabled} 
          className="w-full p-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-20 text-white rounded-3xl font-bold text-xs uppercase tracking-widest flex items-center gap-5 active:scale-[0.98] transition-all shadow-lg shadow-emerald-100"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
             <i className="fas fa-file-excel text-xl"></i>
          </div>
          <span className="text-left">Excel Dökümanı Olarak Aktar (.XLSX)</span>
        </button>

        {/* ZIP */}
        <button 
          onClick={handleDownloadPhotos} 
          disabled={isExportDisabled || isExportingPhotos} 
          className={`w-full p-6 rounded-3xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center gap-5 shadow-lg ${
            isExportingPhotos || isExportDisabled
              ? 'bg-slate-200 text-slate-400 shadow-none opacity-50 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
          }`}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
             <i className={isExportingPhotos ? "fas fa-spinner animate-spin" : "fas fa-file-zipper text-xl"}></i>
          </div>
          <span className="text-left">{isExportingPhotos ? 'Arşiv Hazırlanıyor...' : 'Fotoğrafları Arşivleyerek Aktar (.ZIP)'}</span>
        </button>

        {/* TXT */}
        <button 
          onClick={() => downloadTXT(getFiltered())} 
          disabled={isExportDisabled} 
          className="w-full p-6 bg-amber-600 hover:bg-amber-700 disabled:opacity-20 text-white rounded-3xl font-bold text-xs uppercase tracking-widest flex items-center gap-5 active:scale-[0.98] transition-all shadow-lg shadow-amber-100"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
             <i className="fas fa-file-lines text-xl"></i>
          </div>
          <span className="text-left">Metin Belgesi Olarak Aktar (.TXT)</span>
        </button>
      </div>
    </div>
  );
};

export default ExportUnifiedView;