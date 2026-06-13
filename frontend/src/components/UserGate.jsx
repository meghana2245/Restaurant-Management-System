import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export const UserGate = ({ onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); 
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }
    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await api.loginUser(name, password);
      } else {
        response = await api.registerUser(name, password, role);
      }

      if (response.success) {
        showToast(
          isLogin ? `Welcome back, ${response.data.name}!` : 'Account created successfully! Logging you in.',
          'success'
        );
        onLoginSuccess(response.data);
      } else {
        showToast(response.message || 'Authentication failed', 'error');
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Authentication failed. Please check your credentials.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] px-4 select-none pt-12">
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/60 font-sans">
        
        
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 overflow-visible z-20 flex justify-center">
          <svg className="w-full h-full text-white drop-shadow-md filter" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 30 24 Q 27 18 30 13 Q 33 8 30 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <path d="M 35 26 Q 32 20 35 15 Q 38 10 35 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <path d="M 44 26 L 44 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 44 14 C 41.5 14 41 18 44 26 C 47 18 46.5 14 44 14 Z" fill="currentColor" />
            <path d="M 52 26 L 52 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 52 14 C 52 14 54 14 54 21 L 52 26 Z" fill="currentColor" />
            <path d="M 60 21 L 60 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 58 14 V 21 H 62 V 14 M 60 14 V 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 22 62 A 28 28 0 0 1 78 62 Z" fill="currentColor" />
            <circle cx="50" cy="31.5" r="3.5" fill="currentColor" />
            <text x="50" y="55" fill="#7C3AED" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="Poppins, sans-serif">P</text>
            <rect x="15" y="64" width="70" height="4" rx="2" fill="currentColor" />
            <path d="M 36 70 Q 46 74 53 80 Q 59 72 55 68 L 57 67 Q 63 74 59 86 L 55 88 Q 43 78 33 73 Z" fill="currentColor" />
          </svg>
        </div>

        
        <div className="bg-gradient-to-br from-platea-primary via-purple-700 to-indigo-950 px-8 pt-16 pb-8 text-center rounded-t-3xl border-b border-purple-900/10">
          <h1 className="text-3xl font-black text-white tracking-wider font-heading uppercase mt-2">
            Platea
          </h1>
          <p className="text-[10px] text-purple-200 font-bold uppercase tracking-widest mt-1.5 opacity-90 font-sans">
            Restaurant Management & Booking Portal
          </p>
        </div>

        
        <form onSubmit={handleSubmit} className="bg-[#FDFBF7] p-8 rounded-b-3xl space-y-5">
          
          <div className="space-y-1.5">
            <label htmlFor="login-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Name
            </label>
            <input
              id="login-name"
              type="text"
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/30 focus:border-platea-primary text-slate-700 bg-white text-sm font-semibold transition-all duration-200"
              required
            />
          </div>

          
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/30 focus:border-platea-primary text-slate-700 bg-white text-sm font-semibold transition-all duration-200"
              required
            />
          </div>

          
          {!isLogin && (
            <div className="space-y-2 animate-fade-in">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Access Role
              </span>
              <div className="grid grid-cols-3 gap-1 bg-slate-200/50 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    role === 'user'
                      ? 'bg-white text-platea-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    role === 'staff'
                      ? 'bg-white text-platea-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    role === 'admin'
                      ? 'bg-white text-platea-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-platea-primary text-white font-extrabold py-3.5 px-4 rounded-2xl shadow hover:bg-opacity-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 disabled:opacity-50 flex items-center justify-center text-sm uppercase tracking-wider mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : isLogin ? (
              'Enter Platea'
            ) : (
              'Create Account'
            )}
          </button>

          
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setRole('user');
              }}
              className="text-xs font-semibold text-slate-400 hover:text-platea-primary transition-colors underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UserGate;
