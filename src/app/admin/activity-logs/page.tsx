'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Search, Download, Activity, TrendingUp, Calendar, User, Filter, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

interface ActivityLog {
  id: number;
  user: {
    first_name: string;
    last_name: string;
  } | null;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
}

interface Stats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function ActivityLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/member/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchStats();
    fetchLogs(1);
  }, [router]);

  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchLogs(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search]);

  useEffect(() => {
    if (user) {
      fetchLogs(1);
    }
  }, [filters.action, filters.date_from, filters.date_to]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activity-logs/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.action) params.append('action', filters.action);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activity-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setLogs(data.logs.data);
        setPagination({
          current_page: data.logs.current_page,
          last_page: data.logs.last_page,
          per_page: data.logs.per_page,
          total: data.logs.total,
          from: data.logs.from,
          to: data.logs.to,
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.action) params.append('action', filters.action);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activity-logs/export?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs_activite_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      Swal.fire({
        icon: 'success',
        title: 'Export réussi !',
        confirmButtonColor: '#3776c5',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleCleanup = async () => {
    const result = await Swal.fire({
      title: 'Nettoyer les logs ?',
      html: 'Supprimer les logs de plus de <strong>90 jours</strong> ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      didOpen: () => {
        const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;
        if (confirmBtn) {
          confirmBtn.style.color = '#ffffff';
          confirmBtn.style.backgroundColor = '#ef4444';
        }
        if (cancelBtn) {
          cancelBtn.style.color = '#ffffff';
          cancelBtn.style.backgroundColor = '#64748b';
        }
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activity-logs/cleanup`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Logs nettoyés !',
            text: data.message,
            confirmButtonColor: '#3776c5',
            didOpen: () => {
              const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
              if (confirmBtn) {
                confirmBtn.style.color = '#ffffff';
                confirmBtn.style.backgroundColor = '#3776c5';
              }
            }
          });
          fetchLogs(1);
          fetchStats();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  };

  const getActionBadge = (action: string) => {
    const config: any = {
      created: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Création' },
      updated: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Modification' },
      deleted: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Suppression' },
      login: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Connexion' },
      logout: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Déconnexion' },
      export: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Export' },
    };
    
    const c = config[action] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: action };
    return (
      <span className={`${c.bg} ${c.text} ${c.border} border px-3 py-1 rounded-full text-[10px] font-semibold`}>
        {c.label}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <main className="p-4">
          {/* Page Title */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">Logs d'Activité</h1>
            <p className="text-xs text-slate-600 mt-0.5">Historique des actions effectuées</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total', value: stats.total, icon: Activity, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Aujourd\'hui', value: stats.today, icon: Calendar, gradient: 'from-emerald-500 to-teal-500' },
              { label: 'Cette semaine', value: stats.this_week, icon: TrendingUp, gradient: 'from-violet-500 to-purple-500' },
              { label: 'Ce mois', value: stats.this_month, icon: User, gradient: 'from-orange-500 to-red-500' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white rounded-lg p-3 border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</h3>
                      <p className="text-[10px] font-medium text-slate-600 mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Bar */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all text-xs"
              >
                <Download size={14} />
                Exporter CSV
              </button>

              <button
                onClick={handleCleanup}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all text-xs"
              >
                <Trash2 size={14} />
                Nettoyer (90j+)
              </button>
              
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3776c5]/30 focus:border-[#3776c5]"
                />
              </div>

              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              >
                <option value="">Toutes actions</option>
                <option value="created">Création</option>
                <option value="updated">Modification</option>
                <option value="deleted">Suppression</option>
                <option value="login">Connexion</option>
                <option value="logout">Déconnexion</option>
                <option value="export">Export</option>
              </select>

              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              />

              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Date & Heure
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Utilisateur
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Action
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Description
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-600">Chargement...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-600">Aucun log trouvé</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="text-xs font-semibold text-slate-900">
                          {new Date(log.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-semibold text-slate-900">
                          {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'Système'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-slate-600">{log.description}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-slate-500 font-mono">{log.ip_address}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && logs.length > 0 && (
              <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Affichage de <span className="font-semibold">{pagination.from}</span> à{' '}
                  <span className="font-semibold">{pagination.to}</span> sur{' '}
                  <span className="font-semibold">{pagination.total}</span> logs
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                    Précédent
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.last_page)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.last_page ||
                        (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => fetchLogs(page)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                              page === pagination.current_page
                                ? 'bg-[#3776c5] text-white font-semibold'
                                : 'border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === pagination.current_page - 2 ||
                        page === pagination.current_page + 2
                      ) {
                        return <span key={page} className="px-2 text-slate-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => fetchLogs(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Suivant
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}