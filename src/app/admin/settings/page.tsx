'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Save, Settings as SettingsIcon, Globe, Mail, Phone, MapPin, DollarSign, FileText, Shield, Bell, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Settings {
  site_name: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  currency: string;
  tax_rate: string;
  invoice_prefix: string;
  enable_2fa: boolean;
  enable_newsletter: boolean;
  maintenance_mode: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    site_name: '',
    site_email: '',
    site_phone: '',
    site_address: '',
    currency: 'CHF',
    tax_rate: '0',
    invoice_prefix: 'INV-',
    enable_2fa: true,
    enable_newsletter: true,
    maintenance_mode: false,
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
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

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <main className="p-4">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Paramètres</h1>
            <p className="text-xs text-slate-600 mt-0.5">Configurez les paramètres de votre plateforme</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Informations Générales */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3776c5] to-indigo-600 flex items-center justify-center">
                  <Globe size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Informations Générales</h2>
                  <p className="text-xs text-slate-600">Informations de base de votre organisation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Globe size={14} />
                    Nom du site
                  </label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Mail size={14} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.site_email}
                    onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Phone size={14} />
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={settings.site_phone}
                    onChange={(e) => setSettings({ ...settings, site_phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <MapPin size={14} />
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={settings.site_address}
                    onChange={(e) => setSettings({ ...settings, site_address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Paramètres Financiers */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Paramètres Financiers</h2>
                  <p className="text-xs text-slate-600">Configuration des tarifs et factures</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign size={14} />
                    Devise
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                  >
                    <option value="CHF">CHF (Franc Suisse)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <FileText size={14} />
                    Taux de taxe (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.tax_rate}
                    onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <FileText size={14} />
                    Préfixe factures
                  </label>
                  <input
                    type="text"
                    value={settings.invoice_prefix}
                    onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Paramètres Système */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <SettingsIcon size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Paramètres Système</h2>
                  <p className="text-xs text-slate-600">Configuration des fonctionnalités</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-[#3776c5]" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Authentification 2FA</p>
                      <p className="text-xs text-slate-600">Activer l'authentification à deux facteurs</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enable_2fa}
                      onChange={(e) => setSettings({ ...settings, enable_2fa: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3776c5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3776c5]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Newsletter</p>
                      <p className="text-xs text-slate-600">Activer l'envoi de newsletters</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enable_newsletter}
                      onChange={(e) => setSettings({ ...settings, enable_newsletter: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3776c5]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-orange-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Mode Maintenance</p>
                      <p className="text-xs text-slate-600">Désactiver temporairement le site</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenance_mode}
                      onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Bouton Sauvegarder */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#3776c5] text-white rounded-lg font-semibold hover:bg-[#2d5fa3] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}