import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { App as CapacitorApp } from '@capacitor/app';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import GPSCapture from './components/GPSCapture';
import SavedLocationsList from './components/SavedLocationsList';
import ExportUnifiedView from './components/ExportUnifiedView';
import ResultCard from './components/ResultCard';
import { SavedLocation, Coordinate } from './types';
import { FULL_BRAND } from './version';

type ViewType = 'onboarding' | 'dashboard' | 'capture' | 'list' | 'export' | 'result';

const App = () => {
  const [view, setView] = useState<ViewType>('onboarding');
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [lastResult, setLastResult] = useState<SavedLocation | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  // --- EKLENDİ: Sayfa Geçmişi Hafızası ---
  const [history, setHistory] = useState<ViewType[]>([]);
  const isBackNav = useRef(false);

  // 1. KURAL: Sayfa her değiştiğinde geçmişe kaydet
  useEffect(() => {
    if (isBackNav.current) {
      isBackNav.current = false;
    } else {
      setHistory(prev => {
        if (view === 'dashboard') return ['dashboard']; // Ana ekrana dönünce geçmişi temizle
        if (prev[prev.length - 1] === view) return prev;
        return [...prev, view];
      });
    }
  }, [view]);

  // 2. KURAL: Geri tuşuna basıldığında hafızadan bir öncekini bul
  useEffect(() => {
    const backListener = CapacitorApp.addListener('backButton', () => {
      if (view === 'dashboard' || view === 'onboarding') {
        CapacitorApp.exitApp(); // Ana ekranlarda çıkış yap
      } else {
        setHistory(prev => {
          const newHistory = [...prev];
          if (newHistory.length > 1) {
            newHistory.pop(); // Mevcut sayfayı hafızadan sil
            const previousView = newHistory[newHistory.length - 1]; // Bir önceki sayfayı bul
            isBackNav.current = true;
            setView(previousView); // O sayfaya git
            return newHistory;
          } else {
            isBackNav.current = true;
            setView('dashboard');
            return ['dashboard'];
          }
        });
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [view]);
  // ----------------------------------------

  useEffect(() => {
    // v4.7.0 Geçiş ve Yedekleme Mantığı
    const CURRENT_KEY = 'gps_locations_v4.7.0';
    const OLD_KEY = 'gps_locations_v4.6';
    const ONBOARDING_KEY = 'onboarding_v4.7.0_done';
    const OLD_ONBOARDING_KEY = 'onboarding_v4.6_done';

    let saved = localStorage.getItem(CURRENT_KEY);
    // Eğer yeni anahtarda veri yoksa, eski sürümden yedek al
    if (!saved) {
      const oldData = localStorage.getItem(OLD_KEY);
      if (oldData) {
        localStorage.setItem(CURRENT_KEY, oldData);
        saved = oldData;
      }
    }
    
    if (saved) setLocations(JSON.parse(saved));

    let onboardingDone = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingDone) {
      const oldOnboarding = localStorage.getItem(OLD_ONBOARDING_KEY);
      if (oldOnboarding) {
        localStorage.setItem(ONBOARDING_KEY, oldOnboarding);
        onboardingDone = oldOnboarding;
      }
    }

    if (onboardingDone === 'true') setView('dashboard');
  }, []);

  useEffect(() => {
    localStorage.setItem('gps_locations_v4.7.0', JSON.stringify(locations));
  }, [locations]);

  const handleFinishOnboarding = () => {
    localStorage.setItem('onboarding_v4.7.0_done', 'true');
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

  // Merkezi Footer Bileşeni
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
            <Onboarding onFinish={handleFinishOnboarding} />
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

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
