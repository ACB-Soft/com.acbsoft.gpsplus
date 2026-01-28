
/**
 * ACB_Soft GPS Plus v4.5.0 - WebView Turbo Core
 * Vanilla JS SPA Implementation
 */

// --- GLOBAL APP STATE ---
const STATE: any = {
  view: localStorage.getItem('onboarding_v4_done') ? 'home' : 'onboarding',
  savedLocations: JSON.parse(localStorage.getItem('gps_locations_v4') || '[]'),
  currentCapture: {
    step: 'SELECT_MODE', // SELECT_MODE, FORM, READY, COUNTDOWN
    folderName: localStorage.getItem('last_folder_name') || '',
    pointName: '',
    isNewProject: true,
    seconds: 5,
    samples: [],
    instantAccuracy: null,
    isCapturing: false
  },
  lastResult: null,
  expandedFolders: [],
  selectedExportFolders: [],
  isSelectionMode: false,
  selectedIds: []
};

const BRAND = {
  name: "ACB_Soft GPS Plus",
  version: "v4.5.0",
  full: "ACB_Soft GPS Plus v4.5.0"
};

// --- GEOID (EGM96) ENGINE ---
const EGM96_GRID = [
  [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
  [3, 1, -2, -3, -3, -3, -1, 3, 1, 5, 9, 11, 19, 27, 31, 34, 33, 34, 33, 34, 28, 23, 17, 13, 11, 4, 1, 1, 2, 2, 3, 2, 1, 1, 1, 1, 3],
  [-13, -15, -18, -14, -11, -7, -2, 1, -9, -1, 1, 11, 21, 21, 23, 26, 31, 35, 39, 45, 45, 45, 39, 34, 21, 18, 15, 14, 8, 5, 1, -3, -7, -10, -11, -12, -13],
  [-21, -27, -23, -14, -2, 7, 13, 18, 19, 20, 19, 13, 11, 13, 15, 14, 15, 20, 31, 42, 53, 59, 61, 62, 53, 39, 28, 14, 2, -5, -15, -23, -27, -26, -24, -22, -21],
  [-21, -25, -26, -15, 4, 16, 21, 23, 25, 25, 19, 7, -3, -10, -16, -20, -18, -12, 0, 15, 30, 43, 57, 60, 50, 42, 29, 21, 10, -3, -13, -20, -23, -24, -23, -22, -21],
  [-16, -18, -19, -15, -4, 11, 19, 23, 23, 21, 13, 2, -12, -26, -33, -34, -31, -21, -5, 14, 28, 33, 35, 34, 31, 25, 19, 16, 11, -1, -11, -18, -20, -20, -19, -17, -16],
  [4, 1, -5, -11, -12, 2, 14, 21, 25, 23, 11, 1, -13, -29, -38, -42, -43, -37, -19, 2, 16, 17, 15, 12, 11, 14, 16, 18, 13, 6, -3, -11, -13, -11, -5, 1, 4],
  [13, 11, 7, 1, -5, -3, 8, 15, 22, 21, 13, 1, -15, -31, -43, -51, -56, -55, -43, -21, -1, 3, 5, 5, 7, 11, 13, 15, 15, 11, 5, -2, -7, -6, -2, 6, 13],
  [15, 13, 10, 7, 5, 8, 12, 16, 21, 23, 17, 3, -14, -30, -42, -52, -58, -62, -53, -34, -15, -6, -3, -1, 3, 7, 10, 13, 15, 14, 11, 6, 2, 3, 5, 10, 15],
  [16, 15, 14, 14, 16, 21, 24, 26, 29, 29, 22, 11, -4, -20, -31, -40, -47, -53, -47, -33, -16, -8, -5, -2, 2, 6, 9, 13, 15, 16, 15, 13, 11, 12, 13, 14, 16],
  [13, 15, 17, 21, 24, 29, 32, 34, 34, 32, 26, 18, 8, -5, -15, -24, -31, -34, -31, -23, -11, -4, -1, 1, 4, 8, 10, 13, 15, 16, 16, 15, 14, 13, 13, 13, 13],
  [1, 5, 11, 17, 23, 29, 34, 38, 38, 34, 28, 22, 15, 6, -1, -9, -15, -18, -17, -13, -7, -2, 0, 2, 5, 9, 11, 12, 12, 11, 9, 7, 4, 3, 1, 1, 1],
  [-16, -11, -6, 2, 11, 19, 25, 29, 31, 31, 28, 25, 21, 16, 10, 4, 1, -1, -1, -1, 0, 1, 3, 5, 8, 11, 12, 11, 8, 4, 1, -4, -8, -12, -15, -17, -16],
  [-29, -25, -19, -11, -2, 8, 16, 22, 25, 27, 28, 28, 28, 26, 22, 17, 13, 11, 11, 11, 12, 12, 13, 15, 17, 18, 17, 13, 7, 1, -6, -14, -21, -26, -29, -30, -29],
  [-30, -31, -29, -23, -15, -6, 2, 10, 15, 19, 23, 26, 28, 28, 26, 24, 22, 21, 21, 23, 24, 24, 25, 26, 26, 24, 19, 11, 1, -8, -17, -25, -30, -32, -32, -31, -30],
  [-21, -24, -28, -28, -25, -19, -12, -5, 1, 7, 13, 18, 22, 24, 24, 23, 23, 24, 26, 28, 28, 28, 27, 26, 22, 17, 8, -1, -11, -20, -25, -28, -27, -26, -24, -22, -21],
  [-11, -15, -20, -25, -26, -26, -21, -15, -8, -1, 4, 10, 15, 19, 21, 22, 23, 24, 27, 29, 29, 28, 25, 21, 13, 4, -5, -13, -19, -21, -19, -15, -13, -11, -11, -10, -11],
  [-13, -14, -16, -19, -22, -25, -26, -24, -21, -16, -11, -5, -1, 4, 7, 10, 13, 16, 19, 21, 22, 21, 18, 13, 7, 1, -5, -10, -13, -13, -12, -11, -11, -11, -11, -12, -13],
  [-29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29, -29]
];

function getGeoidUndulation(lat: number, lng: number) {
  let lon = ((lng + 180) % 360);
  if (lon < 0) lon += 360;
  lon -= 180;
  const row = (90 - lat) / 10;
  const col = (lon + 180) / 10;
  const r0 = Math.floor(row);
  const r1 = Math.min(r0 + 1, 18);
  const c0 = Math.floor(col);
  const c1 = (c0 + 1) % 36;
  const dr = row - r0;
  const dc = col - c0;
  const n00 = EGM96_GRID[r0][c0];
  const n01 = EGM96_GRID[r0][c1];
  const n10 = EGM96_GRID[r1][c0];
  const n11 = EGM96_GRID[r1][c1];
  return (1 - dr) * (1 - dc) * n00 + (1 - dr) * dc * n01 + dr * (1 - dc) * n10 + dr * dc * n11;
}

// --- GPS WATCHER ---
let watchId: number | null = null;
let timerId: any = null;

function startGPS() {
  if (watchId) return;
  if ("geolocation" in navigator) {
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        STATE.currentCapture.instantAccuracy = pos.coords.accuracy;
        if (STATE.currentCapture.step === 'COUNTDOWN') {
          const undulation = getGeoidUndulation(pos.coords.latitude, pos.coords.longitude);
          const msl = pos.coords.altitude !== null ? pos.coords.altitude - undulation : null;
          STATE.currentCapture.samples.push({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: msl,
            timestamp: Date.now()
          });
        }
        render();
      },
      (err) => {
        console.warn("GPS Sinyal Sorunu:", err);
        STATE.currentCapture.instantAccuracy = null;
        render();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    ) as unknown as number;
  }
}

