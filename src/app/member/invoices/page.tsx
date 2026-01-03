'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/member/Sidebar';
import MemberHeader from '@/components/member/Header';
import { FileText, Download, Search, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

interface Invoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  paid_at: string | null;
  total_amount: string;
  currency: string;
  status: string;
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
  total_amount: number;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export default function MemberInvoicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    paid: 0,
    pending: 0,
    total_amount: 0,
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
    status: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'member') {
      router.push('/admin/dashboard');
      return;
    }

    setUser(parsedUser);
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

  const fetchInvoices = async (page: number = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/invoices?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices.data);
        setStats(data.stats);
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

  const handleDownload = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/invoices/${invoiceId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de télécharger la facture',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      paid: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Payée' },
      pending: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'En attente' },
      overdue: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'En retard' },
    };
    
    const c = config[status] || config.pending;
    return (
      <span className={`${c.bg} ${c.text} ${c.border} border px-3 py-1 rounded-full text-[10px] font-semibold`}>
        {c.label}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MemberSidebar />
      
      <div className="flex-1">
        <MemberHeader />
        
        <main className="p-4">
          {/* Page Title */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">Mes Factures</h1>
            <p className="text-xs text-slate-600 mt-0.5">Consultez et téléchargez vos factures</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Factures', value: stats.total, icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Factures Payées', value: stats.paid, icon: Calendar, gradient: 'from-emerald-500 to-teal-500' },
              { label: 'En Attente', value: stats.pending, icon: Calendar, gradient: 'from-orange-500 to-red-500' },
              { label: 'Total Payé', value: `${parseFloat(stats.total_amount.toString()).toFixed(2)} CHF`, icon: DollarSign, gradient: 'from-violet-500 to-purple-500' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white rounded-lg p-3 border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-none">
                        {typeof stat.value === 'number' ? stat.value : stat.value}
                      </h3>
                      <p className="text-[10px] font-medium text-slate-600 mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro..."
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
                <option value="paid">Payée</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Numéro
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Plan
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Échéance
                  </th>
                  <th className="px-3 py-3 text-right text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Montant
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Statut
                  </th>
                  <th className="px-3 py-3 text-center text-[11px] text-slate-900 uppercase" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-600">Chargement...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-xs text-slate-600">Aucune facture trouvée</td></tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-bold text-[#3776c5]">{invoice.invoice_number}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-semibold text-slate-900">{invoice.subscription.subscription_plan.name}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-slate-600">
                          {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-slate-600">
                          {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-xs font-bold text-slate-900">
                          {parseFloat(invoice.total_amount).toFixed(2)} {invoice.currency}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => handleDownload(invoice.id, invoice.invoice_number)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#3776c5] text-white rounded-lg hover:bg-[#2d5fa3] transition-all text-xs font-semibold"
                        >
                          <Download size={12} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))
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