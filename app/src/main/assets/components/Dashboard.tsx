import React from 'react';
import { BRAND_NAME } from '../version';

interface Props {
  onStartCapture: () => void;
  onShowList: () => void;
  onShowExport: () => void;
}

const Dashboard: React.FC<Props> = ({ onStartCapture, onShowList, onShowExport }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] animate-in h-full overflow-hidden px-8 pt-16 md:pt-24 justify-start">
      {/* Header - Logo kaldırıldı, metinler merkezlendi ve üst girinti artırıldı */}
      <header className="flex flex-col items-center shrink-0 mb-10 md:mb-16">
        {/* Açıklama Metni - Siyah Renk, Merkezlenmiş */}
        <p className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 leading-tight text-center max-w-[260px] md:max-w-[300px]">
          Mobil cihazlarınız için Konum Belirleme Uygulaması
        </p>
        
        {/* Ana Başlık - #2563eb Mavi Renk */}
        <h1 className="text-5xl md:text-6xl font-black text-[#2563eb] tracking-tighter leading-none text-center">
          {BRAND_NAME}
        </h1>
      </header>

      <main className="w-full max-w-sm mx-auto flex flex-col space-y-4 md:space-y-6">
        {/* Ana Buton - Temiz ve güçlü görünüm */}
        <button 
          onClick={onStartCapture}
          className="w-full py-10 md:py-14 px-8 md:px-10 bg-blue-600 text-white rounded-[2.8rem] md:rounded-[3.2rem] shadow-2xl shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden"
        >
          <div className="relative z-10 text-left">
            <span className="text-2xl md:text-3xl font-black block tracking-tight leading-none uppercase">Yeni Ölçüm</span>
          </div>
          <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <i className="fas fa-plus text-xl md:text-3xl text-white"></i>
          </div>
          {/* Süsleme Amaçlı Gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        </button>

        {/* Alt Menü - Renklendirilmiş ve ilgi çekici */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <button 
            onClick={onShowList}
            className="p-6 md:p-8 bg-white rounded-[2.2rem] md:rounded-[2.8rem] text-left border border-slate-100 shadow-xl shadow-slate-200/40 active:scale-[0.98] transition-all group"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <i className="fas fa-folder-open text-lg md:text-xl"></i>
            </div>
            <span className="text-[11px] md:text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none block">PROJELERİM</span>
          </button>

          <button 
            onClick={onShowExport}
            className="p-6 md:p-8 bg-white rounded-[2.2rem] md:rounded-[2.8rem] text-left border border-slate-100 shadow-xl shadow-slate-200/40 active:scale-[0.98] transition-all group"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <i className="fas fa-file-export text-lg md:text-xl"></i>
            </div>
            <span className="text-[11px] md:text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none block">VERİ AKTAR</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;