function stopGPS() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

// --- VIEW ENGINE ---
const root = document.getElementById('root')!;

function navigate(view: string) {
  STATE.view = view;
  if (view === 'capture') {
    STATE.currentCapture.step = 'SELECT_MODE';
    STATE.currentCapture.samples = [];
  }
  render();
}

function render() {
  const v = STATE.view;
  root.innerHTML = '';
  
  if (v === 'onboarding') root.innerHTML = renderOnboarding();
  else if (v === 'home') root.innerHTML = renderHome();
  else if (v === 'capture') root.innerHTML = renderCapture();
  else if (v === 'result') root.innerHTML = renderResult();
  else if (v === 'list') root.innerHTML = renderList();
  else if (v === 'export') root.innerHTML = renderExport();

  attachEvents();
}

// --- TEMPLATES ---
function renderOnboarding() {
  return `
    <div class="h-full flex flex-col items-center p-6 bg-slate-100 animate-in text-center">
      <div class="flex-1 flex flex-col items-center justify-center space-y-4 max-w-sm">
        <div class="w-16 h-16 bg-[#2563eb] rounded-3xl flex items-center justify-center shadow-2xl mb-4">
          <i class="fas fa-shield-halved text-white text-2xl"></i>
        </div>
        <h1 class="text-xl font-black text-slate-800 tracking-tight">Cihaz İzinleri ve Kurulum</h1>
        <p class="text-[13px] text-slate-500 font-bold px-4 leading-snug">Mobil Cihazlarınız için Konum Belirleme Uygulaması: <span class="text-[#2563eb] font-black">GPS Plus</span></p>
        
        <div class="space-y-3 text-left w-full pt-6">
          <div class="flex gap-4 items-center bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0"><i class="fas fa-location-dot"></i></div>
            <p class="text-[11px] font-bold text-slate-600">GPS verisi için tam konum izni gereklidir.</p>
          </div>
          <div class="flex gap-4 items-center bg-white p-4 rounded-3xl border border-slate-200/50 shadow-sm">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563eb] shrink-0"><i class="fas fa-camera"></i></div>
            <p class="text-[11px] font-bold text-slate-600">Saha fotoğrafı için kamera erişimi gereklidir.</p>
          </div>
        </div>

        <button id="btn-onboarding-done" class="w-full py-5 bg-[#2563eb] text-white rounded-[1.8rem] font-black uppercase tracking-widest shadow-xl shadow-blue-100 mt-8 active:scale-95 transition-all">
          İzinleri Onayla ve Başla
        </button>
      </div>
    </div>
  `;
}

