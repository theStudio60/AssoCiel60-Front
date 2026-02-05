'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, MessageSquare, Settings, LogOut, Globe, User, Search, X, Users, FileText, CreditCard, Package } from 'lucide-react';

interface SearchResult {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  url: string;
  organization?: string;
  status?: string;
  amount?: string;
  price?: string;
}

interface SearchResults {
  members: SearchResult[];
  organizations: SearchResult[];
  subscriptions: SearchResult[];
  invoices: SearchResult[];
  plans: SearchResult[];
}

export default function Header() {
  const router = useRouter();
  const { lang, switchLang } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fonction de recherche avec debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/admin/search?q=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        );

        const data = await response.json();
        console.log('Search response:', data); // Pour debug

        if (data.success && data.results) {
          setSearchResults(data.results);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Erreur de recherche:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleResultClick = (url: string) => {
    router.push(url);
    setShowResults(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'member':
        return <Users size={16} className="text-blue-600" />;
      case 'organization':
        return <Users size={16} className="text-emerald-600" />;
      case 'subscription':
        return <CreditCard size={16} className="text-violet-600" />;
      case 'invoice':
        return <FileText size={16} className="text-orange-600" />;
      case 'plan':
        return <Package size={16} className="text-pink-600" />;
      default:
        return <Search size={16} className="text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
      case 'overdue':
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTotalResults = () => {
    if (!searchResults) return 0;
    return (
      (searchResults.members?.length || 0) +
      (searchResults.organizations?.length || 0) +
      (searchResults.subscriptions?.length || 0) +
      (searchResults.invoices?.length || 0) +
      (searchResults.plans?.length || 0)
    );
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
      <div className="px-8 py-3 flex items-center justify-between">
        {/* Search - Left Side */}
        <div className="flex-1 max-w-md w-full sm:w-auto relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher... (membres, factures, organisations...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults && setShowResults(true)}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}

            {isSearching && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#3776c5] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults && getTotalResults() > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 max-h-[500px] overflow-y-auto z-50">
              {/* Members */}
              {searchResults.members && searchResults.members.length > 0 && (
                <div className="p-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase px-3 py-2">Membres ({searchResults.members.length})</p>
                  {searchResults.members.map((result) => (
                    <button
                      key={`member-${result.id}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-all text-left cursor-pointer"                    >
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{result.title}</p>
                        <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                        {result.organization && (
                          <p className="text-xs text-slate-400">{result.organization}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Organizations */}
              {searchResults.organizations && searchResults.organizations.length > 0 && (
                <div className="p-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase px-3 py-2">Organisations ({searchResults.organizations.length})</p>
                  {searchResults.organizations.map((result) => (
                    <button
                      key={`org-${result.id}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-all text-left cursor-pointer"                    >
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{result.title}</p>
                        <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Subscriptions */}
              {searchResults.subscriptions && searchResults.subscriptions.length > 0 && (
                <div className="p-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase px-3 py-2">Abonnements ({searchResults.subscriptions.length})</p>
                  {searchResults.subscriptions.map((result) => (
                    <button
                      key={`sub-${result.id}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-all text-left cursor-pointer"                    >
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{result.title}</p>
                        <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                      </div>
                      {result.status && (
                        <span className={`px-2 py-1 rounded-full text-[9px] font-semibold ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Invoices */}
              {searchResults.invoices && searchResults.invoices.length > 0 && (
                <div className="p-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase px-3 py-2">Factures ({searchResults.invoices.length})</p>
                  {searchResults.invoices.map((result) => (
                    <button
                      key={`invoice-${result.id}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-all text-left cursor-pointer"                    >
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{result.title}</p>
                        <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                      </div>
                      <div className="text-right">
                        {result.amount && (
                          <p className="text-xs font-bold text-slate-900">{result.amount}</p>
                        )}
                        {result.status && (
                          <span className={`px-2 py-1 rounded-full text-[9px] font-semibold ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Plans */}
              {searchResults.plans && searchResults.plans.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-bold text-slate-500 uppercase px-3 py-2">Packs ({searchResults.plans.length})</p>
                  {searchResults.plans.map((result) => (
                    <button
                      key={`plan-${result.id}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-all text-left cursor-pointer"                    >
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{result.title}</p>
                        <p className="text-xs text-slate-500 truncate line-clamp-1">{result.subtitle}</p>
                      </div>
                      {result.price && (
                        <p className="text-xs font-bold text-slate-900">{result.price}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {showResults && searchResults && getTotalResults() === 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-8 text-center z-50">
              <Search size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Aucun résultat pour "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">

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
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-50">
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