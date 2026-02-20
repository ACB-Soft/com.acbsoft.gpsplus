import React from 'react';

interface OnboardingProps {
  onFinish?: () => void;
  onComplete?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = (props) => {
  const handleStart = () => {
    // Yazım hatası düzeltildi ve her iki prop ismi de kontrol ediliyor
    if (typeof props.onFinish === 'function') {
      props.onFinish();
    } else if (typeof props.onComplete === 'function') {
      props.onComplete();
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-white overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white z-0" />
      
      <div className="relative z-10 flex-1 flex flex-col px-8 pt-20 pb-12">
        <div className="mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-200 mb-8 animate-bounce">
            <i className="fas fa-location-dot text-3xl text-white"></i>
          </div>
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-6 uppercase italic">
            GPS Plus<br/><span className="text-blue-600 not-italic">Corporate</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-[280px]">
            Profesyonel saha ölçüm ve veri yönetim platformuna hoş geldiniz.
          </p>
        </div>

        <div className="space-y-6 mb-12">
          {[
            { icon: 'fa-layer-group', title: 'Akıllı Klasörleme', desc: 'Projelerinizi organize edin' },
            { icon: 'fa-file-export', title: 'Çoklu Aktarım', desc: 'KML, Excel ve TXT desteği' },
            { icon: 'fa-shield-check', title: 'Yüksek Hassasiyet', desc: 'Milimetrik GPS verisi' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <i className={`fas ${item.icon} text-lg`}></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-none mb-1 uppercase text-xs tracking-wider">{item.title}</h3>
                <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <button 
            onClick={handleStart}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
          >
            Hadi Başlayalım
            <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
          </button>
          <p className="text-center mt-6 text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            v4.7.0 Corporate Edition
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
