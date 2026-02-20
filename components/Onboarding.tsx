import React from 'react';
import { BRAND_NAME } from '../version';
import { Geolocation } from '@capacitor/geolocation';
import { NativeSettings } from 'capacitor-native-settings';

interface Props {
  onFinish: () => void;
}

const Onboarding: React.FC<Props> = ({ onFinish }) => {

  const handleStart = async () => {
    try {
      // 1. ADIM: GPS Donanımı Kontrolü
      try {
        await Geolocation.getCurrentPosition({ timeout: 2000, enableHighAccuracy: true });
      } catch (e: any) {
        if (e.code === 1 || e.message?.includes("denied") || e.message?.includes("location services")) {
           // İzin reddedilmiş veya servis kapalıysa ayarlara yönlendir
           alert("Lütfen cihazınızın konum (GPS) servisini açın.");
           await NativeSettings.open({ option: 'locationServices' });
           return;
        }
      }

      // 2. ADIM: İzin Denetimi
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          alert("Konum izni olmadan ölçüm yapılamaz.");
          return;
        }
      }

      onFinish(); // Her şey tamamsa dashboard'a geç
    } catch (error: any) {
      console.error("Kritik hata:", error);
      onFinish(); // Hata olsa bile kullanıcıyı içeride tut
    }
  };

  return (
    // SENİN ORİJİNAL TASARIMIN (DOKUNULMADI)
    <div className="flex-1 flex flex-col bg-white h-full animate-in overflow-hidden px-8 py-6 md:py-10 justify-around">
      <div className="flex flex-col items-center text-center shrink-0">
        <div className="relative mb-4 md:mb-6">
          <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full"></div>
          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/30 transform rotate-2">
            <i className="fas fa-shield-halved text-white text-2xl md:text-3xl transform -rotate-2"></i>
          </div>
        </div>
        <div className="space-y-2 md:space-y-3">
          <p className="text-slate-900 font-black text-[12px] md:text-[14px] uppercase tracking-[0.18em] leading-tight max-w-[260px] mx-auto opacity-80">
            Mobil Cihazlarınız için<br/>Konum Belirleme Uygulaması
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-blue-600 tracking-tighter leading-none">
            {BRAND_NAME}
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-sm mx-auto space-y-4 md:space-y-5">
        <div className="w-full flex gap-4 md:gap-5 text-left items-center p-4 md:p-6 bg-slate-50/50 rounded-[1.8rem] border border-slate-100">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <i className="fas fa-location-crosshairs text-lg md:text-xl"></i>
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] md:text-[12px] font-black text-slate-900 uppercase tracking-widest">Konum Erişimi</h4>
            <p className="text-[12px] md:text-[13px] text-slate-500 font-bold leading-snug">GPS verilerini kullanarak konum bilgisi üretmek için gereklidir.</p>
          </div>
        </div>
        {/* ... Diğer kartların ... */}
      </div>

      <div className="w-full max-w-sm mx-auto shrink-0">
        <button onClick={handleStart} className="w-full py-5 md:py-6 bg-blue-600 text-white rounded-[1.5rem] md:rounded-[1.8rem] font-black text-[13px] md:text-[14px] uppercase tracking-[0.2em] shadow-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-4">
          İZİNLERİ ONAYLA VE BAŞLA
          <i className="fas fa-arrow-right text-white/50 text-[11px]"></i>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
