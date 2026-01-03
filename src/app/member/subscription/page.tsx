'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/member/Sidebar';
import MemberHeader from '@/components/member/Header';
import { Package, Calendar, CreditCard, CheckCircle, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

interface Subscription {
  id: number;
  subscription_plan: {
    name: string;
    description: string;
    price_chf: string;
    price_eur: string;
  };
  start_date: string;
  end_date: string;
  status: string;
  auto_renew: boolean;
}

export default function MemberSubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

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
    fetchSubscription();
  }, [router]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/subscription`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
        setDaysRemaining(data.days_remaining);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;

    const result = await Swal.fire({
      title: subscription.auto_renew ? 'Désactiver le renouvellement automatique ?' : 'Activer le renouvellement automatique ?',
      text: subscription.auto_renew 
        ? 'Votre abonnement ne sera plus renouvelé automatiquement' 
        : 'Votre abonnement sera renouvelé automatiquement chaque année',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3776c5',
      cancelButtonColor: '#64748b',
      confirmButtonText: subscription.auto_renew ? 'Désactiver' : 'Activer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/subscription/toggle-auto-renew`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: subscription.auto_renew ? 'Renouvellement désactivé' : 'Renouvellement activé',
            confirmButtonColor: '#3776c5',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchSubscription(); // Recharger
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

  const handleRenew = async () => {
    const result = await Swal.fire({
      title: 'Renouveler l\'abonnement ?',
      text: 'Une demande de renouvellement sera envoyée à l\'administrateur',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3776c5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Envoyer la demande',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/subscription/renew`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Demande envoyée !',
            text: 'L\'administrateur a été notifié',
            confirmButtonColor: '#3776c5',
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
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Actif', icon: CheckCircle },
      expired: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Expiré', icon: AlertCircle },
      canceled: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Annulé', icon: AlertCircle },
    };
    
    const c = config[status] || config.active;
    const Icon = c.icon;
    
    return (
      <div className={`${c.bg} ${c.text} ${c.border} border px-4 py-2 rounded-lg inline-flex items-center gap-2`}>
        <Icon size={18} />
        <span className="font-semibold">{c.label}</span>
      </div>
    );
  };

  if (!user || loading) return null;

  if (!subscription) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <MemberSidebar />
        <div className="flex-1">
          <MemberHeader />
          <main className="p-4">
            <div className="text-center py-12">
              <Package size={48} className="text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 mb-2">Aucun abonnement</h2>
              <p className="text-sm text-slate-600">Vous n'avez pas d'abonnement actif</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MemberSidebar />
      
      <div className="flex-1">
        <MemberHeader />
        
        <main className="p-4">
          {/* Page Title */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">Mon Abonnement</h1>
            <p className="text-xs text-slate-600 mt-0.5">Détails de votre abonnement actuel</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{subscription.subscription_plan.name}</h2>
                <p className="text-sm text-slate-600">{subscription.subscription_plan.description}</p>
              </div>
              {getStatusBadge(subscription.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Date début */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Calendar size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Date de début</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(subscription.start_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Date fin */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${daysRemaining < 30 ? 'from-orange-500 to-red-500' : 'from-emerald-500 to-teal-500'} flex items-center justify-center flex-shrink-0`}>
                  <Calendar size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Date de fin</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                  </p>
                  {daysRemaining >= 0 && (
                    <p className={`text-xs mt-1 font-semibold ${daysRemaining < 30 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {daysRemaining} jours restants
                    </p>
                  )}
                </div>
              </div>

              {/* Prix */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <DollarSign size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Prix</p>
                  <p className="text-lg font-bold text-slate-900">
                    {subscription.subscription_plan.price_chf} CHF
                  </p>
                  <p className="text-xs text-slate-500">{subscription.subscription_plan.price_eur} EUR</p>
                </div>
              </div>
            </div>

            {/* Renouvellement auto avec Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <RefreshCw size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Renouvellement automatique</p>
                  <p className="text-xs text-slate-600">
                    {subscription.auto_renew 
                      ? 'Votre abonnement sera renouvelé automatiquement' 
                      : 'Renouvellement manuel requis'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleAutoRenew}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  subscription.auto_renew ? 'bg-green-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    subscription.auto_renew ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {subscription.status === 'active' && daysRemaining < 30 && (
                <button
                  onClick={handleRenew}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#3776c5] to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <RefreshCw size={18} />
                  Renouveler maintenant
                </button>
              )}
              
              {subscription.status === 'expired' && (
                <button
                  onClick={handleRenew}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <RefreshCw size={18} />
                  Réactiver l'abonnement
                </button>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Informations</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Accès complet à la plateforme</p>
                  <p className="text-xs text-slate-600">Toutes les fonctionnalités incluses</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Support prioritaire</p>
                  <p className="text-xs text-slate-600">Assistance par email sous 24h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Mises à jour incluses</p>
                  <p className="text-xs text-slate-600">Toutes les nouvelles fonctionnalités</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
