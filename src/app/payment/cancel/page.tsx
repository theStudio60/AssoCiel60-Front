'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

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
      <main className="relative z-10 flex items-center justify-center px-6 py-16 min-h-[calc(100vh-200px)]">
        <div className="bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-orange-200 text-center max-w-md">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Paiement annulé</h1>
          <p className="text-slate-600 mb-8">
            Vous avez annulé le paiement. Aucun montant n'a été débité.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/payment')}
              className="w-full px-6 py-3 bg-[#3776c5] text-white rounded-lg font-semibold hover:bg-[#2d5fa3] transition-all shadow-lg hover:shadow-xl"
            >
              Réessayer le paiement
            </button>
            <button
              onClick={() => router.push('/member/dashboard')}
              className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all"
            >
              Retour à mon espace
            </button>
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