import React from 'react';
import { User, UserRole, AppNotification } from '../types';
import { LogOut, Shield, LucideIcon } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-emerald-800 text-white w-full md:w-64 flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-emerald-700 flex flex-col items-center text-center flex-shrink-0">
          <img 
              src="https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Ghana.svg" 
              alt="Ghana Flag" 
              className="w-20 h-auto mb-4 shadow-md border-2 border-emerald-700/50 rounded-sm"
          />
          <h1 className="text-xl font-bold">
            AGH DBMS
          </h1>
          <p className="text-xs text-emerald-200 mt-1">Amasaman Govt Hospital</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2">Logged in as</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate" title={user.name}>{user.name}</p>
                <p className="text-xs text-emerald-200 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    isActive 
                      ? 'bg-emerald-900/50 text-white shadow-sm border border-emerald-700/50' 
                      : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-emerald-700 flex-shrink-0">
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-emerald-200 hover:text-white transition-colors w-full px-2"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 justify-between shadow-sm z-10 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 hidden md:block">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <NotificationBell 
              notifications={userNotifications} 
              onMarkAsRead={onMarkNotificationAsRead} 
            />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};