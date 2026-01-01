'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Building2 } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  description: string;
  price_chf: string;
  price_eur: string;
  duration_months: number;
}

export default function Register() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [membershipType, setMembershipType] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    plan_id: 0,
    country: 'CHF',
    organization_name: '',
    first_name: '',
    last_name: '',
    address: '',
    address_complement: '',
    postal_code: '',
    city: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    newsletter: 'immediate',
    accept_terms: false,
  });

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/membership/plans`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleTypeSelect = (type: string) => {
    setMembershipType(type);
    setFormData({ ...formData, type });
    
    if (type === 'individual') {
      // Sélectionner automatiquement le plan particulier (ID 1)
      const individualPlan = plans.find(p => p.id === 1);
      if (individualPlan) {
        setSelectedPlan(individualPlan);
        setFormData({ ...formData, type, plan_id: individualPlan.id });
      }
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({ ...formData, plan_id: plan.id });
  };

  const getPrice = () => {
    if (!selectedPlan) return '';
    return formData.country === 'CHF' 
      ? `CHF ${selectedPlan.price_chf}` 
      : `EUR ${selectedPlan.price_eur}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (!formData.accept_terms) {
      setError('Vous devez accepter les conditions générales');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/membership/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erreur lors de l\'inscription');
        setLoading(false);
        return;
      }

      // Succès - Sauvegarder token et rediriger
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Rediriger vers page de paiement ou dashboard membre
      if (data.payment_required) {
        // TODO: Rediriger vers page de paiement
        router.push('/member/payment');
      } else {
        router.push('/member/dashboard');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setLoading(false);
    }
  };

  // Filtrer les plans selon le type
  const organizationPlans = plans.filter(p => p.id !== 1); // Tous sauf particulier

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Image src="/logo.png" alt="Alprail" width={180} height={50} className="object-contain" />
          <button 
            onClick={() => router.push('/login')}
            className="border-2 border-[#3776c5] text-[#3776c5] px-8 py-2.5 rounded-full font-semibold hover:bg-[#3776c5] hover:text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Se connecter
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold text-[#3776c5] mb-4">Adhésion à Alprail</h1>
          <p className="text-slate-600 text-lg">Choisissez votre type d'adhésion</p>
        </div>

        {!selectedPlan ? (
          <>
            {/* Step 1: Choose Type */}
            {!membershipType && (
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleTypeSelect('individual')}
                  className="group bg-gradient-to-br from-[#3776c5] to-indigo-600 p-12 rounded-2xl text-white hover:shadow-2xl hover:shadow-[#3776c5]/50 transition-all transform hover:-translate-y-2"
                >
                  <User size={64} className="mx-auto mb-6 group-hover:scale-110 transition-transform" />
                  <h2 className="text-3xl font-bold">Adhésion pour particuliers</h2>
                </button>

                <button
                  onClick={() => handleTypeSelect('organization')}
                  className="group bg-gradient-to-br from-[#3776c5] to-indigo-600 p-12 rounded-2xl text-white hover:shadow-2xl hover:shadow-[#3776c5]/50 transition-all transform hover:-translate-y-2"
                >
                  <Building2 size={64} className="mx-auto mb-6 group-hover:scale-110 transition-transform" />
                  <h2 className="text-3xl font-bold">Adhésion collectivités publiques ou entreprises</h2>
                </button>
              </div>
            )}

            {/* Step 2: Choose Plan Size (for organizations) */}
            {membershipType === 'organization' && (
              <div className="max-w-6xl mx-auto">
                <button
                  onClick={() => setMembershipType('')}
                  className="mb-6 text-[#3776c5] hover:underline flex items-center gap-2"
                >
                  ← Retour au choix du type
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {organizationPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan)}
                      className="group bg-gradient-to-br from-[#3776c5] to-indigo-600 p-10 rounded-2xl text-white hover:shadow-2xl hover:shadow-[#3776c5]/50 transition-all transform hover:-translate-y-2"
                    >
                      <Building2 size={48} className="mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-lg opacity-90">
                        CHF {plan.price_chf} / EUR {plan.price_eur}
                      </p>
                      <p className="text-sm opacity-75 mt-1">{plan.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Step 3: Registration Form */
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => {
                setSelectedPlan(null);
                setMembershipType('');
                setFormData({ ...formData, plan_id: 0 });
              }}
              className="mb-6 text-[#3776c5] hover:underline flex items-center gap-2"
            >
              ← Retour au choix
            </button>

            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-blue-100">
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-l-4 border-[#3776c5]">
                <h3 className="font-bold text-lg mb-2">{selectedPlan.name}</h3>
                <p className="text-sm text-slate-600">
                  Termes: <span className="font-bold text-[#3776c5]">{getPrice()} / Année</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Du {new Date().toLocaleDateString('fr-FR')} au {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Pays *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="country"
                        value="CHF"
                        checked={formData.country === 'CHF'}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-4 h-4 text-[#3776c5]"
                      />
                      <span className="text-sm">🇨🇭 Suisse</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="country"
                        value="EUR"
                        checked={formData.country === 'EUR'}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-4 h-4 text-[#3776c5]"
                      />
                      <span className="text-sm">🇫🇷 France</span>
                    </label>
                  </div>
                </div>

                {/* Organization (only for non-individual) */}
                {formData.type === 'organization' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Organisation *</label>
                    <input
                      type="text"
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                      required
                    />
                  </div>
                )}

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {formData.type === 'organization' ? "Prénom de l'interlocuteur *" : 'Prénom *'}
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {formData.type === 'organization' ? "Nom de l'interlocuteur *" : 'Nom *'}
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Adresse *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Adresse (complément)</label>
                  <input
                    type="text"
                    value={formData.address_complement}
                    onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                  />
                </div>

                {/* Postal Code & City */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Code postal/ZIP *</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Ville *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>

                {/* Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Mot de passe *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Confirmation *</label>
                    <input
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/30 focus:border-[#3776c5] outline-none text-sm"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                {/* Newsletter */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Je souhaite recevoir une newsletter :</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="newsletter"
                        value="immediate"
                        checked={formData.newsletter === 'immediate'}
                        onChange={(e) => setFormData({ ...formData, newsletter: e.target.value })}
                        className="w-4 h-4 text-[#3776c5]"
                      />
                      <span className="text-sm">Aussitôt qu'une nouvelle est publiée sur alprail.net</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="newsletter"
                        value="biweekly"
                        checked={formData.newsletter === 'biweekly'}
                        onChange={(e) => setFormData({ ...formData, newsletter: e.target.value })}
                        className="w-4 h-4 text-[#3776c5]"
                      />
                      <span className="text-sm">Une fois tous les quinze jours</span>
                    </label>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accept_terms}
                      onChange={(e) => setFormData({ ...formData, accept_terms: e.target.checked })}
                      className="w-5 h-5 text-[#3776c5] mt-0.5"
                      required
                    />
                    <span className="text-sm">
                      En adhérant à Alprail, j'accepte les <a href="#" className="text-[#3776c5] hover:underline">statuts</a> ainsi que les <a href="#" className="text-[#3776c5] hover:underline">conditions générales</a> de l'inscription via le site web d'alprail.
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3776c5] text-white py-4 rounded-xl font-bold hover:bg-[#2d5fa3] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Inscription en cours...' : 'Adhérer'}
                </button>

                {/* Help */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-sm font-semibold mb-1">Besoin d'aide ?</p>
                  <p className="text-sm text-slate-600">
                    Vous pouvez nous contacter par mail:{' '}
                    <a href="mailto:contact@alprail.net" className="text-[#3776c5] hover:underline font-medium">
                      contact@alprail.net
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-slate-500 text-sm">© 2025 Alprail. Tous droits réservés.</p>
      </footer>
    </div>
  );
}