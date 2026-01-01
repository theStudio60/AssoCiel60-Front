'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { Bell, MessageSquare, Settings, LogOut, Globe, User } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { lang, switchLang } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
      <div className="px-8 py-3 flex items-center justify-between">
        {/* Search - Left Side */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <button
            onClick={() => switchLang(lang === 'fr' ? 'en' : 'fr')}
            className="group relative px-3 py-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <Globe size={18} className="text-slate-600 group-hover:text-[#3776c5]" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-[#3776c5] text-white text-[10px] font-bold rounded-full">
              {lang.toUpperCase()}
            </span>
          </button>

          {/* Notifications */}
          {/* <button className="group relative p-2 hover:bg-slate-100 rounded-xl transition-all">
            <Bell size={18} className="text-slate-600 group-hover:text-[#3776c5]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button> */}

          <button className="group relative p-2 hover:bg-slate-100 rounded-xl transition-all">
            <MessageSquare size={18} className="text-slate-600 group-hover:text-[#3776c5]" />
            <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 bg-[#3776c5] text-white text-[10px] font-bold rounded-full">3</span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200 mx-2"></div>

          {/* User */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-[#3776c5] transition-colors">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-slate-500">{user?.job_title || 'Admin'}</p>
              </div>
              
              {/* Photo de profil */}
              {user?.profile_photo ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-slate-200 group-hover:ring-[#3776c5] transition-all">
                <img 
                  src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${user.profile_photo}`} 
                  alt={user.first_name}
                  className="w-9 h-9 rounded-xl object-cover"
                />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3776c5] to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#3776c5]/20 ring-2 ring-slate-200 group-hover:ring-[#3776c5] transition-all">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-50">
                {/* Profile Header */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 border-b border-slate-200/50">
                  <div className="flex items-center gap-3">
                    {user?.profile_photo ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white shadow-md">
                       <img 
                          src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${user.profile_photo}`} 
                          alt={user.first_name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3776c5] to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  {user?.bio && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{user.bio}</p>
                  )}
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/admin/profile');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-700 group"
                  >
                    <User size={18} className="group-hover:text-[#3776c5]" />
                    <span className="text-sm font-medium">Mon Profil</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/admin/settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-700 group"
                  >
                    <Settings size={18} className="group-hover:text-[#3776c5]" />
                    <span className="text-sm font-medium">Paramètres</span>
                  </button>

                  <div className="h-px bg-slate-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-all text-red-600 group"
                  >
                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}