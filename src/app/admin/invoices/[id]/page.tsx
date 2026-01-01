'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { ArrowLeft, Download, Mail, CheckCircle, Building2, Calendar, DollarSign, FileText } from 'lucide-react';
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
  organization: {
    name: string;
    address: string;
    zip_code: string;
    city: string;
    email: string;
    phone: string;
  };
  subscription: {
    subscription_plan: {
      name: string;
      price_chf: string;
    };
  };
}

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
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
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setInvoice(data.invoice);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    const result = await Swal.fire({
      title: 'Marquer comme payé ?',
      text: `Facture ${invoice?.invoice_number}`,
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/${params.id}/mark-paid`, {
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
          fetchInvoice();
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

  const handleDownloadPdf = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/${params.id}/download-pdf`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      }
    );

    if (!res.ok) {
      throw new Error('Erreur téléchargement');
    }

    // Convertir en blob
    const blob = await res.blob();
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture_${invoice?.invoice_number || 'document'}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyage
    a.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Erreur PDF:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Impossible de télécharger la facture',
      confirmButtonColor: '#ef4444',
    });
  }
};


  const handleSendReminder = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/${params.id}/send-reminder`, {
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
      <span className={`${c.bg} ${c.text} ${c.border} border px-4 py-2 rounded-full text-sm font-semibold`}>
        {c.label}
      </span>
    );
  };

  if (!user || loading) return null;
  if (!invoice) return <div className="p-8">Facture non trouvée</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <main className="p-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/invoices')}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft size={16} />
              Retour aux factures
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Facture {invoice.invoice_number}</h1>
                <p className="text-sm text-slate-600 mt-1">Détails de la facture</p>
              </div>
              
              <div className="flex items-center gap-3">
                {invoice.status !== 'paid' && (
                  <>
                    <button
                      onClick={handleSendReminder}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all text-sm font-semibold"
                    >
                      <Mail size={16} />
                      Envoyer rappel
                    </button>
                    <button
                      onClick={handleMarkAsPaid}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold"
                    >
                      <CheckCircle size={16} />
                      Marquer payé
                    </button>
                  </>
                )}
                <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3776c5] text-white rounded-lg hover:bg-[#2d5fa3] transition-all text-sm font-semibold"
                    >
                    <Download size={16} />
                    Télécharger PDF
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations facture */}
            <div className="lg:col-span-2 space-y-6">
              {/* Détails */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Informations de facturation</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600">Numéro de facture</p>
                    </div>
                    <p className="text-lg font-bold text-[#3776c5]">{invoice.invoice_number}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600">Date d'émission</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-slate-400" />
                      <p className="text-xs font-semibold text-slate-600">Date d'échéance</p>
                    </div>
                    <p className="text-lg font-semibold text-orange-600">
                      {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {invoice.paid_at && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <p className="text-xs font-semibold text-slate-600">Date de paiement</p>
                      </div>
                      <p className="text-lg font-semibold text-green-600">
                        {new Date(invoice.paid_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Montants */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Détails du montant</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Plan: {invoice.subscription.subscription_plan.name}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {invoice.currency} {parseFloat(invoice.amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Taxe</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {invoice.currency} {parseFloat(invoice.tax_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-4 bg-slate-50 -mx-6 px-6 rounded-lg">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-[#3776c5]">
                      {invoice.currency} {parseFloat(invoice.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statut */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Statut</h3>
                <div className="flex justify-center">
                  {getStatusBadge(invoice.status)}
                </div>
              </div>

              {/* Client */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-[#3776c5]" />
                  <h3 className="text-sm font-bold text-slate-900">Informations client</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Organisation</p>
                    <p className="text-sm font-semibold text-slate-900">{invoice.organization.name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Adresse</p>
                    <p className="text-sm text-slate-700">{invoice.organization.address}</p>
                    <p className="text-sm text-slate-700">
                      {invoice.organization.zip_code} {invoice.organization.city}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Contact</p>
                    <p className="text-sm text-slate-700">{invoice.organization.email}</p>
                    <p className="text-sm text-slate-700">{invoice.organization.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}