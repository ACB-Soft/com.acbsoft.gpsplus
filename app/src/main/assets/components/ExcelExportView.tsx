
import React, { useState } from 'react';
import { SavedLocation } from '../types';
import { downloadExcel } from './ExcelUtils';

interface Props {
  locations: SavedLocation[];
}

const ExcelExportView: React.FC<Props> = ({ locations }) => {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const uniqueJobs: string[] = Array.from(new Set(locations.map(loc => loc.name)));

  const toggleJob = (jobName: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobName) 
        ? prev.filter(j => j !== jobName) 
        : [...prev, jobName]
    );
  };

  const handleDownload = () => {
    if (selectedJobs.length === 0) {
      alert("Lütfen en az bir iş seçin.");
      return;
    }
    const filtered = locations.filter(loc => selectedJobs.includes(loc.name));
    downloadExcel(filtered);
  };

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
          <i className="fas fa-file-excel text-xl text-slate-400"></i>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 px-8">Aktarılacak Kayıt Yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center px-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Excel Veri Seçimi</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">Excel (.xlsx) formatında indirmek istediğiniz saha çalışmalarını seçin.</p>
      </div>

      <div className="space-y-3">
        {uniqueJobs.map((jobName, index) => {
          const isSelected = selectedJobs.includes(jobName);
          const count = locations.filter(l => l.name === jobName).length;
          
          return (
            <button
              key={index}
              onClick={() => toggleJob(jobName)}
              className={`w-full p-5 rounded-3xl border transition-all flex items-center justify-between text-left ${
                isSelected 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-100' 
                  : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'bg-white border-white' : 'border-slate-200'
                }`}>
                  {isSelected && <i className="fas fa-check text-emerald-600 text-[10px]"></i>}
                </div>
                <div>
                  <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-800'}`}>{jobName}</div>
                  <div className={`text-[9px] uppercase font-black tracking-widest opacity-60`}>{count} Nokta</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={handleDownload}
          disabled={selectedJobs.length === 0}
          className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-20 text-white rounded-[1.5rem] font-bold transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95"
        >
          <i className="fas fa-file-excel"></i>
          Excel Olarak İndir (.xlsx)
        </button>
        
        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-70 px-6">
          Veriler Enlem, Boylam ve MSL Rakım bilgilerini içerir.
        </p>
      </div>
    </div>
  );
};

export default ExcelExportView;
