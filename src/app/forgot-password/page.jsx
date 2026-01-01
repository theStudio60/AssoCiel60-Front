'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erreur lors de l\'envoi');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100 relative flex flex-col">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Image src="/logo.png" alt="Alprail" width={180} height={50} className="object-contain" />
          <a 
            href="#" 
            className="border-2 border-[#3776c5] text-[#3776c5] px-8 py-2.5 rounded-full font-semibold hover:bg-[#3776c5] hover:text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
            Adhérer
            </a>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pt-4">
        <div className="w-full max-w-lg">
          <div className="bg-white/90 backdrop-blur-xl px-16 py-12 rounded-3xl shadow-2xl border border-blue-100">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#3776c5] mb-2">Mot de passe oublié</h1>
              <p className="text-slate-600 text-sm">
                {success 
                  ? 'Un email de réinitialisation a été envoyé' 
                  : 'Entrez votre email pour réinitialiser votre mot de passe'
                }
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">
                {error}
              </div>
            )}

            {success ? (
              <div className="space-y-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-200 text-center">
                  Vérifiez votre boîte email
                </div>
                <Link 
                  href="/login"
                  className="block w-full text-center bg-[#3776c5] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2d5fa3] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    placeholder="votre@email.ch"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] transition-all outline-none text-sm text-slate-900 placeholder:text-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3776c5] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2d5fa3] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>

                <div className="mt-6 text-center">
                  <Link href="/login" className="text-[#3776c5] font-semibold hover:underline text-sm">
                    ← Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">© 2025 Alprail. Tous droits réservés.</p>
          </div>
        </div>
      </main>
    </div>
  );
}