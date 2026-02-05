'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Shield, Plus, Search, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  profile_photo: string | null;
}

interface Stats {
  total: number;
  active_today: number;
  created_this_month: number;
}

export default function AdminsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active_today: 0,
    created_this_month: 0,
  });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
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
    fetchStats();
    fetchAdmins();
  }, [router]);

  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchAdmins();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [search]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (admin?: Admin) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        phone: admin.phone || '',
        password: '',
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    const url = editingAdmin
      ? `${process.env.NEXT_PUBLIC_API_URL}/admin/admins/${editingAdmin.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/admin/admins`;
    
    const res = await fetch(url, {
      method: editingAdmin ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    
    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: editingAdmin ? 'Modifié !' : 'Créé !',
        text: data.message,
        confirmButtonColor: '#3776c5',
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      fetchAdmins();
      fetchStats();
    } else {
      // Gérer les erreurs de validation
      if (data.errors) {
        // Afficher les erreurs spécifiques
        const errorMessages = Object.values(data.errors).flat().join('\n');
        Swal.fire({
          icon: 'error',
          title: 'Erreur de validation',
          html: errorMessages.split('\n').map(msg => `<div class="text-sm">${msg}</div>`).join(''),
          confirmButtonColor: '#ef4444',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: data.message || 'Une erreur est survenue',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Erreur de connexion au serveur',
      confirmButtonColor: '#ef4444',
    });
  }
};

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Supprimer cet admin ?',
      text: `Êtes-vous sûr de vouloir supprimer ${name} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();
        
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Supprimé !',
            confirmButtonColor: '#3776c5',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchAdmins();
          fetchStats();
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
      }
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <main className="p-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">Gestion des Administrateurs</h1>
            <p className="text-xs text-slate-600 mt-0.5">Gérer les comptes administrateurs</p>
          </div>

          {/* Top Bar */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-[#3776c5] text-white rounded-lg font-semibold hover:bg-[#2d5fa3] transition-all text-xs"
              >
                <Plus size={14} />
                Nouvel Admin
              </button>
              
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3776c5]/30"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase font-semibold">Admin</th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase font-semibold">Email</th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase font-semibold">Téléphone</th>
                  <th className="px-3 py-3 text-left text-[11px] text-slate-900 uppercase font-semibold">Créé le</th>
                  <th className="px-3 py-3 text-center text-[11px] text-slate-900 uppercase font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-600">Chargement...</td></tr>
                ) : admins.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-600">Aucun admin trouvé</td></tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {admin.profile_photo ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${admin.profile_photo}`}
                              alt={admin.first_name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3776c5] to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                              {admin.first_name?.[0]}{admin.last_name?.[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{admin.first_name} {admin.last_name}</p>
                            {admin.id === user.id && (
                              <span className="text-[9px] text-blue-600 font-semibold">(Vous)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-slate-600">{admin.email}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-slate-600">{admin.phone || '-'}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-slate-600">
                          {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(admin)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={14} className="text-blue-600" />
                          </button>
                          {admin.id !== user.id && (
                            <button
                              onClick={() => handleDelete(admin.id, `${admin.first_name} ${admin.last_name}`)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-[#3776c5] to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">
                {editingAdmin ? 'Modifier Admin' : 'Nouvel Admin'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/30"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/30"
                />
              </div>

              {!editingAdmin && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3776c5]/30"
                      required={!editingAdmin}
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimum 8 caractères</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-[#3776c5] text-white hover:bg-[#2d5fa3] rounded-lg"
                >
                  {editingAdmin ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}