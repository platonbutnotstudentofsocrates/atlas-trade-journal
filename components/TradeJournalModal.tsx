
import React, { useState, useEffect } from 'react';

interface TradeJournalModalProps {
  onClose: () => void;
  onSave: (data: { 
    pair: string; 
    direction: 'Long' | 'Short'; 
    outcome: 'Win' | 'Loss' | 'Pending'; 
    rValue: string;
    session: string;
    link?: string;
    description?: string;
  }) => void;
}

const SESSIONS = ['Asia', 'London', 'New York', 'Close'];

export const TradeJournalModal: React.FC<TradeJournalModalProps> = ({ onClose, onSave }) => {
  // LocalStorage'dan geçmiş pariteleri çek (Generic Key)
  const [savedPairs, setSavedPairs] = useState<string[]>([]);
  const storageKey = 'poseidon_saved_pairs';

  useEffect(() => {
    const storedPairs = localStorage.getItem(storageKey);
    if (storedPairs) {
      setSavedPairs(JSON.parse(storedPairs));
    }
  }, []);

  // Manual Form State
  const [form, setForm] = useState({
    pair: '',
    direction: 'Long' as 'Long' | 'Short',
    outcome: 'Pending' as 'Win' | 'Loss' | 'Pending',
    rValue: '',
    session: 'London',
    link: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pair || !form.rValue) {
        alert("Lütfen Parite ve R değerini giriniz.");
        return;
    }

    // Pariteyi hafızaya kaydet (varsa başa taşı)
    const upperPair = form.pair.toUpperCase();
    const newPairs = [upperPair, ...savedPairs.filter(p => p !== upperPair)].slice(0, 20); // Son 20 tane
    setSavedPairs(newPairs);
    localStorage.setItem(storageKey, JSON.stringify(newPairs));

    onSave({
        pair: upperPair,
        direction: form.direction,
        outcome: form.outcome,
        rValue: form.rValue,
        session: form.session,
        link: form.link,
        description: form.description
    });
    onClose();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl overflow-hidden text-gray-100">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-slate-700 bg-slate-800/80">
        <h2 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Trade Ekle
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6">
         
         <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300 pb-2">
            
            {/* Parite & R */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Parite</label>
                    <input 
                        type="text" 
                        list="pair-suggestions"
                        value={form.pair}
                        onChange={(e) => setForm({...form, pair: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-600 transition-all font-mono uppercase"
                        placeholder="BTCUSD"
                        autoComplete="off"
                    />
                    <datalist id="pair-suggestions">
                        {savedPairs.map(pair => (
                            <option key={pair} value={pair} />
                        ))}
                    </datalist>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Kazanç (R)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={form.rValue}
                        onChange={(e) => setForm({...form, rValue: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-slate-600 transition-all font-mono"
                        placeholder="2.5"
                    />
                </div>
            </div>

            {/* Session */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Session (Oturum)</label>
                <div className="grid grid-cols-4 gap-2">
                    {SESSIONS.map((sess) => (
                        <button
                            key={sess}
                            type="button"
                            onClick={() => setForm({...form, session: sess})}
                            className={`
                                py-2 px-1 rounded-lg border text-[10px] md:text-xs font-bold transition-all
                                ${form.session === sess 
                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700 hover:text-slate-300'}
                            `}
                        >
                            {sess}
                        </button>
                    ))}
                </div>
            </div>

            {/* Yön */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Yön</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setForm({...form, direction: 'Long'})}
                        className={`p-3 rounded-lg border text-sm font-semibold transition-all ${form.direction === 'Long' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Long ▲
                    </button>
                    <button
                        type="button"
                        onClick={() => setForm({...form, direction: 'Short'})}
                        className={`p-3 rounded-lg border text-sm font-semibold transition-all ${form.direction === 'Short' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Short ▼
                    </button>
                </div>
            </div>

            {/* Sonuç */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Sonuç</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['Win', 'Loss', 'Pending'] as const).map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setForm({...form, outcome: opt})}
                            className={`
                                py-2 rounded-lg border text-xs font-bold transition-all
                                ${form.outcome === opt 
                                    ? (opt === 'Win' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 
                                       opt === 'Loss' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 
                                       'bg-blue-500/20 border-blue-500 text-blue-400')
                                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}
                            `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

             {/* Açıklama */}
             <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Notlar / Açıklama</label>
                <textarea 
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm focus:border-emerald-500 focus:outline-none placeholder-slate-600 resize-none h-24 transition-all"
                    placeholder="İşlem stratejisi..."
                />
            </div>

            {/* Grafik Linki (Saved in Record) */}
            <div className="flex flex-col gap-1.5 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Grafik Linki (Kayıt)
                </label>
                <input 
                    type="text" 
                    value={form.link}
                    onChange={(e) => setForm({...form, link: e.target.value})}
                    className="w-full bg-black/30 border border-slate-600 rounded-lg p-2.5 text-emerald-400 text-xs focus:border-emerald-500 focus:outline-none transition-all font-mono"
                    placeholder="https://tradingview.com/..."
                />
            </div>

            <div className="mt-2">
                <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-[0.98] shadow-emerald-900/20"
                >
                    ✓ Kaydet
                </button>
            </div>
         </form>
      </div>
    </div>
  );
};
