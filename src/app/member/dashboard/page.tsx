'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/member/Sidebar';
import MemberHeader from '@/components/member/Header';
import { CreditCard, FileText, Clock, AlertCircle } from 'lucide-react';

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'member') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  if (!user) return null;

  const stats = [
    { 
      label: 'Abonnement',
      value: 'En attente', 
      icon: CreditCard,
      color: 'orange',
    },
    { 
      label: 'Factures',
      value: '1', 
      icon: FileText,
      color: 'blue',
    },
    { 
      label: 'Échéance',
      value: '30 j', 
      icon: Clock,
      color: 'purple',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MemberSidebar />
      
      <div className="flex-1">
        <MemberHeader />
        
        <main className="p-6">
          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Bienvenue {user.first_name} ! 👋
            </h1>
            <p className="text-sm text-slate-600">Voici un aperçu de votre espace</p>
          </div>

          {/* Stats Cards - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colors = {
                orange: 'from-orange-500 to-red-600',
                blue: 'from-blue-500 to-indigo-600',
                purple: 'from-purple-500 to-pink-600',
              };

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} flex items-center justify-center shadow-md`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600">{stat.label}</p>
                      <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Cards - Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Abonnement */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Mon Abonnement</h2>
                <button 
                  onClick={() => router.push('/member/subscription')}
                  className="text-xs font-medium text-[#3776c5] hover:underline"
                >
                  Détails →
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Paiement en attente</p>
                    <p className="text-xs text-slate-600">50 CHF</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all text-xs">
                  Payer
                </button>
              </div>
            </div>

            {/* Factures */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Mes Factures</h2>
                <button 
                  onClick={() => router.push('/member/invoices')}
                  className="text-xs font-medium text-[#3776c5] hover:underline"
                >
                  Voir tout →
                </button>
              </div>
              
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FileText size={24} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 font-medium">1 facture en attente</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}