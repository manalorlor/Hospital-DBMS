import React from 'react';
import { User, UserRole, AppNotification } from '../types';
import { LogOut, Shield, LucideIcon, Menu } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  title: string;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  menuItems: MenuItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  title, 
  notifications, 
  onMarkNotificationAsRead,
  menuItems,
  activeTab,
  onTabChange
}) => {
  const userNotifications = notifications.filter(n => n.userId === user.id);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-200">
      {/* Sidebar */}
      <aside className="w-full md:w-72 flex-shrink-0 flex flex-col h-screen sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 shadow-2xl">
        <div className="p-6 flex flex-col items-center text-center flex-shrink-0 border-b border-white/5 bg-gradient-to-b from-slate-800/20 to-transparent">
          <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
              <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Ghana.svg" 
                  alt="Ghana Flag" 
                  className="w-14 h-auto mb-4 shadow-lg border border-white/10 rounded-sm relative z-10"
              />
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide">
            AGH <span className="text-cyan-400">OS</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">System v2.4</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-8 px-2 pt-2">
            <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5 backdrop-blur-sm shadow-inner">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-white/10">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-slate-100 truncate" title={user.name}>{user.name}</p>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full px-4 py-3.5 rounded-xl flex items-center gap-3.5 transition-all duration-300 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/20 text-cyan-50 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>}
                  <Icon size={20} className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-cyan-400 scale-110' : 'group-hover:text-slate-200 group-hover:scale-110'}`} />
                  <span className="font-medium text-sm relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-950/30 flex-shrink-0">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all w-full px-4 py-3 rounded-xl text-sm font-medium group border border-transparent hover:border-red-900/30"
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px]"></div>
        </div>

        <header className="h-20 flex items-center px-6 md:px-10 justify-between z-10 flex-shrink-0 bg-transparent">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{title}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xs font-mono text-cyan-400/80 hidden md:flex items-center gap-2 bg-cyan-950/30 px-3 py-1.5 rounded-full border border-cyan-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                <NotificationBell 
                notifications={userNotifications} 
                onMarkAsRead={onMarkNotificationAsRead} 
                />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8 scroll-smooth z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};