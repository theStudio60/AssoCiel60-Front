'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/member/Sidebar';
import MemberHeader from '@/components/member/Header';
import { Settings, Bell, Mail, Globe, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function MemberSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    newsletter_frequency: 'immediate',
    notifications_enabled: true,
    language: 'fr',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'member') {
      router.push('/admin/dashboard');
      return;
    }

    setUser(parsedUser);
    
    // Charger les paramètres actuels de l'utilisateur
    setSettings({
      newsletter_frequency: parsedUser.newsletter_frequency || 'immediate',
      notifications_enabled: parsedUser.notifications_enabled !== false,
      language: parsedUser.language || 'fr',
    });
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/member/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        // Mettre à jour le localStorage
        const updatedUser = { ...user, ...settings };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        Swal.fire({
          icon: 'success',
          title: 'Paramètres sauvegardés !',
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MemberSidebar />
      
      <div className="flex-1">
        <MemberHeader />
        
        <main className="p-4">
          {/* Page Title */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">Mes Paramètres</h1>
            <p className="text-xs text-slate-600 mt-0.5">Personnalisez votre expérience</p>
          </div>

          <div className="max-w-3xl">
            {/* Newsletter */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Newsletter</h2>
                  <p className="text-xs text-slate-600">Recevez nos actualités par email</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Fréquence de réception
                </label>
                <select
                  value={settings.newsletter_frequency}
                  onChange={(e) => setSettings({ ...settings, newsletter_frequency: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5]"
                >
                  <option value="immediate">Immédiat (dès publication)</option>
                  <option value="biweekly">Bimensuel (toutes les 2 semaines)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Choisissez la fréquence à laquelle vous souhaitez recevoir nos actualités
                </p>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Bell size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                  <p className="text-xs text-slate-600">Gérez vos alertes et notifications</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Activer les notifications</p>
                  <p className="text-xs text-slate-600">Recevez des alertes pour les événements importants</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications_enabled ? 'bg-[#3776c5]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Langue */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Globe size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Langue</h2>
                  <p className="text-xs text-slate-600">Choisissez votre langue préférée</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Langue de l'interface
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5]"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  La langue sera appliquée à toute l'interface
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3776c5] to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}