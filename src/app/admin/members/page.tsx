'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Download, MoreVertical, Eye, Trash2, Users, UserCheck, UserX, Calendar, ChevronLeft, ChevronRight, X, Edit } from 'lucide-react';
import Swal from 'sweetalert2';

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  profile_photo: string | null;
  organization: {
    name: string;
    subscriptions: Array<{
      status: string;
      subscription_plan: {
        name: string;
      };
    }>;
  };
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  new_this_month: number;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function MembersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    pending: 0,
    new_this_month: 0,
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
  
  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
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
    fetchMembers(1);
  }, [router]);

  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchMembers(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search]);

  useEffect(() => {
    if (user) {
      fetchMembers(1);
    }
  }, [filters.status]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/members/stats`, {
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

  const fetchMembers = async (page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/members?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setMembers(data.members.data);
        setPagination({
          current_page: data.members.current_page,
          last_page: data.members.last_page,
          per_page: data.members.per_page,
          total: data.members.total,
          from: data.members.from,
          to: data.members.to,
        });
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/members/export`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `membres_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      Swal.fire({
        icon: 'success',
        title: t('exportSuccess'),
        confirmButtonColor: '#3776c5',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
    setOpenDropdown(null);
    setHoveredRow(null);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setEditForm({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone
    });
    setShowEditModal(true);
    setOpenDropdown(null);
    setHoveredRow(null);
  };

  const handleUpdateMember = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/members/${selectedMember?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Modifié avec succès',
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
        setShowEditModal(false);
        fetchMembers(pagination.current_page);
        fetchStats();
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
      title: t('deleteQuestion'),
      text: `${t('delete')} ${name} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('deleteConfirm'),
      cancelButtonText: t('cancel'),
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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/members/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        Swal.fire({
          icon: 'success',
          title: t('deleted'),
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchMembers(pagination.current_page);
        fetchStats();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('error'),
          confirmButtonColor: '#ef4444',
        });
      }
    }
    setOpenDropdown(null);
    setHoveredRow(null);
  };

  const handleToggleStatus = async (id: number, currentStatus: string, name: string) => {
    const isActive = currentStatus === 'active';
    
    const result = await Swal.fire({
      title: isActive ? 'Désactiver le membre ?' : 'Activer le membre ?',
      text: `${name} sera ${isActive ? 'désactivé' : 'activé'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isActive ? '#f59e0b' : '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: isActive ? 'Désactiver' : 'Activer',
      cancelButtonText: 'Annuler',
      didOpen: () => {
        const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;
        
        if (confirmBtn) {
          confirmBtn.style.color = '#ffffff';
          confirmBtn.style.backgroundColor = isActive ? '#f59e0b' : '#10b981';
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/members/${id}/toggle-status`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const data = await res.json();
        
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Statut modifié !',
            text: `Le membre est maintenant ${data.status === 'active' ? 'actif' : 'inactif'}`,
            confirmButtonColor: '#3776c5',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchMembers(pagination.current_page);
          fetchStats();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: data.message || 'Impossible de modifier le statut',
            confirmButtonColor: '#ef4444',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de modifier le statut',
          confirmButtonColor: '#ef4444',
        });
      }
    }
    setOpenDropdown(null);
    setHoveredRow(null);
  };

  const handleSendResetPassword = async (id: number, email: string, name: string) => {
  const result = await Swal.fire({
    title: 'Réinitialiser le mot de passe ?',
    text: `Un email sera envoyé à ${email}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3776c5',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Envoyer',
    cancelButtonText: 'Annuler',
  });

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/members/${id}/send-reset-password`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Email envoyé !',
          text: `${name} va recevoir un email pour réinitialiser son mot de passe`,
          confirmButtonColor: '#3776c5',
          timer: 3000,
        });
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
        text: 'Impossible d\'envoyer l\'email',
        confirmButtonColor: '#ef4444',
      });
    }
  }
  setOpenDropdown(null);
  setHoveredRow(null);
};

  const getStatusBadge = (status: string) => {
    const config = {
      active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: t('activeStatus') },
      pending: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: t('pendingStatus') },
      expired: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: t('expiredStatus') },
      canceled: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: t('canceledStatus') },
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
            <h1 className="text-xl font-bold text-slate-900">{t('membersManagement')}</h1>
            <p className="text-xs text-slate-600 mt-0.5">{t('manageViewMembers')}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: t('totalMembersLabel'), value: stats.total, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
              { label: t('activeMembersLabel'), value: stats.active, icon: UserCheck, gradient: 'from-emerald-500 to-teal-500' },
              { label: t('pendingLabel'), value: stats.pending, icon: UserX, gradient: 'from-rose-500 to-pink-500' },
              { label: t('newThisMonth'), value: stats.new_this_month, icon: Calendar, gradient: 'from-violet-500 to-purple-500' },
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
                {t('exportExcel')}
              </button>
              
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('search')}
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
                <option value="">{t('mostRecent')}</option>
                <option value="active">{t('active')}</option>
                <option value="pending">{t('pendingStatus')}</option>
                <option value="expired">{t('expired')}</option>
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
                    {t('date')}
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    {t('member')}
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    {t('email')}
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    {t('pack')}
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    {t('status')}
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    {t('action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-600">{t('loading')}</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-600">{t('noMembersFound')}</td></tr>
                ) : (
                  members.map((member) => {
                    const subscription = member.organization?.subscriptions?.[0];
                    const isHovered = hoveredRow === member.id;
                    const isOpen = openDropdown === member.id;
                    
                    return (
                      <tr 
                        key={member.id} 
                        className="hover:bg-slate-50 transition-colors"
                        onMouseEnter={() => setHoveredRow(member.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="px-3 py-2.5">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] text-slate-600">
                            {new Date(member.created_at).toLocaleDateString('fr-FR', { 
                              day: '2-digit',
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {member.profile_photo ? (
                              <img 
                                src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${member.profile_photo}`}
                                alt={member.first_name}
                                className="w-7 h-7 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3776c5] to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                                {member.first_name?.[0]}{member.last_name?.[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900 text-xs leading-tight">
                                {member.first_name} {member.last_name}
                              </p>
                              <p className="text-[10px] text-slate-500 leading-tight">
                                {member.organization?.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] text-slate-600">{member.email}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-medium text-slate-900">
                            {subscription?.subscription_plan?.name || t('none')}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          {subscription ? getStatusBadge(subscription.status) : (
                            <span className="text-[10px] text-slate-400">inactive</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(isOpen ? null : member.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={14} className="text-slate-600" />
                            </button>
                            
                            {( isOpen) && (
                              <div 
                                className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden"
                                onMouseEnter={() => setHoveredRow(member.id)}
                                onMouseLeave={() => {
                                  if (!isOpen) setHoveredRow(null);
                                }}
                              >
                                <button
                                  onClick={() => handleViewDetails(member)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-xs transition-colors border-b border-slate-100"
                                >
                                  Voir détails
                                </button>
                                <button
                                  onClick={() => handleSendResetPassword(member.id, member.email, `${member.first_name} ${member.last_name}`)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-purple-50 text-xs transition-colors border-b border-slate-100"
                                >
                                  Réinitialiser MDP
                                </button>
                                <button
                                  onClick={() => handleEdit(member)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-50 text-xs transition-colors border-b border-slate-100"
                                >
                                  Modifier
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(member.id, subscription?.status || 'inactive', `${member.first_name} ${member.last_name}`)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors border-b border-slate-100 ${
                                      subscription?.status === 'active' 
                                        ? 'hover:bg-orange-50 text-orange-700' 
                                        : 'hover:bg-green-50 text-green-700'
                                    }`}
                                  >
                                    {subscription?.status === 'active' ? 'Désactiver' : 'Activer'}
                                </button>
                                <button
                                  onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-xs transition-colors"
                                >
                                  {t('delete')}
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
            {!loading && members.length > 0 && (
              <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  {t('showing')} <span className="font-semibold">{pagination.from}</span> {t('to')}{' '}
                  <span className="font-semibold">{pagination.to}</span> {t('on')}{' '}
                  <span className="font-semibold">{pagination.total}</span> {t('membersLower')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchMembers(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                    {t('previous')}
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
                            onClick={() => fetchMembers(page)}
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
                    onClick={() => fetchMembers(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {t('next')}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Détails */}
      {showDetailsModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3776c5] to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Eye size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Détails du membre</h2>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Photo & Info */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                {selectedMember.profile_photo ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${selectedMember.profile_photo}`}
                    alt={selectedMember.first_name}
                    className="w-24 h-24 rounded-2xl object-cover shadow-lg ring-4 ring-slate-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#3776c5] to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-slate-100">
                    {selectedMember.first_name?.[0]}{selectedMember.last_name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    {selectedMember.first_name} {selectedMember.last_name}
                  </h3>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {selectedMember.organization?.name}
                  </p>
                </div>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <p className="text-xs font-semibold text-blue-900">Email</p>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{selectedMember.email}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <p className="text-xs font-semibold text-green-900">Téléphone</p>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{selectedMember.phone || 'Non renseigné'}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <p className="text-xs font-semibold text-purple-900">Date d'inscription</p>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {new Date(selectedMember.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <p className="text-xs font-semibold text-orange-900">Organisation</p>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{selectedMember.organization?.name}</p>
                </div>
              </div>

              {/* Abonnement */}
              {selectedMember.organization?.subscriptions?.[0] && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#3776c5]">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    Abonnement
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Plan</p>
                      <p className="font-bold text-slate-900 text-base">
                        {selectedMember.organization.subscriptions[0].subscription_plan?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Statut</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedMember.organization.subscriptions[0].status)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(selectedMember);
                }}
                className="px-5 py-2.5 text-sm font-semibold bg-[#3776c5] text-white hover:bg-[#2d5fa3] rounded-lg transition-colors shadow-lg shadow-blue-500/30"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Edit size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Modifier le membre</h2>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Prénom"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Nom"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="+212 6XX XX XX XX"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateMember}
                className="px-5 py-2.5 text-sm font-semibold bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors shadow-lg shadow-green-500/30"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}