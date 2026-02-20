import React, { useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { SavedLocation } from '../types';
import { generateKML } from './KMLUtils';
import { generateExcelBase64 } from './ExcelUtils';
import { generateTXT } from './TxtUtils';

interface Props {
  locations: SavedLocation[];
}

const ExportUnifiedView: React.FC<Props> = ({ locations }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const uniqueFolders: string[] = Array.from(new Set(locations.map(l => l.folderName)));
  
  const getFiltered = () => locations.filter(l => selected.includes(l.folderName));
  const toggle = (name: string) => setSelected(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);

  const hasSelection = selected.length > 0;

  // Evrensel Dosya Kaydetme Motoru (Hem Android hem Web için)
  const saveFileToDevice = async (content: string, fileName: string, isBase64: boolean = false) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Documents, // Android'de Belgeler klasörüne kaydeder
          encoding: isBase64 ? undefined : Encoding.UTF8, // Excel base64 olduğu için encoding belirtmiyoruz
        });
        alert(`✅ Dosya başarıyla kaydedildi!\n\nTelefonunuzun 'Dosyalarım > Belgeler' (Documents) klasöründen '${fileName}' dosyasını bulabilirsiniz.`);
      } catch (error: any) {
        console.error("Kaydetme hatası:", error);
        alert(`❌ Dosya kaydedilemedi:\n${error.message}`);
      }
    } else {
      // Web sürümü için standart indirme mantığı (Geriye Dönük Uyumluluk)
      const blob = isBase64 
        ? new Blob([Uint8Array.from(atob(content), c => c.charCodeAt(0))]) 
        : new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleKML = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const content = generateKML(getFiltered());
    saveFileToDevice(content, `GPS_Saha_Verisi_${timestamp}.kml`);
  };

  const handleExcel = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const contentBase64 = generateExcelBase64(getFiltered());
    saveFileToDevice(contentBase64, `GPS_Saha_Verisi_${timestamp}.xlsx`, true);
  };

  const handleTXT = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const content = generateTXT(getFiltered());
    saveFileToDevice(content, `GPS_Saha_Verisi_${timestamp}.txt`);
  };

  const handleBackupJSON = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const content = JSON.stringify(locations, null, 2);
    saveFileToDevice(content, `GPS_Plus_Yedek_${timestamp}.json`);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Proje Seçimi</h4>
        
        {uniqueFolders.length > 0 ? (
          uniqueFolders.map(name => (
            <button 
              key={name} 
              onClick={() => toggle(name)} 
              className={`w-full p-5 rounded-3xl border transition-all duration-300 flex items-center justify-between shadow-sm ${
                selected.includes(name) 
                ? 'bg-blue-600 border-blue-500 text-white ring-4 ring-blue-50' 
                : 'bg-white border-slate-100 text-slate-800 active:bg-slate-50'
              }`}
            >
              <div className="font-extrabold text-sm">{name}</div>
              <div className={`text-[9px] font-black uppercase ${selected.includes(name) ? 'text-white/60' : 'text-slate-400'}`}>
                {locations.filter(l => l.folderName === name).length} Nokta
              </div>
            </button>
          ))
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kayıtlı Proje Bulunamadı</p>
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-8">
        <button 
          onClick={handleKML} 
          disabled={!hasSelection} 
          className={`w-full p-6 text-white rounded-3xl font-bold text-xs uppercase flex items-center gap-5 transition-all duration-300 shadow-xl ${
            hasSelection ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-300 opacity-40 grayscale cursor-not-allowed shadow-none'
          }`}
        >
          <i className="fas fa-earth-europe text-xl"></i>
          <span>Google Earth (.KML)</span>
        </button>

        <button 
          onClick={handleExcel} 
          disabled={!hasSelection} 
          className={`w-full p-6 text-white rounded-3xl font-bold text-xs uppercase flex items-center gap-5 transition-all duration-300 shadow-xl ${
            hasSelection ? 'bg-emerald-600 shadow-emerald-200' : 'bg-slate-300 opacity-40 grayscale cursor-not-allowed shadow-none'
          }`}
        >
          <i className="fas fa-file-excel text-xl"></i>
          <span>Excel Dökümanı (.XLSX)</span>
        </button>

        <button 
          onClick={handleTXT} 
          disabled={!hasSelection} 
          className={`w-full p-6 text-white rounded-3xl font-bold text-xs uppercase flex items-center gap-5 transition-all duration-300 shadow-xl ${
            hasSelection ? 'bg-amber-600 shadow-amber-200' : 'bg-slate-300 opacity-40 grayscale cursor-not-allowed shadow-none'
          }`}
        >
          <i className="fas fa-file-lines text-xl"></i>
          <span>Metin Belgesi (.TXT)</span>
        </button>

        <div className="pt-4">
          <button 
            onClick={handleBackupJSON} 
            className="w-full p-4 bg-slate-800 text-white/70 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all border border-slate-700"
          >
            <i className="fas fa-download"></i>
            Tüm Veriyi Yedekle (.JSON)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportUnifiedView;
