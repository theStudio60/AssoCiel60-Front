'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Search, Download, MoreVertical, RefreshCw, XCircle, Package, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

interface Subscription {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
  auto_renew: boolean;
  created_at: string;
  organization: {
    name: string;
  };
  subscription_plan: {
    name: string;
    price_chf: string;
  };
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  expired: number;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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
    fetchSubscriptions(1);
  }, [router]);

  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchSubscriptions(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search]);

  useEffect(() => {
    if (user) {
      fetchSubscriptions(1);
    }
  }, [filters.status]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/stats`, {
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

  const fetchSubscriptions = async (page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions.data);
        setPagination({
          current_page: data.subscriptions.current_page,
          last_page: data.subscriptions.last_page,
          per_page: data.subscriptions.per_page,
          total: data.subscriptions.total,
          from: data.subscriptions.from,
          to: data.subscriptions.to,
        });
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/export`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abonnements_${new Date().toISOString().split('T')[0]}.csv`;
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

  const handleRenew = async (id: number, orgName: string) => {
    const result = await Swal.fire({
      title: 'Renouveler ?',
      text: `Renouveler l'abonnement de ${orgName} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3776c5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Renouveler',
      cancelButtonText: 'Annuler',
      didOpen: () => {
        const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;
        if (confirmBtn) {
          confirmBtn.style.color = '#ffffff';
          confirmBtn.style.backgroundColor = '#3776c5';
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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${id}/renew`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        Swal.fire({
          icon: 'success',
          title: 'Renouvelé !',
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchSubscriptions(pagination.current_page);
        fetchStats();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          confirmButtonColor: '#ef4444',
        });
      }
    }
    setOpenDropdown(null);
    setHoveredRow(null);
  };

  const handleCancel = async (id: number, orgName: string) => {
    const result = await Swal.fire({
      title: 'Annuler ?',
      text: `Annuler l'abonnement de ${orgName} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Annuler l\'abonnement',
      cancelButtonText: 'Retour',
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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${id}/cancel`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        Swal.fire({
          icon: 'success',
          title: 'Annulé !',
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchSubscriptions(pagination.current_page);
        fetchStats();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          confirmButtonColor: '#ef4444',
        });
      }
    }
    setOpenDropdown(null);
    setHoveredRow(null);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Actif' },
      pending: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'En attente' },
      expired: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Expiré' },
      canceled: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Annulé' },
    };
    
    const c = config[status as keyof typeof config] || config.pending;
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
            <h1 className="text-xl font-bold text-slate-900">Gestion des Abonnements</h1>
            <p className="text-xs text-slate-600 mt-0.5">Gérez et visualisez tous les abonnements</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Abonnements', value: stats.total, icon: Package, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Actifs', value: stats.active, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
              { label: 'En Attente', value: stats.pending, icon: Clock, gradient: 'from-rose-500 to-pink-500' },
              { label: 'Expirés', value: stats.expired, icon: AlertCircle, gradient: 'from-orange-500 to-red-500' },
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
                className="flex items-center gap-2 px-4 py-2 bg-[#3776c5] text-white rounded-lg font-semibold hover:bg-[#2d5fa3] transition-all text-xs"
              >
                <Download size={14} />
                Exporter Excel
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
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="pending">En attente</option>
                <option value="expired">Expirés</option>
                <option value="canceled">Annulés</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Organisation
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Plan
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Date début
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Date fin
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Statut
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Auto-renouvellement
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-xs text-slate-600">Chargement...</td></tr>
                ) : subscriptions.length === 0 ? (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-xs text-slate-600">Aucun abonnement trouvé</td></tr>
                ) : (
                  subscriptions.map((sub) => {
                    const isHovered = hoveredRow === sub.id;
                    const isOpen = openDropdown === sub.id;
                    
                    return (
                      <tr 
                        key={sub.id} 
                        className="hover:bg-slate-50 transition-colors"
                        onMouseEnter={() => setHoveredRow(sub.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="px-3 py-2.5">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-semibold text-slate-900">
                            {sub.organization?.name}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div>
                            <p className="text-xs font-medium text-slate-900">{sub.subscription_plan?.name}</p>
                            <p className="text-[10px] text-slate-500">CHF {sub.subscription_plan?.price_chf}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] text-slate-600">
                            {new Date(sub.start_date).toLocaleDateString('fr-FR', { 
                              day: '2-digit',
                              month: 'short', 
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] text-slate-600">
                            {new Date(sub.end_date).toLocaleDateString('fr-FR', { 
                              day: '2-digit',
                              month: 'short', 
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[10px] font-semibold ${sub.auto_renew ? 'text-green-600' : 'text-slate-400'}`}>
                            {sub.auto_renew ? 'Oui' : 'Non'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(isOpen ? null : sub.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={14} className="text-slate-600" />
                            </button>
                            
                            {(isHovered || isOpen) && (
                              <div 
                                className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden"
                                onMouseEnter={() => setHoveredRow(sub.id)}
                                onMouseLeave={() => {
                                  if (!isOpen) setHoveredRow(null);
                                }}
                              >
                                <button
                                  onClick={() => handleRenew(sub.id, sub.organization?.name)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-50 text-green-600 text-xs border-b border-slate-100 transition-colors"
                                >
                                  <RefreshCw size={14} />
                                  Renouveler
                                </button>
                                <button
                                  onClick={() => handleCancel(sub.id, sub.organization?.name)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 text-xs transition-colors"
                                >
                                  <XCircle size={14} />
                                  Annuler
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && subscriptions.length > 0 && (
              <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Affichage de <span className="font-semibold">{pagination.from}</span> à{' '}
                  <span className="font-semibold">{pagination.to}</span> sur{' '}
                  <span className="font-semibold">{pagination.total}</span> abonnements
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchSubscriptions(pagination.current_page - 1)}
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
                            onClick={() => fetchSubscriptions(page)}
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
                    onClick={() => fetchSubscriptions(pagination.current_page + 1)}
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