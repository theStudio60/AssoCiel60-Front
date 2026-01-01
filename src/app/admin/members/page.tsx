'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Download, MoreVertical, Eye, Trash2, Users, UserCheck, UserX, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

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
                    
                    return (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
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
                            <span className="text-[10px] text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={14} className="text-slate-600" />
                            </button>
                            {openDropdown === member.id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                                <button
                                  onClick={() => {
                                    router.push(`/admin/members/${member.id}`);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 text-xs"
                                >
                                  {t('viewDetails')}
                                </button>
                                <button
                                  onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 text-xs border-t border-slate-100"
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
    </div>
  );
}