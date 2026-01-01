'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, CreditCard } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Inscription réussie !
        </h1>
        
        <p className="text-slate-600 mb-8">
          Bienvenue <strong>{user.first_name} {user.last_name}</strong> ! 
          Votre compte a été créé avec succès.
        </p>

        <div className="bg-blue-50 rounded-xl p-6 mb-8 border-l-4 border-[#3776c5]">
          <h2 className="font-bold text-lg mb-2 text-slate-900">Prochaine étape</h2>
          <p className="text-sm text-slate-600 mb-4">
            Votre adhésion sera active dès réception de votre paiement.
          </p>
          <p className="text-xs text-slate-500">
            Vous recevrez un email avec les instructions de paiement.
          </p>
        </div>

        <button
          onClick={() => router.push('/member/dashboard')}
          className="w-full bg-gradient-to-r from-[#3776c5] to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Accéder à mon espace membre
        </button>
      </div>
    </div>
  );
}