function renderHome() {
  return `
    <div class="h-full flex flex-col bg-[#F1F5F9] animate-in">
      <header class="w-full px-8 pt-12 pb-8 flex items-center gap-6 shrink-0">
        <div class="w-20 h-20 bg-[#2563eb] rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
          <i class="fas fa-location-dot text-white text-4xl"></i>
        </div>
        <div class="flex flex-col">
          <h1 class="text-sm font-bold tracking-wide text-slate-500 leading-tight">Konum Belirleme:<br/><span class="text-[#2563eb] text-xl font-black">GPS Plus</span></h1>
          <div class="w-12 h-1.5 bg-blue-100 rounded-full mt-2"></div>
        </div>
      </header>
      <main class="px-6 space-y-4">
        <button id="btn-go-capture" class="w-full p-8 rounded-[2.5rem] bg-[#2563eb] shadow-xl shadow-blue-100 text-left flex flex-col gap-2 group active:scale-[0.98] transition-all">
          <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-1"><i class="fas fa-plus"></i></div>
          <span class="text-xl font-black text-white leading-tight">Yeni Ölçüm Yap ve<br/>Projeye Kaydet</span>
        </button>
        <div class="grid grid-cols-2 gap-4">
          <button id="btn-go-list" class="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl text-left active:scale-[0.98] transition-all">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] mb-2"><i class="fas fa-folder-tree"></i></div>
            <span class="text-sm font-black text-slate-800 uppercase tracking-tight">Kayıtlı Projeler</span>
          </button>
          <button id="btn-go-export" class="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl text-left active:scale-[0.98] transition-all">
            <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600 mb-2"><i class="fas fa-file-export"></i></div>
            <span class="text-sm font-black text-slate-800 uppercase tracking-tight">Veri Aktarımı</span>
          </button>
        </div>
      </main>
      <footer class="mt-auto py-6 opacity-40 text-center">
        <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">${BRAND.full}</span>
      </footer>
    </div>
  `;
}

