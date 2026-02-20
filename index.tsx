import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { App as CapacitorApp } from '@capacitor/app'; // Android Geri Tuşu için eklendi
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import GPSCapture from './components/GPSCapture';
import SavedLocationsList from './components/SavedLocationsList';
import ExportUnifiedView from './components/ExportUnifiedView';
import ResultCard from './components/ResultCard';
import { SavedLocation, Coordinate } from './types';
import { FULL_BRAND } from './version';

const App = () => {
  // Uygulama her zaman 'onboarding' ile başlar
  const [view, setView] = useState<'onboarding' | 'dashboard' | 'capture' | 'list' | 'export' | 'result'>('onboarding');
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [lastResult, setLastResult] = useState<SavedLocation | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  // --- ANDROID GERİ TUŞU YÖNETİMİ ---
  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      if (view === 'dashboard' || view === 'onboarding') {
        CapacitorApp.exitApp(); // Ana ekrandaysa uygulamayı kapat
      } else {
        setView('dashboard'); // Alt sayfalardaysa Dashboard'a dön
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [view]);

  useEffect(() => {
    const CURRENT_KEY = 'gps_locations_v4.7.0';
    const OLD_KEY = 'gps_locations_v4.6';

    let saved = localStorage.getItem(CURRENT_KEY);
    if (!saved) {
      const oldData = localStorage.getItem(OLD_KEY);
      if (oldData) {
        localStorage.setItem(CURRENT_KEY, oldData);
        saved = oldData;
      }
    }
    
    if (saved) setLocations(JSON.parse(saved));
    // NOT: Onboarding tamamlandı kontrolü bilinçli olarak kaldırıldı.
  }, []);

  useEffect(() => {
    localStorage.setItem('gps_locations_v4.7.0', JSON.stringify(locations));
  }, [locations]);

  const handleFinishOnboarding = () => {
    setView('dashboard');
  };

  const handleCompleteCapture = (coord: Coordinate, folderName: string, pointName: string, description: string) => {
    const newLoc: SavedLocation = {
      id: Date.now().toString(),
      name: pointName || `NOKTA-${locations.length + 1}`,
      folderName: folderName || 'GENEL',
      description,
      lat: coord.lat,
      lng: coord.lng,
      alt: coord.alt,
      msl: coord.msl,
      acc: coord.acc,
      timestamp: coord.timestamp
    };
    setLocations(prev => [newLoc, ...prev]);
    setLastResult(newLoc);
    setView('result');
  };

  const handleNewMeasurement = (continueInFolder = false) => {
    setIsContinuing(continueInFolder);
    setView('capture');
  };

  const resetToDashboard = () => {
    setIsContinuing(false);
    setView('dashboard');
  };

  const deleteLocation = (id: string) => {
    if (confirm('Bu ölçümü silmek istediğinize emin misiniz?')) {
      setLocations(prev => prev.filter(l => l.id !== id));
    }
  };

  const GlobalFooter = () => (
    <footer className="shrink-0 py-6 text-center border-t border-slate-50">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
        {FULL_BRAND} • PROFESSIONAL SYSTEM
      </p>
    </footer>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans text-slate-900 select-none overflow-hidden">
      {view === 'onboarding' && <Onboarding onFinish={handleFinishOnboarding} />}

      {view === 'dashboard' && (
        <div className="flex-1 flex flex-col animate-in">
          <Dashboard 
            onStartCapture={() => handleNewMeasurement(false)}
            onShowList={() => setView('list')}
            onShowExport={() => setView('export')}
          />
          <GlobalFooter />
        </div>
      )}

      {view === 'capture' && (
        <div className="flex-1 flex flex-col animate-in">
          <GPSCapture 
            onComplete={handleCompleteCapture}
            onCancel={resetToDashboard}
            isContinuing={isContinuing}
            existingLocations={locations}
          />
          <GlobalFooter />
        </div>
      )}

      {view === 'list' && (
        <div className="flex-1 flex flex-col animate-in h-full bg-[#F8FAFC]">
          <header className="px-8 pt-12 pb-6 flex items-center gap-4 bg-white">
            <button onClick={resetToDashboard} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
              <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Kayıtlı Ölçümler</h2>
          </header>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <SavedLocationsList locations={locations} onDelete={deleteLocation} />
          </div>
          <GlobalFooter />
        </div>
      )}

      {view === 'export' && (
        <div className="flex-1 flex flex-col animate-in h-full bg-[#F8FAFC]">
          <header className="px-8 pt-12 pb-6 flex items-center gap-4 bg-white">
            <button onClick={resetToDashboard} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
              <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Veri Aktar</h2>
          </header>
          <div className="flex-1 px-8 overflow-y-auto no-scrollbar py-4">
             <ExportUnifiedView locations={locations} />
          </div>
          <GlobalFooter />
        </div>
      )}

      {view === 'result' && lastResult && (
        <div className="flex-1 flex flex-col animate-in h-full px-8 pt-12 overflow-hidden bg-white">
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <ResultCard location={lastResult} />
            <div className="mt-8 space-y-4">
               <button onClick={() => handleNewMeasurement(true)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 active:scale-95 transition-all text-[13px] uppercase tracking-widest">YENİ NOKTA EKLE</button>
               <button onClick={resetToDashboard} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all">ÖLÇÜMÜ BİTİR</button>
            </div>
          </div>
          <GlobalFooter />
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
