'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Verify2FA() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    const id = localStorage.getItem('temp_user_id');
    if (!id) {
      router.push('/login');
      return;
    }
    setUserId(id);
  }, [router]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (/^\d$/.test(char) && i < 6) {
        newCode[i] = char;
      }
    });
    setCode(newCode);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Veuillez entrer les 6 chiffres');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Code invalide');
        setLoading(false);
        return;
      }

      localStorage.removeItem('temp_user_id');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/member/dashboard');
      }
    } catch (err) {
      setError('Erreur de vérification');
      setLoading(false);
    }
  };

  if (!userId) return null;

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
              <div className="w-20 h-20 bg-[#3776c5]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-[#3776c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-[#3776c5] mb-2">Vérification 2FA</h1>
              <p className="text-slate-600 text-sm">Entrez le code reçu par email</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-14 h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] transition-all outline-none text-slate-900"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || code.some(d => !d)}
                className="w-full bg-[#3776c5] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2d5fa3] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-[#3776c5] font-semibold hover:underline text-sm"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">© 2025 Alprail. Tous droits réservés.</p>
          </div>
        </div>
      </main>
    </div>
  );
}