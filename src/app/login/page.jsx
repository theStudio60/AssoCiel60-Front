'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Identifiants incorrects');
        setLoading(false);
        return;
      }

      if (data.requires_2fa) {
        localStorage.setItem('temp_user_id', data.user_id);
        router.push('/verify-2fa');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/member/dashboard');
      }
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
            href="/register" 
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
              <h1 className="text-4xl font-bold text-[#3776c5] mb-2">Connexion</h1>
              <p className="text-slate-600 text-sm">Accédez à votre espace membre</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-700 font-semibold mb-2 text-sm">Email</label>
                <input
                  type="email"
                  placeholder="votre@email.ch"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] transition-all outline-none text-sm text-slate-900 placeholder:text-slate-800"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-700 font-semibold text-sm">Mot de passe</label>
                  <Link href="/forgot-password" className="text-[#3776c5] text-xs font-medium hover:underline">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] transition-all outline-none pr-12 text-sm text-slate-900 placeholder:text-slate-800"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#3776c5] transition text-lg"
                  >
                    👁
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3776c5] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2d5fa3] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                Pas encore membre ?{' '}
                <a href="#" className="text-[#3776c5] font-semibold hover:underline">
                  Adhérer maintenant
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">© 2026 Alprail. Tous droits réservés.</p>
          </div>
        </div>
      </main>
    </div>
  );
}