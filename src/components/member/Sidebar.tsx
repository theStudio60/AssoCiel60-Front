'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  User,
  CreditCard, 
  FileText, 
  Settings,
  LogOut,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function MemberSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const mainMenu = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/member/dashboard' },
  ];

  const menuItems = [
    { icon: User, label: 'Mon Profil', path: '/member/profile' },
    { icon: CreditCard, label: 'Mon Abonnement', path: '/member/subscription' },
    { icon: FileText, label: 'Mes Factures', path: '/member/invoices' },
  ];

  const others = [
    { icon: Settings, label: 'Mes Paramètres', path: '/member/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 min-h-screen flex flex-col transition-all duration-300`}>
      {/* Logo + Toggle */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Image src="/logo.png" alt="Alprail" width={120} height={35} className="object-contain" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Main Menu */}
      {!collapsed && (
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
            ESPACE MEMBRE
          </p>
        </div>
      )}

      <nav className="px-3 space-y-0.5">
        {mainMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#3776c5] text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              title={collapsed ? item.label : ''}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={1.5} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="my-3 px-6">
        <div className="h-px bg-slate-200"></div>
      </div>

      {/* Menu Items */}
      <nav className="px-3 space-y-0.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              title={collapsed ? item.label : ''}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={1.5} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </div>
              {!collapsed && <ChevronRight size={14} className="text-slate-400" />}
            </button>
          );
        })}
      </nav>

      {/* Others */}
      {!collapsed && (
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
            AUTRES
          </p>
        </div>
      )}

      <nav className="px-3 space-y-0.5 mb-3">
        {others.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              title={collapsed ? item.label : ''}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={1.5} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </div>
              {!collapsed && <ChevronRight size={14} className="text-slate-400" />}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all`}
          title={collapsed ? 'Déconnexion' : ''}
        >
          <LogOut size={18} strokeWidth={1.5} />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}