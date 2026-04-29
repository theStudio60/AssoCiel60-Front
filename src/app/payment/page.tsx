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
            <p className="text-slate-600">Paiement sécurisé via Stripe</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-blue-100">
            <div className="space-y-4">
              
              {/* Stripe Option */}
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
                  <span>Carte bancaire • Apple Pay • Google Pay • TWINT</span>
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