import React, { useState } from 'react';
import { SavedLocation } from '../types';

interface Props {
  locations: SavedLocation[];
  onDelete: (id: string) => void;
  onRenameFolder: (oldName: string, newName: string) => void;
  onRenamePoint: (id: string, newName: string) => void;
  onDeleteFolder: (folderName: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

const SavedLocationsList: React.FC<Props> = ({ 
  locations, 
  onDelete, 
  onRenameFolder, 
  onRenamePoint,
  onDeleteFolder,
  onBulkDelete 
}) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingFolder, setEditingFolder] = useState<{old: string, new: string} | null>(null);
  const [editingPoint, setEditingPoint] = useState<{id: string, new: string} | null>(null);
  const [detailPoint, setDetailPoint] = useState<SavedLocation | null>(null);

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
          <i className="fas fa-folder-open text-xl text-slate-400"></i>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 px-8">Kayıtlı Proje Yok</p>
      </div>
    );
  }

  const folders: Record<string, SavedLocation[]> = {};
  locations.forEach(loc => {
    if (!folders[loc.folderName]) folders[loc.folderName] = [];
    folders[loc.folderName].push(loc);
  });

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(f => f !== folderName) 
        : [...prev, folderName]
    );
  };

  const handlePointSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFolderSelect = (folderName: string, pointIds: string[]) => {
    const allSelectedInFolder = pointIds.every(id => selectedIds.includes(id));
    if (allSelectedInFolder) {
      setSelectedIds(prev => prev.filter(id => !pointIds.includes(id)));
    } else {
      const newSelection = [...new Set([...selectedIds, ...pointIds])];
      setSelectedIds(newSelection);
    }
  };

  const handleBulkDeleteAction = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`${selectedIds.length} adet kaydı silmek istediğinize emin misiniz?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  const startRename = (e: React.MouseEvent, folderName: string) => {
    e.stopPropagation();
    setEditingFolder({ old: folderName, new: folderName });
  };

  const submitRename = () => {
    if (editingFolder && editingFolder.new.trim() && editingFolder.new !== editingFolder.old) {
      onRenameFolder(editingFolder.old, editingFolder.new);
    }
    setEditingFolder(null);
  };

  const startPointRename = (e: React.MouseEvent, loc: SavedLocation) => {
    e.stopPropagation();
    setEditingPoint({ id: loc.id, new: loc.name });
  };

  const submitPointRename = () => {
    if (editingPoint && editingPoint.new.trim()) {
      onRenamePoint(editingPoint.id, editingPoint.new);
    }
    setEditingPoint(null);
  };

  const confirmDeleteFolder = (e: React.MouseEvent, folderName: string) => {
    e.stopPropagation();
    if (confirm(`'${folderName}' projesini ve içindeki tüm kayıtları silmek istediğinize emin misiniz?`)) {
      onDeleteFolder(folderName);
    }
  };

  return (
    <div className="space-y-4 pb-24 px-1 relative">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {isSelectionMode ? `${selectedIds.length} Seçili` : 'Yönetim'}
        </h3>
        <button 
          onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            setSelectedIds([]);
          }}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            isSelectionMode ? 'bg-slate-200 text-slate-600' : 'bg-blue-50 text-blue-600'
          }`}
        >
          {isSelectionMode ? 'İptal' : 'Toplu Seçim'}
        </button>
      </div>

      {Object.entries(folders).map(([folderName, folderLocations], fIndex) => {
        const isExpanded = expandedFolders.includes(folderName);
        const folderPointIds = folderLocations.map(l => l.id);
        const allSelected = folderPointIds.every(id => selectedIds.includes(id));
        const someSelected = folderPointIds.some(id => selectedIds.includes(id));

        return (
          <div key={folderName} className="space-y-2 animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${fIndex * 50}ms` }}>
            <div className={`soft-card overflow-hidden border-none transition-all ${isExpanded ? 'ring-2 ring-blue-100 shadow-blue-100' : ''}`}>
              <div 
                onClick={() => toggleFolder(folderName)}
                className={`p-5 flex items-center justify-between cursor-pointer ${
                  isExpanded ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {isSelectionMode && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleFolderSelect(folderName, folderPointIds); }}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                        allSelected ? 'bg-white border-white' : someSelected ? 'bg-white/40 border-white/60' : 'border-slate-200'
                      }`}
                    >
                      {allSelected && <i className="fas fa-check text-blue-600 text-[10px]"></i>}
                      {!allSelected && someSelected && <div className="w-2 h-0.5 bg-blue-600 rounded-full"></div>}
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isExpanded ? 'bg-white/20' : 'bg-blue-50 text-blue-500'
                  }`}>
                    <i className="fas fa-folder"></i>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    {editingFolder?.old === folderName ? (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <input 
                          autoFocus
                          value={editingFolder.new}
                          onChange={e => setEditingFolder({...editingFolder, new: e.target.value})}
                          onBlur={submitRename}
                          onKeyDown={e => e.key === 'Enter' && submitRename()}
                          className={`border rounded-lg px-2 py-1 w-full font-bold outline-none transition-colors ${
                            isExpanded 
                              ? 'bg-white/20 border-white/40 text-white placeholder:text-white/40' 
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    ) : (
                      <h4 className="font-extrabold text-sm truncate">{folderName}</h4>
                    )}
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isExpanded ? 'text-white/60' : 'text-slate-400'}`}>
                      {folderLocations.length} Nokta
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                   {!isSelectionMode && (
                     <div className="flex gap-1">
                        <button 
                          onClick={(e) => startRename(e, folderName)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-400'}`}
                        >
                          <i className="fas fa-pencil text-[10px]"></i>
                        </button>
                        <button 
                          onClick={(e) => confirmDeleteFolder(e, folderName)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-400'}`}
                        >
                          <i className="fas fa-trash text-[10px]"></i>
                        </button>
                     </div>
                   )}
                   <i className={`fas fa-chevron-down text-[10px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
                </div>
              </div>

              {isExpanded && (
                <div className="p-3 bg-slate-50/50 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {folderLocations.map((loc) => {
                    const isSelected = selectedIds.includes(loc.id);
                    return (
                      <div 
                        key={loc.id} 
                        onClick={() => isSelectionMode ? handlePointSelect(loc.id) : setDetailPoint(loc)}
                        className={`bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3 relative transition-all active:scale-[0.98] ${
                          isSelected ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-100'
                        }`}
                      >
                        {isSelectionMode && (
                           <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                             isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'
                           }`}>
                             {isSelected && <i className="fas fa-check text-[8px]"></i>}
                           </div>
                        )}
                        <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          {loc.photo ? (
                            <img src={loc.photo} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                               <i className="fas fa-camera text-sm"></i>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           {editingPoint?.id === loc.id ? (
                             <input 
                               autoFocus
                               onClick={e => e.stopPropagation()}
                               value={editingPoint.new}
                               onChange={e => setEditingPoint({...editingPoint, new: e.target.value})}
                               onBlur={submitPointRename}
                               onKeyDown={e => e.key === 'Enter' && submitPointRename()}
                               className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2 py-1 w-full font-bold outline-none text-xs"
                             />
                           ) : (
                             <h5 className="font-bold text-slate-800 text-xs truncate mb-1">{loc.name}</h5>
                           )}
                           <div className="flex flex-col gap-1.5">
                              <div className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded self-start text-[9px] font-bold mono-font">
                                Yükseklik: {loc.altitude !== null ? Math.round(loc.altitude) : '---'}m
                              </div>
                              <div className="flex flex-col gap-0.5 text-[9px] mono-font text-slate-500">
                                <div className="flex justify-between border-b border-slate-50 pb-0.5">
                                  <span className="opacity-60 text-[8px] uppercase font-black">Enlem:</span>
                                  <span className="font-bold text-slate-700">{loc.lat.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between pt-0.5">
                                  <span className="opacity-60 text-[8px] uppercase font-black">Boylam:</span>
                                  <span className="font-bold text-slate-700">{loc.lng.toFixed(6)}</span>
                                </div>
                              </div>
                           </div>
                        </div>

                        {!isSelectionMode && (
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={(e) => startPointRename(e, loc)}
                              className="text-slate-300 hover:text-blue-500 p-2"
                            >
                              <i className="fas fa-pen text-[10px]"></i>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDelete(loc.id); }}
                              className="text-slate-300 hover:text-red-500 p-2"
                            >
                              <i className="fas fa-trash text-[10px]"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isSelectionMode && selectedIds.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 animate-in slide-in-from-bottom-10 duration-500">
           <button 
             onClick={handleBulkDeleteAction}
             className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-bold shadow-2xl shadow-red-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
           >
             <i className="fas fa-trash-can"></i>
             Seçilen {selectedIds.length} Kaydı Sil
           </button>
        </div>
      )}

      {detailPoint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailPoint(null)}></div>
          <div className="soft-card w-full max-w-sm bg-white p-6 relative z-10 animate-in zoom-in-95 duration-300 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xl font-extrabold text-slate-800">{detailPoint.name}</h4>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{detailPoint.folderName}</p>
              </div>
              <button onClick={() => setDetailPoint(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {detailPoint.photo && (
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                <img src={detailPoint.photo} className="w-full h-full object-cover" alt="" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Enlem</p>
                <p className="mono-font text-xs font-bold text-slate-800">{detailPoint.lat.toFixed(7)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Boylam</p>
                <p className="mono-font text-xs font-bold text-slate-800">{detailPoint.lng.toFixed(7)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Yükseklik</p>
                <p className="mono-font text-xs font-bold text-blue-600">{detailPoint.altitude ? `${Math.round(detailPoint.altitude)}m` : '---'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Hassasiyet</p>
                <p className="mono-font text-xs font-bold text-slate-800">±{detailPoint.accuracy.toFixed(1)}m</p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Tarih: {new Date(detailPoint.timestamp).toLocaleString('tr-TR')}
              </p>
            </div>
            
            <button 
              onClick={() => setDetailPoint(null)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-all"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedLocationsList;