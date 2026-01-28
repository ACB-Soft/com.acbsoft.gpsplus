
import React, { useState } from 'react';

interface Props {
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

const LocationForm: React.FC<Props> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name, desc);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="soft-card p-8 border-slate-100 space-y-6 animate-in slide-in-from-bottom-4 duration-500 text-center">
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="w-12 h-1 bg-blue-600 rounded-full mb-1"></div>
        <h3 className="text-xl font-extrabold text-slate-800">Noktayı Kaydet</h3>
      </div>
      
      <div className="space-y-5 text-center">
        <div>
          <label className="block text-[10px] uppercase text-slate-400 font-black mb-2 tracking-widest">Kayıt İsmi</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Saha Çalışması A1"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-800 text-center placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-slate-400 font-black mb-2 tracking-widest">Açıklama</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Noktaya dair notlarınızı buraya yazın..."
            rows={3}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-800 text-center placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          Listeye Ekle
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold transition-all active:scale-95"
        >
          İptal Et ve Geri Dön
        </button>
      </div>
    </form>
  );
};

export default LocationForm;
