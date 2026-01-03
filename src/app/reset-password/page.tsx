'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Lien invalide. Veuillez faire une nouvelle demande.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erreur lors de la réinitialisation');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Rediriger vers login après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
              <h1 className="text-4xl font-bold text-[#3776c5] mb-2">Nouveau mot de passe</h1>
              <p className="text-slate-600 text-sm">
                {success 
                  ? 'Mot de passe réinitialisé avec succès' 
                  : 'Entrez votre nouveau mot de passe'
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
                  ✅ Mot de passe modifié ! Redirection...
                </div>
                <Link 
                  href="/login"
                  className="block w-full text-center bg-[#3776c5] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2d5fa3] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Aller à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2 text-sm">Nouveau mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] transition-all outline-none text-sm text-slate-900"
                    required
                    minLength={8}
                    disabled={!token || !email}
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimum 8 caractères</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-2 text-sm">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] transition-all outline-none text-sm text-slate-900"
                    required
                    minLength={8}
                    disabled={!token || !email}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token || !email}
                  className="w-full bg-[#3776c5] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2d5fa3] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? 'Modification...' : 'Réinitialiser le mot de passe'}
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
            <p className="text-slate-500 text-xs">© 2026 Alprail. Tous droits réservés.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}