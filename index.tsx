import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import GPSCapture from './components/GPSCapture';
import SavedLocationsList from './components/SavedLocationsList';
import ExportUnifiedView from './components/ExportUnifiedView';
import ResultCard from './components/ResultCard';
import { SavedLocation, Coordinate } from './types';
import { FULL_BRAND } from './version';

const App = () => {
  // Her açılışta onboarding ile başlar
  const [view, setView] = useState<'onboarding' | 'dashboard' | 'capture' | 'list' | 'export' | 'result'>('onboarding');
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [lastResult, setLastResult] = useState<SavedLocation | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    const CURRENT_KEY = 'gps_locations_v4.7.0';
    const saved = localStorage.getItem(CURRENT_KEY);
    if (saved) setLocations(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('gps_locations_v4.7.0', JSON.stringify(locations));
  }, [locations]);

  const handleFinishOnboarding = () => {
    setView('dashboard');
  };

  const handleGPSComplete = (coord: Coordinate, folderName: string, pointName: string) => {
    const newLoc: SavedLocation = {
      ...coord,
      id: Date.now().toString(),
      name: pointName,
      folderName: folderName,
    };
    setLocations(prev => [newLoc, ...prev]);
    setLastResult(newLoc);
    setView('result');
  };

  const resetToDashboard = () => {
    setIsContinuing(false);
    setView('dashboard');
  };

  const handleNewMeasurement = (continuing: boolean) => {
    setIsContinuing(continuing);
    setView('capture');
  };

  const GlobalFooter = () => (
    <footer className="py-6 md:py-8 flex flex-col items-center mt-auto safe-bottom shrink-0 bg-transparent">
      <p className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] text-center w-full">
        {FULL_BRAND}
      </p>
    </footer>
  );

  return (
    <div className="h-full bg-white font-sans text-slate-900 overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        
        {view === 'onboarding' && (
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            <Onboarding 
              onFinish={handleFinishOnboarding} 
              onComplete={handleFinishOnboarding} 
            />
            <GlobalFooter />
          </div>
        )}
        
        {view === 'dashboard' && (
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            <Dashboard 
              onStartCapture={() => handleNewMeasurement(false)} 
              onShowList={() => setView('list')}
              onShowExport={() => setView('export')}
            />
            <GlobalFooter />
          </div>
        )}

        {view === 'capture' && (
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            <GPSCapture 
              existingLocations={locations}
              onComplete={handleGPSComplete}
              onCancel={resetToDashboard}
              isContinuing={isContinuing}
            />
          </div>
        )}

        {view === 'list' && (
          <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-[#F8FAFC]">
            <header className="px-8 pt-10 pb-6 flex items-center gap-5 shrink-0 bg-white">
              <button onClick={resetToDashboard} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 text-slate-800 active:scale-90 transition-all">
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Projelerim</h2>
              </div>
            </header>
            <div className="flex-1 px-8 overflow-y-auto no-scrollbar py-4">
              <SavedLocationsList 
                locations={locations} 
                onDelete={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
                onRenameFolder={(oldN, newN) => setLocations(prev => prev.map(l => l.folderName === oldN ? { ...l, folderName: newN } : l))}
                onRenamePoint={() => {}}
                onDeleteFolder={(name) => setLocations(prev => prev.filter(l => l.folderName !== name))}
                onBulkDelete={(ids) => setLocations(prev => prev.filter(l => !ids.includes(l.id)))}
              />
            </div>
            <GlobalFooter />
          </div>
        )}

        {view === 'export' && (
          <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-[#F8FAFC]">
            <header className="px-8 pt-10 pb-6 flex items-center gap-5 shrink-0 bg-white">
              <button onClick={resetToDashboard} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 text-slate-800 active:scale-90 transition-all">
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Veri Aktar</h2>
              </div>
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
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
