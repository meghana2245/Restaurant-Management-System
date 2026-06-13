import React from 'react';

export const Sidebar = ({ currentUser, currentView, setCurrentView, onLogout }) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside className="w-64 bg-platea-surface text-platea-text flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200 shadow-sm select-none">
      
      <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
        <svg className="w-10 h-10 text-platea-primary flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 30 24 Q 27 18 30 13 Q 33 8 30 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M 35 26 Q 32 20 35 15 Q 38 10 35 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M 44 26 L 44 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 44 14 C 41.5 14 41 18 44 26 C 47 18 46.5 14 44 14 Z" fill="currentColor" />
          <path d="M 52 26 L 52 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 52 14 C 52 14 54 14 54 21 L 52 26 Z" fill="currentColor" />
          <path d="M 60 21 L 60 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 58 14 V 21 H 62 V 14 M 60 14 V 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 22 62 A 28 28 0 0 1 78 62 Z" fill="currentColor" />
          <circle cx="50" cy="31.5" r="3.5" fill="currentColor" />
          <text x="50" y="55" fill="white" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="Poppins, sans-serif">P</text>
          <rect x="15" y="64" width="70" height="4" rx="2" fill="currentColor" />
          <path d="M 36 70 Q 46 74 53 80 Q 59 72 55 68 L 57 67 Q 63 74 59 86 L 55 88 Q 43 78 33 73 Z" fill="currentColor" />
        </svg>
        <div>
          <h2 className="text-lg font-heading font-black text-slate-800 tracking-tight leading-none">Platea 🍽️</h2>
          <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase font-sans">Management</span>
        </div>
      </div>

      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {isAdmin && (
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentView === 'dashboard'
                ? 'bg-platea-primary text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </button>
        )}

        <button
          onClick={() => setCurrentView('floorplan')}
          className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentView === 'floorplan' || currentView === 'pos'
              ? 'bg-platea-primary text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          Floor Plan
        </button>

        
        {(isAdmin || currentUser?.role === 'staff') && (
          <button
            onClick={() => setCurrentView('orderqueue')}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentView === 'orderqueue'
                ? 'bg-platea-primary text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Order Queue
          </button>
        )}

        {isAdmin && (
          <>
            <button
              onClick={() => setCurrentView('menumanager')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentView === 'menumanager'
                  ? 'bg-platea-primary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Menu Manager
            </button>

            <button
              onClick={() => setCurrentView('inventory')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentView === 'inventory'
                  ? 'bg-platea-primary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventory
            </button>
          </>
        )}
      </nav>

      
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold border border-slate-300">
            {currentUser?.name?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-bold text-slate-800 truncate leading-tight">{currentUser?.name}</h4>
            <span className="text-[10px] text-platea-primary font-bold tracking-wider uppercase font-sans">{currentUser?.role}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-4 py-2 border border-slate-200 hover:border-platea-accent text-slate-500 hover:text-white hover:bg-platea-accent/10 rounded-xl text-xs font-bold transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
