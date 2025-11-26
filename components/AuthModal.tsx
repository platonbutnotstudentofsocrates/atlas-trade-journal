import React, { useState } from 'react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: { email: string; id: number }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    // Use relative path which is proxied by Vite
    const API_BASE = ''; 

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Check content type to ensure we got JSON back
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON Response:", text);
        throw new Error(`Sunucu Hatası: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'İşlem başarısız.');
      }

      setSuccessMsg(isLogin ? "Giriş başarılı!" : "Kayıt başarılı! Giriş yapılıyor...");
      
      // Short delay to show success message
      setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
      }, 1000);

    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Bağlantı hatası.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-[350px] bg-[#121214] border border-white/10 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Background glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white tracking-tight mb-1">PoseidonVest</h2>
            <p className="text-xs text-slate-400">Trade Evrenine Katıl</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-white/5 rounded-xl mb-6">
            <button 
                onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                Giriş Yap
            </button>
            <button 
                onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isLogin ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                Kayıt Ol
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs text-center font-medium">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs text-center font-medium">
                    {successMsg}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Email</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="ornek@email.com"
                    required
                />
            </div>
            
            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Şifre</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className={`
                    w-full py-3.5 mt-2 rounded-xl font-bold text-sm text-white shadow-lg transition-all
                    ${isLogin 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/20'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            >
                {isLoading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
            </button>
        </form>

      </div>
    </div>
  );
};