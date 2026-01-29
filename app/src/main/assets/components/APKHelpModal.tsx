import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const APKHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="soft-card w-full max-w-sm bg-white max-h-[85vh] overflow-y-auto no-scrollbar relative z-10 animate-in zoom-in-95 duration-300 p-8 space-y-8">
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 leading-tight">APK & İzin<br/>Rehberi</h3>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Sorun Giderme ve Kurulum</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-blue-600">
              <i className="fas fa-circle-info text-sm"></i>
              <h4 className="text-xs font-black uppercase tracking-widest">Neden Hata Alıyorum?</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Web tarayıcılarında çalışan izinler, APK olarak paketlendiğinde Android sisteminin katı güvenlik duvarına takılır. Uygulamanın çalışması için Android sistemine bu izinlerin "açıkça" beyan edilmesi gerekir.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <i className="fas fa-list-check text-sm"></i>
              <h4 className="text-xs font-black uppercase tracking-widest">Çözüm Adımları</h4>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">1</div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800 mb-1">Manifest Dosyası</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Projenizdeki <code className="bg-slate-200 text-slate-700 px-1 rounded">AndroidManifest.xml</code> dosyasına konum ve kamera izinlerini ekleyin.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">2</div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800 mb-1">WebView İzinleri</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Uygulama kodunda WebView'ın donanım erişimine (WebChromeClient) izin verildiğinden emin olun.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">3</div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800 mb-1">Manuel İzin Verme</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Telefondan <code className="bg-slate-200 text-slate-700 px-1 rounded">Ayarlar > Uygulamalar</code> kısmından GPS+ uygulamasını bulup izinleri manuel açmayı deneyin.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-blue-600 p-6 rounded-3xl text-white space-y-3 shadow-lg shadow-blue-100">
             <div className="flex items-center gap-2">
                <i className="fas fa-code text-xs opacity-60"></i>
                <h5 className="text-[10px] font-black uppercase tracking-widest">Geliştirici Notu</h5>
             </div>
             <p className="text-[10px] font-bold leading-relaxed opacity-90">
               Proje kök dizinine eklediğim <strong>android_manifest_template.xml</strong> dosyasındaki kodları APK oluştururken kullanabilirsiniz.
             </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          Anladım
        </button>
      </div>
    </div>
  );
};

export default APKHelpModal;