function renderCapture() {
  const c = STATE.currentCapture;
  const header = (title: string, backId: string) => `
    <div class="relative flex items-center justify-center sticky top-0 bg-[#F1F5F9]/90 backdrop-blur-md z-20 pt-12 pb-6 px-6 w-full">
      <button id="${backId}" class="absolute left-6 bottom-4 w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-90 transition-all"><i class="fas fa-chevron-left"></i></button>
      <h2 class="text-xl font-extrabold text-slate-800">${title}</h2>
    </div>
  `;

  if (c.step === 'SELECT_MODE') {
    return `
      <div class="h-full flex flex-col items-center bg-[#F1F5F9] animate-in">
        ${header("Yeni Ölçüm", "btn-capture-cancel")}
        <div class="w-full max-w-[340px] px-4 space-y-4 pt-6">
          <button id="btn-mode-new" class="w-full p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl text-left flex flex-col gap-2 group active:scale-95 transition-all">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center mb-2"><i class="fas fa-folder-plus"></i></div>
            <span class="text-base font-black text-slate-800">Yeni Proje Oluştur</span>
          </button>
          <button id="btn-mode-existing" class="w-full p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl text-left flex flex-col gap-2 group active:scale-95 transition-all">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><i class="fas fa-folder-open"></i></div>
            <span class="text-base font-black text-slate-800">Mevcut Projeye Devam</span>
          </button>
        </div>
      </div>
    `;
  }

  if (c.step === 'FORM') {
    const folders = Array.from(new Set(STATE.savedLocations.map((l: any) => l.folderName)));
    return `
      <div class="h-full flex flex-col items-center bg-[#F1F5F9] animate-in">
        ${header("Proje Bilgisi", "btn-form-back")}
        <div class="w-full max-w-[340px] px-4 pt-6">
          <div class="soft-card p-6 space-y-6">
            ${!c.isNewProject ? `
              <div>
                <label class="block text-[9px] uppercase text-slate-400 font-black mb-1.5 px-2">Proje Seçin</label>
                <select id="select-folder" class="w-full bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-slate-800 font-bold outline-none">
                  <option value="">Seçiniz...</option>
                  ${folders.map(f => `<option value="${f}" ${c.folderName === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
              </div>
            ` : `
              <div>
                <label class="block text-[9px] uppercase text-slate-400 font-black mb-1.5 px-2">Yeni Proje Adı</label>
                <input type="text" id="input-folder" value="${c.folderName}" placeholder="Örn: Proje A" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-bold outline-none">
              </div>
            `}
            <button id="btn-proceed-ready" class="w-full py-5 bg-[#2563eb] text-white rounded-2xl font-bold active:scale-95 shadow-lg shadow-blue-50 transition-all">İleri</button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="h-full flex flex-col items-center bg-[#F1F5F9] animate-in">
      ${header("Ölçüm Ekranı", "btn-ready-back")}
      <div class="flex-1 flex flex-col items-center justify-center space-y-8 w-full max-w-[340px] px-4">
        <h3 class="text-xl font-extrabold text-[#2563eb] truncate px-4">${c.folderName}</h3>
        <div class="relative w-56 h-56 flex items-center justify-center">
          <div class="absolute inset-0 border-2 rounded-full border-slate-100"></div>
          ${c.step === 'COUNTDOWN' ? `<div class="scanner-line"></div>` : ''}
          <div class="text-8xl font-black text-slate-800 mono-font">
            ${c.step === 'COUNTDOWN' ? c.seconds : `<i class="fas fa-location-crosshairs text-6xl text-slate-200"></i>`}
          </div>
        </div>
        ${c.step === 'READY' ? `
          <div class="w-full space-y-4">
            <div class="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
              <label class="block text-[9px] uppercase text-slate-400 font-black">Nokta İsmi</label>
              <input type="text" id="input-point" value="${c.pointName}" class="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-black text-center text-lg outline-none">
              <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span class="text-[10px] font-bold text-slate-500 uppercase">Sinyal</span>
                <span class="text-xs font-bold mono-font ${c.instantAccuracy ? 'text-emerald-600' : 'text-slate-400'}">
                  ${c.instantAccuracy ? `±${c.instantAccuracy.toFixed(1)}m` : 'Aranıyor...'}
                </span>
              </div>
              <button id="btn-start-countdown" class="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><i class="fas fa-play"></i>BAŞLA</button>
            </div>
          </div>
        ` : `
          <div class="text-center space-y-4 w-full">
            <p class="text-slate-500 text-sm font-medium">Hassas ölçüm yapılıyor...</p>
            <div class="text-xs font-black text-emerald-600 uppercase tracking-widest">${c.samples.length} Veri Alındı</div>
            <button id="btn-cancel-countdown" class="px-12 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold text-xs uppercase">Durdur</button>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderResult() {
  const loc = STATE.lastResult;
  if (!loc) return '';
  return `
    <div class="h-full flex flex-col bg-[#F1F5F9] animate-in items-center">
      <div class="pt-12 pb-6 px-6 w-full text-center"><h2 class="text-xl font-extrabold text-slate-800">Ölçüm Özeti</h2></div>
      <div class="flex-1 w-full max-w-[340px] px-4 space-y-6 pb-12">
        <div class="soft-card p-6 space-y-6 text-center">
          ${loc.photo ? `<img src="${loc.photo}" class="w-full h-40 object-cover rounded-2xl shadow-inner border">` : `
            <div id="btn-add-photo" class="w-full py-10 bg-slate-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3">
              <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm"><i class="fas fa-camera"></i></div>
              <span class="text-[10px] font-black text-blue-600 uppercase">Fotoğraf Ekle</span>
            </div>
          `}
          <div class="grid grid-cols-2 gap-3 text-left">
            <div class="bg-slate-50 p-3 rounded-xl border"><div class="text-[8px] text-slate-400 font-black uppercase mb-1">Enlem</div><div class="text-xs font-bold mono-font truncate">${loc.lat.toFixed(7)}</div></div>
            <div class="bg-slate-50 p-3 rounded-xl border"><div class="text-[8px] text-slate-400 font-black uppercase mb-1">Boylam</div><div class="text-xs font-bold mono-font truncate">${loc.lng.toFixed(7)}</div></div>
            <div class="bg-slate-50 p-3 rounded-xl border"><div class="text-[8px] text-slate-400 font-black uppercase mb-1">Yükseklik</div><div class="text-xs font-bold mono-font text-blue-600">${loc.altitude ? Math.round(loc.altitude) + 'm' : '---'}</div></div>
            <div class="bg-slate-50 p-3 rounded-xl border"><div class="text-[8px] text-emerald-600 font-black uppercase mb-1">Hassasiyet</div><div class="text-xs font-bold mono-font text-slate-800">±${loc.accuracy.toFixed(1)}m</div></div>
          </div>
        </div>
        <div class="space-y-3">
          <button id="btn-continue-measure" class="w-full py-5 bg-[#2563eb] text-white rounded-[1.5rem] font-bold shadow-xl active:scale-95 transition-all">Devam Et</button>
          <button id="btn-finish-measure" class="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold opacity-80 active:scale-95 transition-all">Bitir</button>
        </div>
      </div>
    </div>
  `;
}

function renderList() {
  // Fix: Property 'length' does not exist on type 'unknown' and Property 'map' does not exist on type 'unknown'
  const folders: Record<string, any[]> = {};
  STATE.savedLocations.forEach((l: any) => {
    if (!folders[l.folderName]) folders[l.folderName] = [];
    folders[l.folderName].push(l);
  });
  return `
    <div class="h-full flex flex-col bg-[#F1F5F9] animate-in items-center">
      <div class="relative flex items-center justify-center sticky top-0 bg-[#F1F5F9]/90 pt-12 pb-6 px-6 w-full">
        <button id="btn-list-back" class="absolute left-6 bottom-4 w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-90 transition-all"><i class="fas fa-chevron-left"></i></button>
        <h2 class="text-xl font-extrabold text-slate-800">Kayıtlı Projeler</h2>
      </div>
      <div class="flex-1 w-full max-w-[400px] px-6 py-4 space-y-4 overflow-y-auto no-scrollbar pb-24">
        ${Object.keys(folders).length === 0 ? `<p class="py-20 text-center opacity-30 text-xs font-black uppercase">Kayıt Yok</p>` : Object.entries(folders).map(([name, locs]) => `
          <div class="soft-card overflow-hidden">
            <div onclick="window.toggleF('${name}')" class="p-5 flex items-center justify-between cursor-pointer active:bg-slate-50">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><i class="fas fa-folder"></i></div>
                <div><h4 class="font-extrabold text-sm text-slate-800">${name}</h4><p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${locs.length} Nokta</p></div>
              </div>
              <div class="flex gap-4">
                 <button onclick="event.stopPropagation();window.delF('${name}')" class="text-slate-300 p-2"><i class="fas fa-trash text-[10px]"></i></button>
                 <i class="fas fa-chevron-down text-[10px] text-slate-300 ${STATE.expandedFolders.includes(name) ? 'rotate-180' : ''}"></i>
              </div>
            </div>
            ${STATE.expandedFolders.includes(name) ? `
              <div class="p-3 bg-slate-50/50 space-y-2">
                ${locs.map(l => `<div class="bg-white p-3 rounded-2xl border flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    ${l.photo ? `<img src="${l.photo}" class="w-full h-full object-cover">` : `<i class="fas fa-camera text-slate-300 m-3"></i>`}
                  </div>
                  <div class="flex-1 min-w-0"><h5 class="text-xs font-bold truncate">${l.name}</h5><p class="text-[9px] mono-font text-slate-500">±${l.accuracy.toFixed(1)}m</p></div>
                  <button onclick="window.delP('${l.id}')" class="text-slate-200 p-2"><i class="fas fa-trash text-[10px]"></i></button>
                </div>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderExport() {
  const uniqueFolders = Array.from(new Set(STATE.savedLocations.map((l: any) => l.folderName)));
  return `
    <div class="h-full flex flex-col bg-[#F1F5F9] animate-in items-center">
      <div class="relative flex items-center justify-center sticky top-0 pt-12 pb-6 px-6 w-full">
        <button id="btn-export-back" class="absolute left-6 bottom-4 w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-600 active:scale-90 transition-all"><i class="fas fa-chevron-left"></i></button>
        <h2 class="text-xl font-extrabold text-slate-800">Veri Aktarımı</h2>
      </div>
      <div class="flex-1 w-full max-w-[400px] px-6 py-4 space-y-8 overflow-y-auto no-scrollbar pb-24">
        <div class="space-y-3">
          <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Proje Seçimi</h4>
          ${uniqueFolders.map((name: any) => {
            const isSel = STATE.selectedExportFolders.includes(name);
            return `<div onclick="window.toggleEx('${name}')" class="soft-card p-5 flex items-center gap-4 cursor-pointer border-2 ${isSel ? 'border-blue-500 bg-blue-50/20' : 'border-transparent'}">
              <div class="w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSel ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'}">${isSel ? '<i class="fas fa-check text-[10px]"></i>' : ''}</div>
              <span class="text-sm font-bold text-slate-800">${name}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="space-y-4 border-t pt-8">
          <button id="btn-ex-kml" class="w-full p-6 bg-indigo-600 text-white rounded-3xl font-bold text-xs uppercase flex items-center gap-5 active:scale-95 transition-all"><i class="fas fa-earth-europe text-xl"></i><span>Google Earth (.KML)</span></button>
          <button id="btn-ex-xlsx" class="w-full p-6 bg-emerald-600 text-white rounded-3xl font-bold text-xs uppercase flex items-center gap-5 active:scale-95 transition-all"><i class="fas fa-file-excel text-xl"></i><span>Excel (.XLSX)</span></button>
          <button id="btn-ex-zip" class="w-full p-6 bg-blue-600 text-white rounded-3xl font-bold text-xs uppercase flex items-center gap-5 active:scale-95 transition-all"><i class="fas fa-file-zipper text-xl"></i><span>Fotoğraf Arşivi (.ZIP)</span></button>
        </div>
      </div>
    </div>
  `;
}

// --- EVENT HANDLERS & HELPERS ---
function attachEvents() {
  // Onboarding
  const obBtn = document.getElementById('btn-onboarding-done');
  if (obBtn) obBtn.onclick = () => { localStorage.setItem('onboarding_v4_done', 'true'); navigate('home'); };

  // Nav
  const goCap = document.getElementById('btn-go-capture');
  if (goCap) goCap.onclick = () => { startGPS(); navigate('capture'); };
  const goList = document.getElementById('btn-go-list');
  if (goList) goList.onclick = () => navigate('list');
  const goEx = document.getElementById('btn-go-export');
  if (goEx) goEx.onclick = () => navigate('export');

  // Back Btns
  ['btn-capture-cancel', 'btn-list-back', 'btn-export-back'].forEach(id => {
    const el = document.getElementById(id); if (el) el.onclick = () => { stopGPS(); navigate('home'); }
  });

  // Capture Steps
  const modeNew = document.getElementById('btn-mode-new');
  if (modeNew) modeNew.onclick = () => { STATE.currentCapture.isNewProject = true; STATE.currentCapture.folderName = ''; STATE.currentCapture.step = 'FORM'; render(); };
  const modeExist = document.getElementById('btn-mode-existing');
  if (modeExist) modeExist.onclick = () => { STATE.currentCapture.isNewProject = false; STATE.currentCapture.step = 'FORM'; render(); };
  
  const formBack = document.getElementById('btn-form-back');
  if (formBack) formBack.onclick = () => { STATE.currentCapture.step = 'SELECT_MODE'; render(); };

  // Fix: Property 'value' does not exist on type 'EventTarget'
  const selectF = document.getElementById('select-folder');
  if (selectF) selectF.onchange = (e) => { STATE.currentCapture.folderName = (e.target as HTMLSelectElement).value; };
  const inputF = document.getElementById('input-folder');
  if (inputF) inputF.oninput = (e) => { STATE.currentCapture.folderName = (e.target as HTMLInputElement).value; };

  const proceedR = document.getElementById('btn-proceed-ready');
  if (proceedR) proceedR.onclick = () => {
    if (!STATE.currentCapture.folderName.trim()) return alert("Proje ismi boş olamaz.");
    localStorage.setItem('last_folder_name', STATE.currentCapture.folderName);
    
    // Auto point name
    const projPoints = STATE.savedLocations.filter((l: any) => l.folderName === STATE.currentCapture.folderName);
    let max = 0;
    projPoints.forEach((p: any) => { const m = p.name.match(/(\d+)$/); if (m) { const n = parseInt(m[1]); if (n > max) max = n; } });
    STATE.currentCapture.pointName = `Nokta ${max + 1}`;
    
    STATE.currentCapture.step = 'READY';
    render();
  };

  const readyBack = document.getElementById('btn-ready-back');
  if (readyBack) readyBack.onclick = () => { STATE.currentCapture.step = 'FORM'; render(); };

  // Fix: Property 'value' does not exist on type 'EventTarget'
  const inputP = document.getElementById('input-point');
  if (inputP) inputP.oninput = (e) => { STATE.currentCapture.pointName = (e.target as HTMLInputElement).value; };

  const startC = document.getElementById('btn-start-countdown');
  if (startC) startC.onclick = () => {
    STATE.currentCapture.samples = [];
    STATE.currentCapture.seconds = 5;
    STATE.currentCapture.step = 'COUNTDOWN';
    render();
    timerId = setInterval(() => {
      STATE.currentCapture.seconds--;
      if (STATE.currentCapture.seconds <= 0) {
        clearInterval(timerId);
        processSamples();
      } else render();
    }, 1000);
  };

  const cancelC = document.getElementById('btn-cancel-countdown');
  if (cancelC) cancelC.onclick = () => { clearInterval(timerId); STATE.currentCapture.step = 'READY'; render(); };

  // Result
  const finishM = document.getElementById('btn-finish-measure');
  if (finishM) finishM.onclick = () => { stopGPS(); navigate('home'); };
  const continueM = document.getElementById('btn-continue-measure');
  if (continueM) continueM.onclick = () => { navigate('capture'); STATE.currentCapture.step = 'READY'; };
  const addP = document.getElementById('btn-add-photo');
  if (addP) addP.onclick = takePhoto;

  // Export
  const exKml = document.getElementById('btn-ex-kml');
  if (exKml) exKml.onclick = () => exportFlow('kml');
  const exXlsx = document.getElementById('btn-ex-xlsx');
  if (exXlsx) exXlsx.onclick = () => exportFlow('xlsx');
  const exZip = document.getElementById('btn-ex-zip');
  if (exZip) exZip.onclick = () => exportFlow('zip');
}

// Global functions for inline onclicks
// Fix: Property 'toggleF'/'delP' etc do not exist on type 'Window'
(window as any).toggleF = (name: string) => {
  if (STATE.expandedFolders.includes(name)) STATE.expandedFolders = STATE.expandedFolders.filter((f: any) => f !== name);
  else STATE.expandedFolders.push(name);
  render();
};
(window as any).delP = (id: string) => {
  if (confirm("Silmek istiyor musunuz?")) { STATE.savedLocations = STATE.savedLocations.filter((l: any) => l.id !== id); localStorage.setItem('gps_locations_v4', JSON.stringify(STATE.savedLocations)); render(); }
};
(window as any).delF = (name: string) => {
  if (confirm(`'${name}' projesini sil?`)) { STATE.savedLocations = STATE.savedLocations.filter((l: any) => l.folderName !== name); localStorage.setItem('gps_locations_v4', JSON.stringify(STATE.savedLocations)); render(); }
};
(window as any).toggleEx = (name: string) => {
  if (STATE.selectedExportFolders.includes(name)) STATE.selectedExportFolders = STATE.selectedExportFolders.filter((f: any) => f !== name);
  else STATE.selectedExportFolders.push(name);
  render();
};

// Logic functions
function processSamples() {
  const samples = STATE.currentCapture.samples;
  if (samples.length === 0) return alert("Hata: GPS verisi alınamadı.");

  let pool = samples.filter((s: any) => s.accuracy <= 25);
  if (pool.length < 2) pool = samples.filter((s: any) => s.accuracy <= 100);
  if (pool.length === 0) pool = samples;

  pool.sort((a: any, b: any) => a.accuracy - b.accuracy);
  const keep = Math.max(1, Math.floor(pool.length * 0.8));
  const clean = pool.slice(0, keep);

  const avgLat = clean.reduce((a: any, b: any) => a + b.lat, 0) / clean.length;
  const avgLng = clean.reduce((a: any, b: any) => a + b.lng, 0) / clean.length;
  const avgAcc = clean.reduce((a: any, b: any) => a + b.accuracy, 0) / clean.length;
  const avgAlt = clean.reduce((a: any, b: any) => a + (b.altitude || 0), 0) / clean.length;

  const newLoc = {
    id: Date.now().toString(36),
    folderName: STATE.currentCapture.folderName,
    name: STATE.currentCapture.pointName,
    lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: avgAlt,
    photo: null, timestamp: Date.now()
  };

  STATE.savedLocations.unshift(newLoc);
  STATE.lastResult = newLoc;
  localStorage.setItem('gps_locations_v4', JSON.stringify(STATE.savedLocations));
  navigate('result');
}

function takePhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment' as any;
  input.onchange = (e) => {
    // Fix: Property 'files' does not exist on type 'EventTarget'
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      // Fix: Type 'string | ArrayBuffer' is not assignable to type 'string'
      if (re.target && typeof re.target.result === 'string') {
        const result = re.target.result;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const max = 800;
          const scale = Math.min(1, max / img.width);
          canvas.width = img.width * scale; canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const data = canvas.toDataURL('image/jpeg', 0.8);
          STATE.lastResult.photo = data;
          const idx = STATE.savedLocations.findIndex((l: any) => l.id === STATE.lastResult.id);
          if (idx !== -1) STATE.savedLocations[idx].photo = data;
          localStorage.setItem('gps_locations_v4', JSON.stringify(STATE.savedLocations));
          render();
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

async function exportFlow(format: string) {
  if (STATE.selectedExportFolders.length === 0) return alert("Proje seçin.");
  const targets = STATE.savedLocations.filter((l: any) => STATE.selectedExportFolders.includes(l.folderName));
  const ts = new Date().getTime();

  if (format === 'kml') {
    const kml = `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>${targets.map((l: any) => `<Placemark><name>${l.name}</name><Point><coordinates>${l.lng},${l.lat},0</coordinates></Point></Placemark>`).join('')}</Document></kml>`;
    download(kml, `ACB_Veri_${ts}.kml`, 'text/xml');
  } else if (format === 'xlsx') {
    await injectScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    // Fix: Cannot find name 'XLSX'
    const XLSX = (window as any).XLSX;
    const data = targets.map((l: any) => ({ "Proje": l.folderName, "Nokta": l.name, "Enlem": l.lat, "Boylam": l.lng, "Rakım": l.altitude }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Veriler");
    XLSX.writeFile(wb, `ACB_Excel_${ts}.xlsx`);
  } else if (format === 'zip') {
    const photos = targets.filter((l: any) => l.photo);
    if (photos.length === 0) return alert("Fotoğraf yok.");
    await injectScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    // Fix: Cannot find name 'JSZip'
    const JSZip = (window as any).JSZip;
    const zip = new JSZip();
    photos.forEach((l: any) => zip.file(`${l.folderName}_${l.name}.jpg`, l.photo.split(',')[1], { base64: true }));
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a'); a.href = url; a.download = `ACB_Foto_${ts}.zip`; a.click(); URL.revokeObjectURL(url);
  }
}

function download(content: string, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

function injectScript(url: string) {
  // Fix: Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?
  return new Promise<void>(res => {
    if (document.querySelector(`script[src="${url}"]`)) return res();
    const s = document.createElement('script'); s.src = url; s.onload = () => res(); document.head.appendChild(s);
  });
}

// Bootstrap
render();
