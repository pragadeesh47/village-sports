
import React, { useState, useEffect } from 'react';
import { db } from './db';
import type { AppSettings } from './types';
import { 
  Home, 
  Trophy, 
  Users, 
  History, 
  Settings as SettingsIcon,
  PlayCircle} from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard';
import GamesList from './pages/GamesList';
import ParticipantsList from './pages/ParticipantsList';
import Results from './pages/Results';
import HistoryLog from './pages/HistoryLog';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      const existingSettings = await db.settings.toArray();
      if (existingSettings.length === 0) {
        setIsSetupOpen(true);
      } else {
        setSettings(existingSettings[0]);
      }
    };
    initApp();
  }, []);

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSettings: AppSettings = {
      id: 1,
      villageName: formData.get('village') as string,
      gangName: formData.get('gang') as string,
      isSetupComplete: true
    };
    await db.settings.put(newSettings);
    setSettings(newSettings);
    setIsSetupOpen(false);
  };

  if (isSetupOpen) {
    return (
      <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! 🏡</h1>
          <p className="text-gray-600 mb-8 text-lg">Let's set up your festival details.</p>
          <form onSubmit={handleSetup} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Village Name</label>
              <input name="village" required className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-lg" placeholder="e.g. Green Valley" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Village Gang / Team Name</label>
              <input name="gang" required className="w-full px-5 py-4 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-lg" placeholder="e.g. The Warriors" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-xl font-bold text-xl shadow-lg hover:bg-indigo-700 active:scale-95">Start Festival 🚀</button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'games': return <GamesList />;
      case 'participants': return <ParticipantsList />;
      case 'results': return <Results />;
      case 'history': return <HistoryLog />;
      case 'settings': return <Settings onUpdate={(s) => setSettings(s)} />;
      default: return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-0 lg:pl-64">
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-indigo-800 text-white flex-col p-6 shadow-xl">
        <div className="mb-10">
          <h2 className="text-2xl font-bold truncate">{settings?.villageName}</h2>
          <p className="text-indigo-200 text-sm font-medium">{settings?.gangName}</p>
        </div>
        <div className="space-y-2 flex-1">
          <NavItem icon={<Home size={22}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<PlayCircle size={22}/>} label="Games" active={activeTab === 'games'} onClick={() => setActiveTab('games')} />
          <NavItem icon={<Users size={22}/>} label="Participants" active={activeTab === 'participants'} onClick={() => setActiveTab('participants')} />
          <NavItem icon={<Trophy size={22}/>} label="Game Results" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
          <NavItem icon={<History size={22}/>} label="Audit History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </div>
        <NavItem icon={<SettingsIcon size={22}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>

      <header className="lg:hidden bg-indigo-600 text-white p-5 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div>
          <h1 className="text-xl font-bold leading-tight">{settings?.villageName}</h1>
          <p className="text-indigo-100 text-xs">{settings?.gangName}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{renderContent()}</main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-2 z-50">
        <TabItem icon={<Home size={20}/>} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <TabItem icon={<PlayCircle size={20}/>} active={activeTab === 'games'} onClick={() => setActiveTab('games')} />
        <TabItem icon={<Users size={20}/>} active={activeTab === 'participants'} onClick={() => setActiveTab('participants')} />
        <TabItem icon={<Trophy size={20}/>} active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
        <TabItem icon={<History size={20}/>} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <TabItem icon={<SettingsIcon size={20}/>} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-semibold transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-100 hover:bg-indigo-700'}`}>
    {icon} <span>{label}</span>
  </button>
);

const TabItem: React.FC<{ icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg -translate-y-1' : 'text-gray-400'}`}>
    {icon}
  </button>
);

export default App;
