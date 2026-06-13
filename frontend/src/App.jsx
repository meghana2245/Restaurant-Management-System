import React, { useState, useEffect } from 'react'
import { ToastProvider } from './components/Toast'
import { UserGate } from './components/UserGate'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { FloorPlan } from './components/FloorPlan'
import { POSView } from './components/POSView'
import { MenuManager } from './components/MenuManager'
import { Inventory } from './components/Inventory'
import { CustomerMenu } from './components/CustomerMenu'
import { OrderQueue } from './components/OrderQueue'

function AppContent() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('platea_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('floorplan');
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('platea_user', JSON.stringify(currentUser));
      
      if (currentUser.role === 'admin') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('floorplan');
      }
    } else {
      localStorage.removeItem('platea_user');
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedTable(null);
  };

  
  if (!currentUser) {
    return <UserGate onLoginSuccess={handleLoginSuccess} />;
  }

  
  if (currentUser.role === 'user') {
    return (
      <CustomerMenu
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  
  return (
    <div className="min-h-screen flex bg-platea-bg font-sans text-slate-800">
      
      <Sidebar
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
      />

      
      <main className="flex-1 ml-64 p-8 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && currentUser.role === 'admin' && (
            <Dashboard />
          )}
          
          {(currentView === 'floorplan' || (currentView === 'dashboard' && currentUser.role === 'staff')) && (
            <FloorPlan
              currentUser={currentUser}
              onSelectTable={setSelectedTable}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'pos' && currentUser.role === 'admin' && (
            <POSView
              selectedTable={selectedTable}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'orderqueue' && (
            <OrderQueue />
          )}

          {currentView === 'menumanager' && currentUser.role === 'admin' && (
            <MenuManager />
          )}

          {currentView === 'inventory' && currentUser.role === 'admin' && (
            <Inventory />
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App

