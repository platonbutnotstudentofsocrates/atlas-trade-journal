
import React, { useMemo, useState } from 'react';
import { TradeRecord } from '../App';

interface DashboardLayoutProps {
  records: TradeRecord[];
  onClose: () => void;
  onDelete: (id: number) => void;
}

type ViewState = 'overview' | 'calendar';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ records, onClose, onDelete }) => {
    const [currentView, setCurrentView] = useState<ViewState>('overview');
    
    // STRICTLY use passed records, no mocks.
    const allRecords = records; 

    // Derived Stats
    const stats = useMemo(() => {
        const total = allRecords.length;
        const completedTrades = allRecords.filter(r => r.outcome !== 'Pending');
        const wins = completedTrades.filter(r => r.outcome === 'Win').length;
        const winRate = completedTrades.length > 0 ? ((wins / completedTrades.length) * 100).toFixed(1) : "0.0";
        
        let pnl = 0;
        let grossWin = 0;
        let grossLoss = 0;

        allRecords.forEach(r => {
            if(r.outcome === 'Win') {
                const val = parseFloat(r.rValue || "0");
                pnl += val;
                grossWin += val;
            }
            if(r.outcome === 'Loss') {
                pnl -= 1; // Assuming 1R risk
                grossLoss += 1;
            }
        });

        // Profitability Index for P&L Chart (Ratio of Wins to Total Volume)
        const totalVolume = grossWin + grossLoss;
        const profitabilityIndex = totalVolume > 0 ? (grossWin / totalVolume) * 100 : 0;
        
        return { 
            total, 
            wins, 
            winRate, 
            pnl: pnl.toFixed(2),
            profitabilityIndex
        };
    }, [allRecords]);

    return (
        <div className="w-full h-full flex bg-[#0c0c0e] text-slate-300 font-sans selection:bg-indigo-500/30">
            
            {/* Sidebar */}
            <div className="w-20 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-[#0c0c0e] z-20 shrink-0">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900/20 mb-4 cursor-default">
                    P
                </div>
                
                <SidebarIcon 
                    active={currentView === 'overview'} 
                    onClick={() => setCurrentView('overview')}
                    icon={<HomeIcon />} 
                    label="Özet"
                />
                <SidebarIcon 
                    active={currentView === 'calendar'} 
                    onClick={() => setCurrentView('calendar')}
                    icon={<CalendarIcon />} 
                    label="Takvim"
                />
                
                <div className="flex-1"></div>
                <button onClick={onClose} className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-4" title="Çıkış">
                    <LogoutIcon />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0e] relative overflow-hidden">
                
                {/* Header */}
                <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-[#0c0c0e]/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-white tracking-tight">
                            {currentView === 'overview' ? 'Dashboard' : 'İşlem Takvimi'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Kasa Durumu</div>
                            <div className="text-sm font-mono text-white">
                                {allRecords.length > 0 ? `${stats.pnl}R` : '---'}
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-white/10"></div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="p-8 min-h-full">
                        <div className="max-w-7xl mx-auto">
                            
                            {/* VIEW: OVERVIEW */}
                            {currentView === 'overview' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                                    {/* KPI Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <KPICard 
                                            title="Net P&L" 
                                            value={`${stats.pnl}R`} 
                                            trend="Toplam" 
                                            trendUp={parseFloat(stats.pnl) >= 0} 
                                        />
                                        <KPICard 
                                            title="Win Rate" 
                                            value={`${stats.winRate}%`} 
                                            trend="Genel" 
                                            trendUp={parseFloat(stats.winRate) > 40} 
                                            chartValue={parseFloat(stats.winRate)} 
                                        />
                                        <KPICard 
                                            title="İşlemler" 
                                            value={stats.total.toString()} 
                                            trend="Adet" 
                                            trendUp={true} 
                                        />
                                        <KPICard 
                                            title="Ort. R" 
                                            value={stats.total > 0 ? (parseFloat(stats.pnl) / stats.total).toFixed(2) + "R" : "0R"} 
                                            trend="İşlem Başına" 
                                            trendUp={parseFloat(stats.pnl) >= 0} 
                                        />
                                    </div>

                                    {/* Recent Trades Table */}
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden flex flex-col relative min-h-[400px]">
                                            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#121214]">
                                                <h3 className="text-sm font-medium text-slate-400">Son İşlemler</h3>
                                            </div>
                                            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                                <table className="w-full text-left">
                                                    <thead className="text-[10px] uppercase text-slate-500 bg-black/20 sticky top-0 backdrop-blur-md z-10">
                                                        <tr>
                                                            <th className="px-4 py-3 font-medium">Parite</th>
                                                            <th className="px-4 py-3 font-medium text-center">Grafik</th>
                                                            <th className="px-4 py-3 font-medium">Session</th>
                                                            <th className="px-4 py-3 font-medium">Yön</th>
                                                            <th className="px-4 py-3 font-medium">Sonuç</th>
                                                            <th className="px-4 py-3 font-medium text-right">Getiri (R)</th>
                                                            <th className="px-4 py-3 font-medium text-right">Tarih</th>
                                                            <th className="px-4 py-3 font-medium text-right">İşlem</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {allRecords.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={8} className="px-4 py-12 text-center text-slate-600 flex flex-col items-center justify-center gap-2">
                                                                    <span className="text-2xl opacity-20">📭</span>
                                                                    <span className="text-xs">Henüz kayıtlı işlem yok.</span>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            allRecords.slice().reverse().map(r => (
                                                                <tr key={r.id} className="text-xs hover:bg-white/[0.02] transition-colors group">
                                                                    <td className="px-4 py-3 font-medium text-white font-mono">
                                                                        {r.pair}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        {r.link ? (
                                                                            <a 
                                                                                href={r.link} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors"
                                                                                title="Grafiği Görüntüle"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                                                </svg>
                                                                            </a>
                                                                        ) : (
                                                                            <span className="text-slate-700 text-xs">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-400">{r.session}</td>
                                                                    <td className="px-4 py-3">
                                                                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] uppercase tracking-wider ${
                                                                            r.direction === 'Long' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                                                                        }`}>{r.direction}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-slate-300">{r.outcome}</td>
                                                                    <td className={`px-4 py-3 text-right font-mono ${
                                                                        r.outcome === 'Win' ? 'text-emerald-400' : r.outcome === 'Loss' ? 'text-rose-400' : 'text-slate-400'
                                                                    }`}>
                                                                        {r.outcome === 'Win' ? '+' + r.rValue : r.outcome === 'Loss' ? '-1.0' : '0.0'}R
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right text-slate-500">{r.date}</td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <button 
                                                                            onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}
                                                                            className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                                            title="Kaydı Sil"
                                                                        >
                                                                            <TrashIcon />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* VIEW: CALENDAR */}
                            {currentView === 'calendar' && (
                                <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                                    {/* Account Growth Chart */}
                                    <div className="h-80 shrink-0 bg-[#121214] border border-white/5 rounded-2xl p-6 relative flex flex-col">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-slate-200">Bakiye Büyümesi</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-xs text-slate-500">Kümülatif P&L (R)</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <SimpleLineChart records={allRecords} showArea={true} />
                                        </div>
                                    </div>

                                    {/* Trade Calendar Grid */}
                                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 flex flex-col min-h-[400px]">
                                        <h3 className="text-lg font-medium text-slate-200 mb-6">Aylık Döküm</h3>
                                        <CalendarGrid records={allRecords} />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub Components ---

const CircularProgress = ({ value, size = 56, strokeWidth = 5, color = "text-emerald-500" }: { value: number, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-white/5"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
        </div>
    );
};

const KPICard = ({ title, value, trend, trendUp, chartValue }: any) => (
  <div className="bg-[#121214] border border-white/5 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-white/10 transition-colors min-h-[110px]">
      {/* Background decoration for cards without charts */}
      {chartValue === undefined && (
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none" className={trendUp ? "text-emerald-500" : "text-rose-500"}>
                <path d="M0 30 Q 15 25, 30 15 T 60 0" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col justify-between h-full z-10">
          <div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</div>
            <div className="text-2xl font-mono text-white tracking-tight">{value}</div>
          </div>
          <div className={`text-xs flex items-center gap-1 mt-auto ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
          </div>
      </div>

      {/* Chart (Right Side) */}
      {chartValue !== undefined && (
          <div className="z-10 ml-4 shrink-0">
               <CircularProgress 
                  value={chartValue} 
                  size={52} 
                  strokeWidth={5} 
                  color={trendUp ? "text-emerald-500" : "text-rose-500"} 
               />
          </div>
      )}
  </div>
);

const SidebarIcon: React.FC<{icon: React.ReactNode, active?: boolean, onClick?: () => void, label?: string}> = ({icon, active, onClick, label}) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-xl transition-all group relative ${active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
        {icon}
        {label && (
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                {label}
            </div>
        )}
    </button>
);

const SimpleLineChart: React.FC<{records: TradeRecord[], showArea?: boolean}> = ({ records, showArea }) => {
    if (records.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs italic border-2 border-dashed border-white/5 rounded-lg bg-black/20">
                Grafik için veri yok
            </div>
        );
    }

    const sortedRecords = [...records].sort((a, b) => a.id - b.id);
    let cumulative = 0;
    const dataPoints = sortedRecords.map(r => {
        let val = 0;
        if(r.outcome === 'Win') val = parseFloat(r.rValue || "0");
        if(r.outcome === 'Loss') val = -1;
        cumulative += val;
        return cumulative;
    });

    // Add starting point 0
    const values = [0, ...dataPoints];
    const max = Math.max(...values, 1);
    const min = Math.min(...values, -1);
    const range = max - min;
    
    // Create SVG path
    const width = 1000;
    const height = 300;
    const stepX = width / (values.length - 1 || 1);
    
    const points = values.map((val, i) => {
        const x = i * stepX;
        const normalizedY = (val - min) / (range || 1); 
        const y = height - (normalizedY * height); // Flip Y
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Zero Line */}
                {min < 0 && max > 0 && (
                    <line 
                        x1="0" 
                        y1={height - ((0 - min) / range * height)} 
                        x2={width} 
                        y2={height - ((0 - min) / range * height)} 
                        stroke="#334155" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                    />
                )}
                
                {showArea && (
                    <path 
                        d={`M0,${height} ${points} L${width},${height} Z`} 
                        fill="url(#gradient)" 
                        opacity="0.2" 
                    />
                )}
                <path 
                    d={`M ${points}`}
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

const CalendarGrid: React.FC<{ records: TradeRecord[] }> = ({ records }) => {
    // Basic visualization of recent trades as blocks since we don't have a date library
    if (records.length === 0) {
         return (
             <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                 Takvim verisi bulunamadı.
             </div>
         );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {records.slice(0, 28).map((record) => (
                <div key={record.id} className="aspect-square bg-[#1a1a1e] rounded-lg border border-white/5 p-3 flex flex-col justify-between hover:border-white/20 transition-all cursor-default group relative">
                    <span className="text-[10px] text-slate-500">{record.date.split(' ')[0]}</span>
                    <div className="text-center">
                        <div className="text-xs font-bold text-white mb-1">{record.pair}</div>
                        <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            record.outcome === 'Win' ? 'bg-emerald-500/20 text-emerald-400' :
                            record.outcome === 'Loss' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-slate-700 text-slate-400'
                        }`}>
                            {record.outcome === 'Win' ? `+${record.rValue}R` : record.outcome === 'Loss' ? '-1R' : '...'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// SVG Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5h-13.5zm0 5.25h13.5h-13.5z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
