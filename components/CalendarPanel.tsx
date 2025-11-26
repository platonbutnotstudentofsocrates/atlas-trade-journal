
import React, { useState } from 'react';

// Enhanced interface to match the data structure
export interface EconomicEvent {
  event: string;
  time: string;
  dateLabel?: string;
  rawDate?: any; // Used for sorting
  importance: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast?: string;
  country?: string;
}

interface CalendarPanelProps {
  events: Record<string, EconomicEvent[]>;
  onClose: () => void;
}

// Static descriptions based on user prompts
const EVENT_DESCRIPTIONS: Record<string, string> = {
    "NFP": "Beklentiden güçlü NFP genelde doları destekler, zayıf veri dolar üzerinde baskı yaratabilir.",
    "Tarım Dışı İstihdam": "Beklentiden güçlü NFP genelde doları destekler, zayıf veri dolar üzerinde baskı yaratabilir.",
    
    "CPI": "Yüksek enflasyon dolar lehine olabilir, düşük enflasyon doların zayıflamasıyla ilişkilendirilebilir.",
    "TÜFE": "Yüksek enflasyon dolar lehine olabilir, düşük enflasyon doların zayıflamasıyla ilişkilendirilebilir.",
    
    "Fed Faiz Kararı": "Şahin kararlar doların güçlenmesiyle, güvercin açıklamalar doların zayıflamasıyla ilişkilidir.",
    
    "FOMC": "Şahin ton genelde DXY’yi yukarı, güvercin ton aşağı yönlü etkileyebilir.",
    
    "GDP": "Güçlü büyüme dolar lehine olabilir, zayıf büyüme dolar üzerinde baskı oluşturabilir.",
    "GSYİH": "Güçlü büyüme dolar lehine olabilir, zayıf büyüme dolar üzerinde baskı oluşturabilir.",
    
    "Core PCE": "Beklentiden yüksek PCE dolar için destekleyici, düşük PCE zayıflatıcı olabilir.",
    "Çekirdek PCE": "Beklentiden yüksek PCE dolar için destekleyici, düşük PCE zayıflatıcı olabilir.",
    
    "ISM Manufacturing": "Güçlü PMI doları destekleyebilir, zayıf PMI baskılayabilir.",
    "ISM İmalat": "Güçlü PMI doları destekleyebilir, zayıf PMI baskılayabilir.",
    
    "ISM Services": "Beklentinin üzerindeki hizmet verisi dolar lehine, zayıf veri dolar aleyhine olabilir.",
    "ISM Hizmetler": "Beklentinin üzerindeki hizmet verisi dolar lehine, zayıf veri dolar aleyhine olabilir.",
    
    "Jobless Claims": "Düşük başvurular dolar için olumlu, yüksek başvurular olumsuz algılanabilir.",
    "İşsizlik": "Düşük başvurular dolar için olumlu, yüksek başvurular olumsuz algılanabilir.",
    
    "Retail Sales": "Güçlü satış verisi dolar lehine, zayıf satışlar dolar üzerinde baskı yaratabilir.",
    "Perakende Satışlar": "Güçlü satış verisi dolar lehine, zayıf satışlar dolar üzerinde baskı yaratabilir."
};

const getEventDescription = (eventName: string): string => {
    const normalizedName = eventName.toLowerCase();
    for (const [key, desc] of Object.entries(EVENT_DESCRIPTIONS)) {
        if (normalizedName.includes(key.toLowerCase())) {
            return desc;
        }
    }
    return "Bu veri piyasada volatilite yaratabilir.";
};

export const CalendarPanel: React.FC<CalendarPanelProps> = ({ events, onClose }) => {
  // Flatten events and sort by Date then Time
  const allEvents = (Object.values(events).flat() as EconomicEvent[]).sort((a, b) => {
      // Sort by Date object if available, otherwise by time string (fallback)
      if (a.rawDate && b.rawDate) {
          return new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
      }
      return a.time.localeCompare(b.time);
  });

  // State for explanation
  const [explainingIndex, setExplainingIndex] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleExplain = (evt: EconomicEvent, index: number) => {
      if (explainingIndex === index) {
          // Close if already open
          setExplainingIndex(null);
          setExplanation(null);
          return;
      }

      setExplainingIndex(index);
      const desc = getEventDescription(evt.event);
      setExplanation(desc);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl overflow-hidden text-gray-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/80">
        <h2 className="font-bold text-lg text-blue-400 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5h-13.5zm0 5.25h13.5h-13.5z" />
          </svg>
          Ekonomik Takvim
        </h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
         <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-slate-800/90 text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                    <th className="p-3 font-semibold w-20">Saat</th>
                    <th className="p-3 font-semibold w-16">Ülke</th>
                    <th className="p-3 font-semibold">Olay</th>
                    <th className="p-3 font-semibold text-right w-16">Bekl.</th>
                    <th className="p-3 font-semibold text-right w-16">Akt.</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
                {allEvents.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                            Veriler yükleniyor veya bulunamadı...
                        </td>
                    </tr>
                ) : (
                    allEvents.map((evt, i) => (
                        <React.Fragment key={i}>
                            <tr className="hover:bg-white/5 transition-colors group">
                                <td className="p-3 font-mono text-slate-300 border-r border-slate-800/50">
                                    <div className="flex flex-col leading-tight">
                                        <span>{evt.time}</span>
                                        {evt.dateLabel && (
                                            <span className="text-[9px] text-slate-500">{evt.dateLabel}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-slate-300 font-bold border-r border-slate-800/50">{evt.country}</td>
                                <td className="p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                                                evt.importance === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' :
                                                evt.importance === 'Medium' ? 'bg-orange-400' : 'bg-blue-400'
                                            }`}></span>
                                            <span className="text-gray-100 font-medium group-hover:text-blue-300 transition-colors">
                                            {evt.event}
                                            </span>
                                        </div>
                                        {/* Info Button - Only for High Importance */}
                                        {evt.importance === 'High' && (
                                            <button 
                                                onClick={() => handleExplain(evt, i)}
                                                className={`
                                                    p-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 
                                                    text-indigo-400 hover:bg-indigo-500 hover:text-white 
                                                    transition-all transform hover:scale-110
                                                    ${explainingIndex === i ? 'bg-indigo-500 text-white' : ''}
                                                `}
                                                title="Bilgi Göster"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                                    <path fillRule="evenodd" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" opacity="0.5"/>
                                                    <path d="M12 9a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0v-5.25A.75.75 0 0112 9z" />
                                                    <path d="M12 6.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-right text-slate-400">{evt.forecast || '-'}</td>
                                <td className={`p-3 text-right font-bold ${
                                    !evt.actual ? 'text-gray-500' :
                                    evt.forecast && evt.actual && parseFloat(evt.actual) >= parseFloat(evt.forecast) 
                                    ? 'text-green-400' 
                                    : 'text-red-400'
                                }`}>
                                    {evt.actual || '-'}
                                </td>
                            </tr>
                            {/* Explanation Row */}
                            {explainingIndex === i && (
                                <tr className="bg-indigo-900/20 animate-in fade-in duration-300">
                                    <td colSpan={5} className="p-3 pl-12 border-b border-indigo-500/30">
                                        <div className="flex items-start gap-2 text-xs text-indigo-200">
                                            <div className="mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-400">
                                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="leading-relaxed font-medium">{explanation}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))
                )}
            </tbody>
         </table>
      </div>
    </div>
  );
};
