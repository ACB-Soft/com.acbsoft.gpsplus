import React, { useState } from 'react';
import { SavedLocation } from '../types';

interface Props {
  locations: SavedLocation[];
  onDelete: (id: string) => void;
  onRenameFolder: (oldN: string, newN: string) => void;
  onRenamePoint: (id: string, newN: string) => void;
  onDeleteFolder: (name: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

const SavedLocationsList: React.FC<Props> = ({ locations, onDelete, onRenameFolder, onRenamePoint, onDeleteFolder, onBulkDelete }) => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [expandedPoints, setExpandedPoints] = useState<string[]>([]);
  
  const folders: Record<string, SavedLocation[]> = {};
  locations.forEach(l => { 
    if (!folders[l.folderName]) folders[l.folderName] = []; 
    folders[l.folderName].push(l); 
  });

  const toggleFolder = (name: string) => {
    setExpanded(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  };

  const togglePoint = (id: string) => {
    setExpandedPoints(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleRenameFolder = (e: React.MouseEvent, oldName: string) => {
    e.stopPropagation();
    const newName = prompt("Proje adını düzenle:", oldName);
    if (newName && newName.trim() !== "" && newName !== oldName) {
      onRenameFolder(oldName, newName.trim());
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderName: string) => {
    e.stopPropagation();
    if (confirm(`"${folderName}" projesini ve içindeki tüm noktaları silmek istediğinize emin misiniz?`)) {
      onDeleteFolder(folderName);
    }
  };

  const handleDeletePoint = (e: React.MouseEvent, id: string, pointName: string) => {
    e.stopPropagation();
    if (confirm(`"${pointName}" noktasını silmek istediğinize emin misiniz?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {Object.entries(folders).length > 0 ? (
        Object.entries(folders).map(([name, locs]) => (
          <div key={name} className="soft-card overflow-hidden animate-in">
            <div onClick={() => toggleFolder(name)} className="p-6 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                  <i className="fas fa-folder text-lg"></i>
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-800 tracking-tight">{name}</h4>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{locs.length} Nokta</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleRenameFolder(e, name)} 
                  className="text-slate-400 p-2.5 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                  title="Projeyi Yeniden Adlandır"
                >
                  <i className="fas fa-pen text-xs"></i>
                </button>
                <button 
                  onClick={(e) => handleDeleteFolder(e, name)} 
                  className="text-slate-300 p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-90"
                  title="Projeyi Sil"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
            {expanded.includes(name) && (
              <div className="p-4 bg-slate-50/50 space-y-3 border-t border-slate-50">
                {locs.map(l => (
                  <div key={l.id} className="bg-white rounded-[1.8rem] border border-slate-100 overflow-hidden shadow-sm">
                    <div 
                      onClick={() => togglePoint(l.id)} 
                      className="p-5 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <h5 className="text-[15px] font-black text-slate-900 truncate">{l.name}</h5>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                          {expandedPoints.includes(l.id) ? 'Detayları Gizle' : 'Koordinatları Gör'}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleDeletePoint(e, l.id, l.name)} 
                        className="text-slate-200 p-2.5 hover:text-red-500 transition-colors active:scale-90"
                        title="Noktayı Sil"
                      >
                        <i className="fas fa-trash-can text-sm"></i>
                      </button>
                    </div>
                    {expandedPoints.includes(l.id) && (
                      <div className="px-5 pb-5 animate-in fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enlem</span>
                            <p className="text-[13px] mono-font text-slate-800 font-bold">{l.lat.toFixed(6)}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Boylam</span>
                            <p className="text-[13px] mono-font text-slate-800 font-bold">{l.lng.toFixed(6)}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Yükseklik</span>
                            <p className="text-[14px] mono-font text-blue-600 font-black">{l.altitude !== null ? `${Math.round(l.altitude)}m` : '---'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hassasiyet</span>
                            <p className="text-[14px] mono-font text-emerald-600 font-black">±{l.accuracy.toFixed(1)}m</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="p-12 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm">
            <i className="fas fa-folder-open text-2xl"></i>
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs">Henüz Proje Yok</h4>
            <p className="text-[11px] text-slate-400 font-bold">Yeni bir ölçüm yaparak başlayabilirsiniz.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedLocationsList;