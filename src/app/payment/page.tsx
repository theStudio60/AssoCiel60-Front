'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CreditCard, Loader2, CheckCircle, Shield } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [planId, setPlanId] = useState<number | null>(null);
  const [orgId, setOrgId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    setOrgId(user.organization_id);

    const urlPlanId = searchParams.get('plan_id');
    if (urlPlanId) {
      setPlanId(parseInt(urlPlanId));
    }
  }, [router, searchParams]);

  const handlePayPalPayment = async () => {
    if (!planId || !orgId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Informations de paiement manquantes',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setLoading('paypal');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/membership/payment/paypal/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription_plan_id: planId,
          organization_id: orgId,
        }),
      });

      const data = await res.json();

      if (data.success && data.approval_url) {
        window.location.href = data.approval_url;
      } else {
        throw new Error(data.message || 'Erreur lors de la création du paiement');
      }
    } catch (error: any) {
      setLoading(null);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de paiement',
        text: error.message || 'Une erreur est survenue',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleDatatransPayment = async () => {
    if (!planId || !orgId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Informations de paiement manquantes',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setLoading('datatrans');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/membership/payment/datatrans/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription_plan_id: planId,
          organization_id: orgId,
        }),
      });

      const data = await res.json();

      if (data.success && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error(data.message || 'Erreur lors de la création du paiement');
      }
    } catch (error: any) {
      setLoading(null);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de paiement',
        text: error.message || 'Une erreur est survenue',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleStripePayment = async () => {
    if (!planId || !orgId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Informations de paiement manquantes',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setLoading('stripe');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/membership/payment/stripe/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription_plan_id: planId,
          organization_id: orgId,
        }),
      });

      const data = await res.json();

      if (data.success && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error(data.message || 'Erreur lors de la création du paiement');
      }
    } catch (error: any) {
      setLoading(null);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de paiement',
        text: error.message || 'Une erreur est survenue',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <Image src="/logo.png" alt="Alprail" width={180} height={50} className="object-contain" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#3776c5] mb-4">Finaliser votre adhésion</h1>
            <p className="text-slate-600">Choisissez votre méthode de paiement sécurisée</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-blue-100">
            <div className="space-y-4">
              
              {/* Stripe Option - RECOMMANDÉ */}
              <div className="relative">
                <button
                  onClick={handleStripePayment}
                  disabled={loading !== null}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-[#635bff] to-[#5046e5] hover:from-[#5046e5] hover:to-[#4037d5] text-white p-6 rounded-xl transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-3">
                    {loading === 'stripe' ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-lg font-bold">Redirection vers Stripe...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={28} />
                        <span className="text-lg font-bold">Payer avec Stripe</span>
                      </>
                    )}
                  </div>
                  <div className="mt-3 text-sm opacity-90 flex items-center justify-center gap-2">
                    <span>Carte bancaire • Apple Pay • Google Pay</span>
                  </div>
                </button>
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-lg animate-pulse">
                  ⚡ RECOMMANDÉ
                </div>
              </div>

              {/* Datatrans Option */}
              <button
                onClick={handleDatatransPayment}
                disabled={loading !== null}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#e30613] to-[#c40511] hover:from-[#c40511] hover:to-[#a30410] text-white p-6 rounded-xl transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {loading === 'datatrans' ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-lg font-bold">Redirection vers Datatrans...</span>
                    </>
                  ) : (
                    <>
                      <Shield size={28} />
                      <span className="text-lg font-bold">Payer avec Datatrans</span>
                    </>
                  )}
                </div>
                <div className="mt-3 text-sm opacity-90 flex items-center justify-center gap-2">
                  <span>🇨🇭 TWINT • PostFinance • Cartes</span>
                </div>
              </button>

              {/* PayPal Option */}
              <button
                onClick={handlePayPalPayment}
                disabled={loading !== null}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-[#0070ba] to-[#1546a0] hover:from-[#005ea6] hover:to-[#003087] text-white p-6 rounded-xl transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {loading === 'paypal' ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span className="text-lg font-bold">Redirection vers PayPal...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.76-4.852a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.721-4.463z"/>
                      </svg>
                      <span className="text-lg font-bold">Payer avec PayPal</span>
                    </>
                  )}
                </div>
                <div className="mt-3 text-sm opacity-90">
                  Paiement international
                </div>
              </button>
            </div>

            {/* Security Info */}
            <div className="mt-8 space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold mb-1">Paiement 100% sécurisé</p>
                    <p className="text-xs text-slate-600">
                      Vos données de paiement sont cryptées et sécurisées selon les normes PCI-DSS. Nous ne stockons jamais vos informations bancaires.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold mb-1">Stripe - Leader mondial du paiement en ligne</p>
                    <p className="text-xs text-slate-600">
                      Stripe est utilisé par des millions d'entreprises dans le monde entier. Frais les plus bas du marché.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Besoin d'aide ? Contactez-nous à{' '}
                <a href="mailto:contact@alprail.net" className="text-[#3776c5] hover:underline font-semibold">
                  contact@alprail.net
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-slate-500 text-sm">© 2026 Alprail. Tous droits réservés.</p>
      </footer>
    </div>
  );
}