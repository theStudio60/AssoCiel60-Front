'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, Package, Activity } from 'lucide-react';
import Swal from 'sweetalert2';

interface MonthlyStats {
  members: {
    total: number;
    new: number;
    growth: number;
  };
  subscriptions: {
    active: number;
    new: number;
    expired: number;
  };
  revenue: {
    total: number;
    pending: number;
    invoices_count: number;
    paid_invoices: number;
    payment_rate: number;
  };
  activity: {
    total: number;
    top_actions: Array<{ action: string; count: number }>;
  };
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [period, setPeriod] = useState({ start: '', end: '' });

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
    fetchMonthlyData(selectedMonth);
  }, [router]);

  const fetchMonthlyData = async (month: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reports/monthly?month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setPeriod(data.period);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const month = e.target.value;
    setSelectedMonth(month);
    fetchMonthlyData(month);
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      
      Swal.fire({
        title: 'Génération du rapport...',
        text: 'Veuillez patienter',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reports/monthly/pdf?month=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport_Mensuel_${selectedMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'Rapport généré !',
        text: 'Le téléchargement a commencé',
        confirmButtonColor: '#3776c5',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de générer le rapport',
        confirmButtonColor: '#ef4444',
      });
    }
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
            <h1 className="text-xl font-bold text-slate-900">Rapports Mensuels</h1>
            <p className="text-xs text-slate-600 mt-0.5">Générez et consultez les rapports d'activité</p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-slate-600" />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sélectionner le mois
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    max={new Date().toISOString().slice(0, 7)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/20"
                  />
                </div>
                {period.start && (
                  <div className="ml-4 text-xs text-slate-600">
                    Période: <span className="font-semibold">{period.start}</span> au <span className="font-semibold">{period.end}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadPDF}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3776c5] to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Download size={16} />
                Télécharger PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#3776c5] border-t-transparent"></div>
              <p className="text-sm text-slate-600 mt-3">Chargement des données...</p>
            </div>
          ) : stats ? (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Membres Total</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.members.total}</p>
                      <p className="text-xs text-green-600 font-semibold mt-0.5">
                        +{stats.members.new} ce mois ({stats.members.growth}%)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <Package size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Abonnements Actifs</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.subscriptions.active}</p>
                      <p className="text-xs text-green-600 font-semibold mt-0.5">
                        +{stats.subscriptions.new} nouveaux
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <DollarSign size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Revenue du Mois</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.revenue.total.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">CHF</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Taux de Paiement</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.revenue.payment_rate}%</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {stats.revenue.paid_invoices}/{stats.revenue.invoices_count} factures
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Revenue Details */}
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <DollarSign size={16} className="text-[#3776c5]" />
                    Détails Financiers
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-xs text-slate-600">Revenue payé</span>
                      <span className="text-sm font-bold text-green-600">{stats.revenue.total.toFixed(2)} CHF</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-xs text-slate-600">Revenue en attente</span>
                      <span className="text-sm font-bold text-orange-600">{stats.revenue.pending.toFixed(2)} CHF</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-xs text-slate-600">Factures émises</span>
                      <span className="text-sm font-bold text-slate-900">{stats.revenue.invoices_count}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-xs text-slate-600">Factures payées</span>
                      <span className="text-sm font-bold text-slate-900">{stats.revenue.paid_invoices}</span>
                    </div>
                  </div>
                </div>

                {/* Activity Details */}
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-[#3776c5]" />
                    Top Actions du Mois
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded mb-2">
                      <span className="text-xs font-semibold text-slate-700">Total d'actions</span>
                      <span className="text-sm font-bold text-[#3776c5]">{stats.activity.total}</span>
                    </div>
                    {stats.activity.top_actions.map((action, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <span className="text-xs text-slate-600 capitalize">{action.action.replace('_', ' ')}</span>
                        <span className="text-sm font-bold text-slate-900">{action.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText size={20} className="text-[#3776c5] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Rapport PDF Complet</h4>
                    <p className="text-xs text-slate-600 mb-2">
                      Le rapport PDF inclut des informations détaillées : top organisations, dernières factures, 
                      distribution des packs, et bien plus encore.
                    </p>
                    <p className="text-xs text-slate-500">
                      💡 Astuce : Vous pouvez programmer l'envoi automatique mensuel de ce rapport par email.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 mb-2">Aucune donnée</h2>
              <p className="text-sm text-slate-600">Sélectionnez un mois pour voir le rapport</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}