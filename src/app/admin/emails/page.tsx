'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Mail, Send, Settings as SettingsIcon, Save, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

interface EmailSettings {
  welcome_enabled: boolean;
  welcome_subject: string;
  subscription_enabled: boolean;
  subscription_subject: string;
  reminder_enabled: boolean;
  reminder_subject: string;
  reminder_days_before: number;
  payment_enabled: boolean;
  payment_subject: string;
  smtp_host: string;
  smtp_port: string;
  smtp_from_email: string;
  smtp_from_name: string;
}

export default function EmailsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testType, setTestType] = useState('welcome');
  const [settings, setSettings] = useState<EmailSettings>({
    welcome_enabled: true,
    welcome_subject: '',
    subscription_enabled: true,
    subscription_subject: '',
    reminder_enabled: true,
    reminder_subject: '',
    reminder_days_before: 7,
    payment_enabled: true,
    payment_subject: '',
    smtp_host: '',
    smtp_port: '',
    smtp_from_email: '',
    smtp_from_name: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/member/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/emails/settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setTestEmail(data.settings.smtp_from_email);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/emails/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Paramètres sauvegardés !',
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: data.message,
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      Swal.fire({
        icon: 'warning',
        title: 'Email requis',
        text: 'Veuillez entrer une adresse email',
        confirmButtonColor: '#3776c5',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/emails/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: testEmail,
          type: testType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Email envoyé !',
          text: data.message,
          confirmButtonColor: '#3776c5',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: data.message,
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible d\'envoyer l\'email',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  if (!user || loading) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <main className="p-4">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Gestion des Emails</h1>
            <p className="text-xs text-slate-600 mt-0.5">Configurez les emails automatiques de votre plateforme</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Configuration - 2 colonnes */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Bienvenue */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Mail size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Email de Bienvenue</h3>
                        <p className="text-xs text-slate-600">Envoyé lors de l'inscription</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.welcome_enabled}
                        onChange={(e) => setSettings({ ...settings, welcome_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3776c5]"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Sujet de l'email</label>
                    <input
                      type="text"
                      value={settings.welcome_subject}
                      onChange={(e) => setSettings({ ...settings, welcome_subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                      placeholder="Bienvenue chez Alprail"
                    />
                  </div>
                </div>

                {/* Email Confirmation Abonnement */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Confirmation d'Abonnement</h3>
                        <p className="text-xs text-slate-600">Envoyé après confirmation</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.subscription_enabled}
                        onChange={(e) => setSettings({ ...settings, subscription_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Sujet de l'email</label>
                    <input
                      type="text"
                      value={settings.subscription_subject}
                      onChange={(e) => setSettings({ ...settings, subscription_subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                      placeholder="Votre abonnement est confirmé"
                    />
                  </div>
                </div>

                {/* Email Rappel Paiement */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <Clock size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Rappel de Paiement</h3>
                        <p className="text-xs text-slate-600">Rappel manuel</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.reminder_enabled}
                        onChange={(e) => setSettings({ ...settings, reminder_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Sujet de l'email</label>
                      <input
                        type="text"
                        value={settings.reminder_subject}
                        onChange={(e) => setSettings({ ...settings, reminder_subject: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                        placeholder="Rappel de paiement - Facture {invoice_number}"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Jours avant échéance (rappel auto)</label>
                      <input
                        type="number"
                        value={settings.reminder_days_before}
                        onChange={(e) => setSettings({ ...settings, reminder_days_before: parseInt(e.target.value) })}
                        min="1"
                        max="30"
                        className="w-32 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Facture Payée */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Confirmation de Paiement</h3>
                        <p className="text-xs text-slate-600">Envoyé après paiement</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payment_enabled}
                        onChange={(e) => setSettings({ ...settings, payment_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Sujet de l'email</label>
                    <input
                      type="text"
                      value={settings.payment_subject}
                      onChange={(e) => setSettings({ ...settings, payment_subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                      placeholder="Paiement reçu - Facture {invoice_number}"
                    />
                  </div>
                </div>

                {/* Configuration SMTP */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <SettingsIcon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Configuration SMTP</h3>
                      <p className="text-xs text-slate-600">Paramètres du serveur d'envoi</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Serveur SMTP</label>
                      <input
                        type="text"
                        value={settings.smtp_host}
                        onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Port</label>
                      <input
                        type="text"
                        value={settings.smtp_port}
                        onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Email d'envoi</label>
                      <input
                        type="email"
                        value={settings.smtp_from_email}
                        onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                        placeholder="noreply@alprail.net"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Nom d'affichage</label>
                      <input
                        type="text"
                        value={settings.smtp_from_name}
                        onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                        placeholder="Alprail"
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton Sauvegarder */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#3776c5] text-white rounded-lg font-semibold hover:bg-[#2d5fa3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
                </button>
              </form>
            </div>

            {/* Test Email - 1 colonne */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <Send size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Tester un Email</h3>
                    <p className="text-xs text-slate-600">Envoyez un email de test</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Type d'email</label>
                    <select
                      value={testType}
                      onChange={(e) => setTestType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    >
                      <option value="welcome">Email de Bienvenue</option>
                      <option value="subscription">Confirmation d'Abonnement</option>
                      <option value="reminder">Rappel de Paiement</option>
                      <option value="payment">Confirmation de Paiement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Adresse email</label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendTest}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    <Send size={16} />
                    Envoyer l'email de test
                  </button>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 mb-1">Mode Test</p>
                        <p className="text-xs text-blue-700">
                          Les emails de test contiennent des données fictives pour vérifier le template et la configuration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}