'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Loader2 } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const sessionId = searchParams.get('session_id'); // Stripe
      const paymentId = searchParams.get('paymentId'); // PayPal
      const payerId = searchParams.get('PayerID'); // PayPal
      const planId = searchParams.get('plan_id');
      const orgId = searchParams.get('org_id');

      // STRIPE Payment
      if (sessionId && planId && orgId) {
        console.log('Paiement Stripe détecté');
        try {
          const token = localStorage.getItem('token');
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/membership/payment/stripe/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              session_id: sessionId,
              plan_id: parseInt(planId),
              organization_id: parseInt(orgId),
            }),
          });

          const data = await res.json();

          if (data.success) {
            setProcessing(false);
            setTimeout(() => {
              router.push('/member/dashboard');
            }, 3000);
          } else {
            throw new Error(data.message || 'Erreur lors de la finalisation');
          }
        } catch (err: any) {
          setError(err.message || 'Une erreur est survenue');
          setProcessing(false);
        }
        return;
      }

      // PAYPAL Payment
      if (paymentId && payerId && planId && orgId) {
        console.log('Paiement PayPal détecté');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/paypal/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              payment_id: paymentId,
              payer_id: payerId,
              plan_id: parseInt(planId),
              organization_id: parseInt(orgId),
            }),
          });

          const data = await res.json();

          if (data.success) {
            setProcessing(false);
            setTimeout(() => {
              router.push('/member/dashboard');
            }, 3000);
          } else {
            throw new Error(data.message || 'Erreur lors du traitement du paiement');
          }
        } catch (err: any) {
          setError(err.message || 'Une erreur est survenue');
          setProcessing(false);
        }
        return;
      }

      // DATATRANS Payment (juste plan_id et org_id)
      if (planId && orgId && !sessionId && !paymentId) {
        console.log('Paiement Datatrans détecté');
        // Pour Datatrans, on considère le paiement comme réussi
        // La confirmation se fera via webhook côté backend
        setProcessing(false);
        setTimeout(() => {
          router.push('/member/dashboard');
        }, 3000);
        return;
      }

      // Aucun paramètre valide
      setError('Informations de paiement manquantes');
      setProcessing(false);
    };

    handlePaymentSuccess();
  }, [searchParams, router]);

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center px-6">
        <div className="bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-blue-100 text-center max-w-md">
          <Loader2 className="w-16 h-16 text-[#3776c5] mx-auto mb-6 animate-spin" />
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Traitement du paiement...</h1>
          <p className="text-slate-600">Veuillez patienter pendant que nous confirmons votre paiement.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center px-6">
        <div className="bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-red-200 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Erreur de paiement</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/payment')}
            className="px-6 py-3 bg-[#3776c5] text-white rounded-lg font-semibold hover:bg-[#2d5fa3] transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center px-6">
      <div className="bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-green-200 text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Paiement réussi ! 🎉</h1>
        <p className="text-slate-600 mb-6">
          Votre adhésion a été confirmée. Vous allez être redirigé vers votre espace membre...
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirection en cours...</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#3776c5] animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}