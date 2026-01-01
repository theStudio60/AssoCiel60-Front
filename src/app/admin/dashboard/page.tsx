'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, CreditCard, DollarSign, Clock, FileText, TrendingUp, ArrowRight } from 'lucide-react';

interface Stats {
  total_members: number;
  active_subscriptions: number;
  total_revenue: number;
  pending_invoices: number;
  recent_members: any[];
  recent_activity: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    total_members: 0,
    active_subscriptions: 0,
    total_revenue: 0,
    pending_invoices: 0,
    recent_members: [],
    recent_activity: [],
  });
  const [loading, setLoading] = useState(true);

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
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const statsCards = [
    { 
      label: t('totalMembers'),
      value: stats.total_members.toString(), 
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    { 
      label: t('activeSubscriptions'),
      value: stats.active_subscriptions.toString(), 
      icon: CreditCard,
      gradient: 'from-emerald-500 to-teal-500',
    },
    { 
      label: t('totalRevenue'),
      value: `${parseFloat(stats.total_revenue.toString()).toFixed(2)} CHF`, 
      icon: DollarSign,
      gradient: 'from-violet-500 to-purple-500',
    },
    { 
      label: t('pendingPayments'),
      value: stats.pending_invoices.toString(), 
      icon: Clock,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <main className="p-4">
          {/* Page Title */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">
              {t('welcome')} {user.first_name} ! 👋
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{t('platformOverview')}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {statsCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white rounded-lg p-3 border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-none">
                        {loading ? '...' : stat.value}
                      </h3>
                      <p className="text-[10px] font-medium text-slate-600 mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <button
              onClick={() => router.push('/admin/members')}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-[#3776c5] hover:shadow-md transition-all group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Users size={20} className="text-[#3776c5]" />
                <ArrowRight size={16} className="text-slate-400 group-hover:text-[#3776c5] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm font-bold text-slate-900">{t('manageMembers')}</p>
              <p className="text-xs text-slate-600">{t('fullCRUD')}</p>
            </button>

            <button
              onClick={() => router.push('/admin/subscriptions')}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <CreditCard size={20} className="text-emerald-600" />
                <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm font-bold text-slate-900">{t('subscriptions')}</p>
              <p className="text-xs text-slate-600">{t('completeManagement')}</p>
            </button>

            <button
              onClick={() => router.push('/admin/invoices')}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-violet-500 hover:shadow-md transition-all group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText size={20} className="text-violet-600" />
                <ArrowRight size={16} className="text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm font-bold text-slate-900">{t('invoices')}</p>
              <p className="text-xs text-slate-600">{t('paymentsReminders')}</p>
            </button>

            <button
              onClick={() => router.push('/admin/plans')}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} className="text-orange-600" />
                <ArrowRight size={16} className="text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm font-bold text-slate-900">{t('packs')}</p>
              <p className="text-xs text-slate-600">{t('manageOffers')}</p>
            </button>
          </div>

          {/* Bottom Section - Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Members */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">{t('recentMembers')}</h2>
                <button 
                  onClick={() => router.push('/admin/members')}
                  className="text-xs font-semibold text-[#3776c5] hover:text-[#2d5fa3] transition-colors"
                >
                  {t('seeAll')} →
                </button>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-600">{t('loading')}</p>
                </div>
              ) : stats.recent_members.length === 0 ? (
                <div className="p-6 text-center">
                  <Users size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">{t('noMembers')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.recent_members.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors">
                      {member.profile_photo ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${member.profile_photo}`}
                          alt={member.first_name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3776c5] to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{member.organization?.name}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(member.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">{t('recentActivity')}</h2>
                <button 
                  onClick={() => router.push('/admin/invoices')}
                  className="text-xs font-semibold text-[#3776c5] hover:text-[#2d5fa3] transition-colors"
                >
                  {t('seeAll')} →
                </button>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-600">{t('loading')}</p>
                </div>
              ) : stats.recent_activity.length === 0 ? (
                <div className="p-6 text-center">
                  <Clock size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">{t('noActivity')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.recent_activity.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <FileText size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {activity.invoice_number}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{activity.organization?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">CHF {parseFloat(activity.total_amount).toFixed(2)}</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                          activity.status === 'paid' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {activity.status === 'paid' ? t('paid') : t('pending')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}