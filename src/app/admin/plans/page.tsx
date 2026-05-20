'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Search, Download, MoreVertical, Eye, Edit2, Trash2, Plus, Package, CheckCircle, XCircle, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface Plan {
  id: number;
  name: string;
  description: string;
  price_chf: string;
  price_eur: string;
  duration_months: number;
  is_active: boolean;
  subscriptions_count?: number;
  created_at: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  subscriptions_count: number;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function PlansPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    subscriptions_count: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [filters, setFilters] = useState({ search: '', is_active: '' });
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_chf: '',
    price_eur: '',
    duration_months: '12',
    is_active: true,
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
    fetchPlans(1);
  }, [router]);

  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchPlans(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search]);

  useEffect(() => {
    if (user) {
      fetchPlans(1);
    }
  }, [filters.is_active]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/plans/stats`, {
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

  const fetchPlans = async (page: number = 1) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== '') params.append('is_active', filters.is_active);
    
    console.log('🔍 Fetching plans...', `${process.env.NEXT_PUBLIC_API_URL}/admin/plans?${params}`);
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/plans?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await res.json();
    console.log('📦 Plans data:', data);
    
    if (data.success) {
      console.log('✅ Plans loaded:', data.plans.data);
      setPlans(data.plans.data);
      setPagination({
        current_page: data.plans.current_page,
        last_page: data.plans.last_page,
        per_page: data.plans.per_page,
        total: data.plans.total,
        from: data.plans.from,
        to: data.plans.to,
      });
    } else {
      console.log('❌ API error:', data);
    }
  } catch (error) {
    console.error('💥 Error fetching plans:', error);
  } finally {
    setLoading(false);
  }
};

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/plans/export`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `packs_${new Date().toISOString().split('T')[0]}.csv`;
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

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price_chf: '',
      price_eur: '',
      duration_months: '12',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price_chf: plan.price_chf,
      price_eur: plan.price_eur,
      duration_months: plan.duration_months.toString(),
      is_active: plan.is_active,
    });
    setShowModal(true);
    setOpenDropdown(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingPlan 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/plans/${editingPlan.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/plans`;
      
      const res = await fetch(url, {
        method: editingPlan ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: editingPlan ? 'Pack mis à jour !' : 'Pack créé !',
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
        setShowModal(false);
        fetchPlans(pagination.current_page);
        fetchStats();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: data.message,
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Supprimer ce pack ?',
      text: `Voulez-vous vraiment supprimer "${name}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/plans/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Supprimé !',
            confirmButtonColor: '#3776c5',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchPlans(pagination.current_page);
          fetchStats();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: data.message,
            confirmButtonColor: '#ef4444',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          confirmButtonColor: '#ef4444',
        });
      }
    }
    setOpenDropdown(null);
  };

  const handleToggleStatus = async (id: number, name: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/plans/${id}/toggle-status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: data.message,
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchPlans(pagination.current_page);
        fetchStats();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        confirmButtonColor: '#ef4444',
      });
    }
    setOpenDropdown(null);
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
            <h1 className="text-xl font-bold text-slate-900">Gestion des Packs d'Adhésion</h1>
            <p className="text-xs text-slate-600 mt-0.5">Créez et gérez vos packs d'adhésion</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Packs', value: stats.total, icon: Package, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Actifs', value: stats.active, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
              { label: 'Inactifs', value: stats.inactive, icon: XCircle, gradient: 'from-slate-500 to-gray-500' },
              { label: 'Abonnements', value: stats.subscriptions_count, icon: Users, gradient: 'from-violet-500 to-purple-500' },
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
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-[#3776c5] text-white rounded-lg font-semibold hover:bg-[#2d5fa3] transition-all text-xs"
              >
                <Plus size={14} />
                Nouveau Pack
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all text-xs"
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
                value={filters.is_active}
                onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
              >
                <option value="">Tous les statuts</option>
                <option value="1">Actifs</option>
                <option value="0">Inactifs</option>
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
                    Nom du Pack
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Description
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Prix CHF
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Prix EUR
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Durée
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Abonnés
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Statut
                  </th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={9} className="px-3 py-6 text-center text-xs text-slate-600">Chargement...</td></tr>
                ) : plans.length === 0 ? (
                  <tr><td colSpan={9} className="px-3 py-6 text-center text-xs text-slate-600">Aucun pack trouvé</td></tr>
                ) : (
                  plans.map((plan) => {
                    return (
                      <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold text-[#3776c5]">
                            {plan.name}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-slate-600 line-clamp-2">
                            {plan.description || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold text-slate-900">
                            CHF {parseFloat(plan.price_chf).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold text-slate-900">
                            EUR {parseFloat(plan.price_eur).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-slate-600">
                            {plan.duration_months} mois
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-semibold text-slate-900">
                            {plan.subscriptions_count || 0}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${
                            plan.is_active 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {plan.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === plan.id ? null : plan.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={14} className="text-slate-600" />
                            </button>
                            {openDropdown === plan.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                                <button
                                  onClick={() => openEditModal(plan)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 text-xs"
                                >
                                  <Edit2 size={12} className="text-[#3776c5]" />
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(plan.id, plan.name)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-xs border-t border-slate-100 ${
                                    plan.is_active ? 'text-orange-600' : 'text-green-600'
                                  }`}
                                >
                                  {plan.is_active ? <XCircle size={12} /> : <CheckCircle size={12} />}
                                  {plan.is_active ? 'Désactiver' : 'Activer'}
                                </button>
                                <button
                                  onClick={() => handleDelete(plan.id, plan.name)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 text-xs border-t border-slate-100"
                                >
                                  <Trash2 size={12} />
                                  Supprimer
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
            {!loading && plans.length > 0 && (
              <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Affichage de <span className="font-semibold">{pagination.from}</span> à{' '}
                  <span className="font-semibold">{pagination.to}</span> sur{' '}
                  <span className="font-semibold">{pagination.total}</span> packs
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchPlans(pagination.current_page - 1)}
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
                            onClick={() => fetchPlans(page)}
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
                    onClick={() => fetchPlans(pagination.current_page + 1)}
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

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingPlan ? 'Modifier le Pack' : 'Nouveau Pack'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nom du Pack *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Prix CHF *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_chf}
                    onChange={(e) => setFormData({ ...formData, price_chf: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Prix EUR *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_eur}
                    onChange={(e) => setFormData({ ...formData, price_eur: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Durée (mois) *
                </label>
                <input
                  type="number"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label className="text-sm font-semibold text-slate-700">
                  Pack actif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#3776c5] text-white rounded-lg font-semibold hover:bg-[#2d5fa3] transition-all text-sm"
                >
                  {editingPlan ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}