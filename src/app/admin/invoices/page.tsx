'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Search, Download, MoreVertical, Eye, CheckCircle, Mail, FileText, DollarSign, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

interface Invoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  amount: string;
  tax_amount: string;
  total_amount: string;
  currency: string;
  status: string;
  created_at: string;
  organization: {
    name: string;
  };
  subscription: {
    subscription_plan: {
      name: string;
    };
  };
}

interface Stats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  total_revenue: number;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    total_revenue: 0,
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
    fetchInvoices(1);
  }, [router]);

  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchInvoices(1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters.search]);

  useEffect(() => {
    if (user) {
      fetchInvoices(1);
    }
  }, [filters.status]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/stats`, {
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

  const fetchInvoices = async (page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices.data);
        setPagination({
          current_page: data.invoices.current_page,
          last_page: data.invoices.last_page,
          per_page: data.invoices.per_page,
          total: data.invoices.total,
          from: data.invoices.from,
          to: data.invoices.to,
        });
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/export`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factures_${new Date().toISOString().split('T')[0]}.csv`;
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

  const handleMarkAsPaid = async (id: number, invoiceNumber: string) => {
    const result = await Swal.fire({
      title: 'Marquer comme payé ?',
      text: `Facture ${invoiceNumber}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3776c5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Marquer payé',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/${id}/mark-paid`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Marqué comme payé !',
            confirmButtonColor: '#3776c5',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchInvoices(pagination.current_page);
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
    setOpenDropdown(null);
  };

  const handleSendReminder = async (id: number, orgName: string) => {
    const result = await Swal.fire({
      title: 'Envoyer un rappel ?',
      text: `Envoyer un rappel à ${orgName}`,
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
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/${id}/send-reminder`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        Swal.fire({
          icon: 'success',
          title: 'Rappel envoyé !',
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
    }
    setOpenDropdown(null);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      paid: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Payé' },
      pending: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'En attente' },
      overdue: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'En retard' },
      canceled: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Annulé' },
    };
    
    const c = config[status as keyof typeof config] || config.pending;
    return (
      <span className={`${c.bg} ${c.text} ${c.border} border px-3 py-1 rounded-full text-[10px] font-semibold`}>
        {c.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit',
        month: 'short', 
        year: 'numeric'
      });
    } catch {
      return 'N/A';
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
            <h1 className="text-xl font-bold text-slate-900">Gestion des Factures</h1>
            <p className="text-xs text-slate-600 mt-0.5">Gérez et visualisez toutes les factures</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Factures', value: stats.total, icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Payées', value: stats.paid, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
              { label: 'En Attente', value: stats.pending, icon: Clock, gradient: 'from-orange-500 to-amber-500' },
              { label: 'En Retard', value: stats.overdue, icon: AlertCircle, gradient: 'from-red-500 to-rose-500' },
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

          {/* Revenue Card - Gradient #3776c5 */}
          <div className="bg-gradient-to-br from-[#3776c5] to-[#2d5fa3] rounded-lg p-4 mb-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs opacity-90 font-medium">Revenu Total</p>
                <h2 className="text-3xl font-bold">
                  CHF {stats.total_revenue ? parseFloat(stats.total_revenue.toString()).toFixed(2) : '0.00'}
                </h2>
              </div>
            </div>
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
                <option value="paid">Payées</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
                <option value="canceled">Annulées</option>
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
                    Numéro
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Organisation
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Plan
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Montant
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Date échéance
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Statut
                  </th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-xs text-slate-600">Chargement...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-xs text-slate-600">Aucune facture trouvée</td></tr>
                ) : (
                  invoices.map((inv) => {
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold text-[#3776c5]">
                            {inv.invoice_number}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-semibold text-slate-900">
                            {inv.organization?.name}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-slate-600">
                            {inv.subscription?.subscription_plan?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold text-slate-900">
                            {inv.currency} {parseFloat(inv.total_amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] text-slate-600">
                            {formatDate(inv.due_date)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          {getStatusBadge(inv.status)}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === inv.id ? null : inv.id)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={14} className="text-slate-600" />
                            </button>
                            {openDropdown === inv.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                                <button
                                  onClick={() => {
                                    router.push(`/admin/invoices/${inv.id}`);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 text-xs"
                                >
                                  <Eye size={12} className="text-[#3776c5]" />
                                  Voir détails
                                </button>
                                {inv.status !== 'paid' && (
                                  <>
                                    <button
                                      onClick={() => handleMarkAsPaid(inv.id, inv.invoice_number)}
                                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-50 text-green-600 text-xs border-t border-slate-100"
                                    >
                                      <CheckCircle size={12} />
                                      Marquer comme payé
                                    </button>
                                    <button
                                      onClick={() => handleSendReminder(inv.id, inv.organization?.name)}
                                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-blue-600 text-xs border-t border-slate-100"
                                    >
                                      <Mail size={12} />
                                      Envoyer rappel
                                    </button>
                                  </>
                                )}
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
            {!loading && invoices.length > 0 && (
              <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Affichage de <span className="font-semibold">{pagination.from}</span> à{' '}
                  <span className="font-semibold">{pagination.to}</span> sur{' '}
                  <span className="font-semibold">{pagination.total}</span> factures
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchInvoices(pagination.current_page - 1)}
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
                            onClick={() => fetchInvoices(page)}
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
                    onClick={() => fetchInvoices(pagination.current_page + 1)}
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