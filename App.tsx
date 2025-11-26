
import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EarthScene } from './components/EarthScene';
import { Loader } from './components/Loader';
import { DashboardLayout } from './components/DashboardLayout';
import { TradeJournalModal } from './components/TradeJournalModal';

// Fix for missing R3F types in JSX
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
    }
  }
}

// Mock Data Types
export interface TradeRecord {
    id: number;
    pair: string;
    direction: 'Long' | 'Short';
    outcome: 'Win' | 'Loss' | 'Pending';
    rValue: string;
    session: string;
    date: string;
    link?: string;
    description?: string;
}

const App: React.FC = () => {
  // UI States
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  
  // Data States
  const [tradeRecords, setTradeRecords] = useState<TradeRecord[]>([]);

  // Load Data on Mount
  useEffect(() => {
      const savedTrades = localStorage.getItem('poseidon_trades');
      if (savedTrades) {
          try {
            const parsed = JSON.parse(savedTrades);
            if (Array.isArray(parsed)) {
                setTradeRecords(parsed);
            }
          } catch (e) {
            console.error("Error loading trades:", e);
          }
      }
  }, []);

  // Save Data when records change
  useEffect(() => {
      // Only save if we have initialized (or if empty, save empty array is fine but we want to avoid overwriting on initial load if logic was complex)
      // Here we just save whatever is in state to sync
      localStorage.setItem('poseidon_trades', JSON.stringify(tradeRecords));
  }, [tradeRecords]);


  const handleSaveRecord = (data: { 
      pair: string; 
      direction: 'Long' | 'Short'; 
      outcome: 'Win' | 'Loss' | 'Pending'; 
      rValue: string; 
      session: string;
      link?: string; 
      description?: string 
  }) => {
      const newRecord: TradeRecord = {
          id: Date.now(),
          pair: data.pair,
          direction: data.direction,
          outcome: data.outcome,
          rValue: data.rValue,
          session: data.session,
          date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          link: data.link,
          description: data.description
      };
      setTradeRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteRecord = (id: number) => {
      setTradeRecords(prev => {
          const updated = prev.filter(record => record.id !== id);
          return updated;
      });
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      
      {/* 1. LAYER: 3D Scene (Background) */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          gl={{ antialias: true }}
          dpr={window.devicePixelRatio}
        >
          <color attach="background" args={['#020203']} />
          <Suspense fallback={null}>
            <EarthScene />
          </Suspense>
        </Canvas>
      </div>

      {/* 2. LAYER: Loading State */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
        <Suspense fallback={<Loader />}>
          <span />
        </Suspense>
      </div>

      {/* 3. LAYER: Floating UI Buttons (Always Visible & Clickable) */}
      {!isDashboardOpen && (
        <div className="absolute inset-0 z-20 pointer-events-none">
            
            {/* Top Left: Open Dashboard */}
            <div className="absolute top-6 left-6 pointer-events-auto">
                <button
                    onClick={() => setIsDashboardOpen(true)}
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200 shadow-xl group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    {/* Tooltip */}
                    <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Dashboard</span>
                </button>
            </div>

            {/* Top Right: Tools */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-3 pointer-events-auto">
                {/* Journal Button */}
                <button
                    onClick={() => { 
                        setIsJournalOpen(!isJournalOpen); 
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-200 shadow-xl ${isJournalOpen ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                </button>
            </div>

            {/* Modals Container */}
            {isJournalOpen && (
              <div className="z-50 fixed inset-0 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:absolute md:inset-auto md:top-24 md:right-6 md:block md:items-start md:justify-start">
                  <div className="w-[90vw] max-h-[80vh] md:w-[400px] md:max-h-[600px] md:h-[600px] animate-in slide-in-from-bottom-5 md:slide-in-from-right-10 zoom-in-95 duration-300 shadow-2xl flex flex-col">
                      <TradeJournalModal 
                          onClose={() => setIsJournalOpen(false)} 
                          onSave={handleSaveRecord} 
                      />
                  </div>
              </div>
            )}
        </div>
      )}

      {/* 4. LAYER: Dashboard Overlay (Full Screen) */}
      {isDashboardOpen && (
          <div className="absolute inset-0 z-50 overflow-hidden bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
              <DashboardLayout 
                records={tradeRecords} 
                onClose={() => setIsDashboardOpen(false)} 
                onDelete={handleDeleteRecord}
              />
          </div>
      )}
    </div>
  );
};

export default App;
