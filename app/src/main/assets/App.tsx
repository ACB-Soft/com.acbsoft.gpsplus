import React, { useState, useEffect, useCallback } from 'react';
import { AppStatus, Coordinate, SavedLocation } from './types';
import { FULL_BRAND } from './version';
import GPSCapture from './components/GPSCapture';
import ResultCard from './components/ResultCard';
import SavedLocationsList from './components/SavedLocationsList';
import ExportUnifiedView from './components/ExportUnifiedView';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentLocation, setCurrentLocation] = useState<SavedLocation | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'export' | 'none'>('none');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [isContinuing, setIsContinuing] = useState<boolean>(false);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  // 1. Geri Tuşu Dinleyicisi ve Senkronizasyon
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setStatus(AppStatus.IDLE);
      setActiveTab('none');
      setCurrentLocation(null);
      setIsContinuing(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Navigasyon State Takibi (Push State)
  useEffect(() => {
    const isAtHome = status === AppStatus.IDLE && activeTab === 'none' && !showOnboarding;
    
    if (!isAtHome && !showOnboarding) {
      if (!window.history.state || window.history.state.view !== 'sub-view') {
        window.history.pushState({ view: 'sub-view' }, '');
      }
    }
  }, [status, activeTab, showOnboarding]);

  useEffect(() => {
    const onboardingDone = localStorage.getItem('onboarding_v4_done');
    if (onboardingDone) {
      setShowOnboarding(false);
    }

    const stored = localStorage.getItem('gps_locations_v4');
    if (stored) {
      try {
        setSavedLocations(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored locations", e);
      }
    }
  }, []);

  const saveLocations = (updated: SavedLocation[]) => {
    setSavedLocations(updated);
    localStorage.setItem('gps_locations_v4', JSON.stringify(updated));
  };

  const handleStartApp = () => {
    if (dontShowAgain) {
      localStorage.setItem('onboarding_v4_done', 'true');
    }
    setShowOnboarding(false);
  };

  const handleCaptureComplete = (avgCoord: Coordinate, folderName: string, pointName: string, description: string, photo: string | null) => {
    const newLocation: SavedLocation = {
      id: crypto.randomUUID(),
      folderName,
      name: pointName,
      description,
      lat: avgCoord.lat,
      lng: avgCoord.lng,
      altitude: avgCoord.altitude,
      accuracy: avgCoord.accuracy,
      photo,
      timestamp: Date.now()
    };
    
    setCurrentLocation(newLocation);
    setStatus(AppStatus.RESULT);
    setActiveTab('none');
    setIsContinuing(false);
    
    saveLocations([newLocation, ...savedLocations]);
  };

  const handleUpdatePhoto = (photo: string) => {
    if (!currentLocation) return;
    const updatedLoc = { ...currentLocation, photo };
    setCurrentLocation(updatedLoc);
    saveLocations(savedLocations.map(loc => loc.id === currentLocation.id ? updatedLoc : loc));
  };

  const handleDeleteLocation = (id: string) => {
    saveLocations(savedLocations.filter(loc => loc.id !== id));
  };

  const handleBulkDelete = (ids: string[]) => {
    saveLocations(savedLocations.filter(loc => !ids.includes(loc.id)));
  };

  const handleRenameFolder = (oldName: string, newName: string) => {
    saveLocations(savedLocations.map(loc => 
      loc.folderName === oldName ? { ...loc, folderName: newName } : loc
    ));
  };

  const handleRenamePoint = (id: string, newName: string) => {
    saveLocations(savedLocations.map(loc => 
      loc.id === id ? { ...loc, name: newName } : loc
    ));
  };

  const handleDeleteFolder = (folderName: string) => {
    saveLocations(savedLocations.filter(loc => loc.folderName !== folderName));
  };

  const goBack = () => {
    if (window.history.state && window.history.state.view === 'sub-view') {
      window.history.back();
    } else {
      setStatus(AppStatus.IDLE);
      setActiveTab('none');
      setCurrentLocation(null);
    }
  };

  const renderSubViewHeader = (title: string) => (
    <div className="relative flex items-center justify-center sticky top-0 bg-[#F1F5F9]/90 backdrop-blur-md z-20 pt-12 pb-6 -mx-2 px-2">
      <button 
        onClick={goBack}
        className="absolute left-2 bottom-4 w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-90 transition-all"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <h2 className="text-xl font-extrabold text-slate-800 text-center">{title}</h2>
    </div>
  );

  const brandFooter = (
    <footer className="w-full py-4 flex items-center justify-center opacity-40 text-center shrink-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 leading-relaxed">
        {FULL_BRAND}
      </span>
    </footer>
  );

  if (showOnboarding) {
    return (
      <div className="h-screen w-full flex flex-col items-center p-6 bg-slate-100 overflow-hidden relative">
        <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center space-y-4 text-center animate-in duration-700">
          <div className="space-y-3">
            <div className="w-16 h-16 bg-[#2563eb] rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
              <i className="fas fa-shield-halved text-white text-2xl"></i>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                Cihaz İzinleri ve Kurulum
              </h1>
              <div className="h-6"></div>
              <p className="text-[13px] text-slate-500 font-bold px-4 leading-snug">
                Mobil Cihazlarınız için Konum Belirleme Uygulaması: <span className="text-[#2563eb] font-black">GPS Plus</span>
              </p>
            </div>
          </div>

          <div className="space-y-3 text-left w-full px-2">
            <div className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
                <i className="fas fa-location-crosshairs text-xl"></i>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-base leading-none mb-1">Konum Erişimi</h4>
                <p className="text-xs text-slate-400 font-bold leading-tight">Cihazınızın GPS verilerini toplayabilmesi için konum izni gereklidir.</p>
              </div>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0">
                <i className="fas fa-camera text-xl"></i>
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-base leading-none mb-1">Kamera Erişimi</h4>
                <p className="text-xs text-slate-400 font-bold leading-tight">Saha çalışmalarına fotoğraf eklemek için kamera izni gereklidir.</p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4 pt-2">
            <label className="flex items-center justify-center gap-3 cursor-pointer group">
              <div 
                onClick={() => setDontShowAgain(!dontShowAgain)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  dontShowAgain ? 'bg-[#2563eb] border-[#2563eb]' : 'border-slate-300 bg-white'
                }`}
              >
                {dontShowAgain && <i className="fas fa-check text-white text-[10px]"></i>}
              </div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Bir daha gösterme</span>
            </label>

            <button 
              onClick={handleStartApp}
              className="w-full py-5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              İzinleri Onayla ve Başla
            </button>
            <div className="mx-auto">
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider whitespace-nowrap">
                Verileriniz yalnızca mobil cihazınızda depolanır.
              </p>
            </div>
          </div>
        </div>
        {brandFooter}
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col items-center bg-slate-100 overflow-hidden relative">
      <div className="w-full max-md h-full bg-[#F1F5F9] flex flex-col relative shadow-2xl md:my-auto">
        
        {status === AppStatus.IDLE && activeTab === 'none' && (
          <header className="w-full px-8 pt-12 pb-8 flex items-center gap-6 shrink-0 animate-in duration-700">
            <div className="w-20 h-20 bg-[#2563eb] rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
              <i className="fas fa-location-dot text-white text-4xl"></i>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold tracking-wide text-slate-500 leading-[1.2]">
                Mobil Cihazlarınız için<br/>
                Konum Belirleme Uygulaması:<br/>
                <span className="text-[#2563eb] text-xl font-black">GPS Plus</span>
              </h1>
              <div className="w-12 h-1.5 bg-blue-100 rounded-full mt-2"></div>
            </div>
          </header>
        )}

        <main className="w-full flex-1 px-6 pb-4 overflow-y-auto no-scrollbar flex flex-col">
          {status === AppStatus.IDLE && activeTab === 'none' && (
            <div className="flex flex-col gap-4 animate-in duration-700">
              
              <button
                onClick={() => setStatus(AppStatus.COUNTDOWN)}
                className="w-full p-8 rounded-[2.5rem] bg-[#2563eb] shadow-xl shadow-blue-100 text-left transition-all hover:bg-blue-700 active:scale-[0.98] flex flex-col gap-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-1 group-hover:scale-110 transition-transform">
                  <i className="fas fa-plus text-xl"></i>
                </div>
                <span className="text-xl font-black text-white leading-tight">Yeni Ölçüm Yap ve<br/>Projeye Kaydet</span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab('list')}
                  className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/30 text-left transition-all hover:bg-slate-50 active:scale-[0.98] flex flex-col gap-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] mb-1 group-hover:bg-blue-50 transition-colors">
                    <i className="fas fa-folder-tree text-lg"></i>
                  </div>
                  <span className="text-base font-black text-slate-800 uppercase tracking-tight">Kayıtlı Projeler</span>
                </button>

                <button 
                  onClick={() => setActiveTab('export')}
                  className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/30 text-left transition-all hover:bg-slate-50 active:scale-[0.98] flex flex-col gap-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 mb-1 group-hover:bg-emerald-50 transition-colors">
                    <i className="fas fa-file-export text-lg"></i>
                  </div>
                  <span className="text-base font-black text-slate-800 uppercase tracking-tight">Veri Aktarımı</span>
                </button>
              </div>
              
            </div>
          )}

          {status === AppStatus.IDLE && activeTab === 'list' && (
            <div className="animate-in duration-500 w-full">
              {renderSubViewHeader('Kayıtlı Projeler')}
              <SavedLocationsList 
                locations={savedLocations} 
                onDelete={handleDeleteLocation} 
                onRenameFolder={handleRenameFolder}
                onRenamePoint={handleRenamePoint}
                onDeleteFolder={handleDeleteFolder}
                onBulkDelete={handleBulkDelete}
              />
            </div>
          )}

          {status === AppStatus.IDLE && activeTab === 'export' && (
            <div className="animate-in duration-500 w-full">
              {renderSubViewHeader("Veri Aktarımı")}
              <ExportUnifiedView locations={savedLocations} />
            </div>
          )}

          {status === AppStatus.COUNTDOWN && (
            <div className="flex justify-center w-full pt-4 h-full items-center">
                <GPSCapture 
                  onComplete={handleCaptureComplete} 
                  onCancel={goBack} 
                  isContinuing={isContinuing}
                  existingLocations={savedLocations}
                />
            </div>
          )}

          {status === AppStatus.RESULT && currentLocation && (
            <div className="w-full space-y-6 animate-in duration-500 pt-4">
              <div className="text-center px-4">
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2563eb] mb-1">Başarıyla Kaydedildi</p>
                 <p className="text-xs font-bold text-slate-400">{currentLocation.folderName} / {currentLocation.name}</p>
              </div>
              
              <ResultCard location={currentLocation} onUpdatePhoto={handleUpdatePhoto} />
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsContinuing(true);
                    setStatus(AppStatus.COUNTDOWN);
                    setCurrentLocation(null);
                  }}
                  className="w-full py-5 bg-[#2563eb] text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-rotate-right"></i>
                  Ölçüme Devam Et
                </button>

                <button
                  onClick={goBack}
                  className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 opacity-80"
                >
                  <i className="fas fa-check"></i>
                  Ölçümü Bitir
                </button>
              </div>
            </div>
          )}
        </main>

        {brandFooter}
      </div>
    </div>
  );
};

export default App;