'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberSidebar from '@/components/member/Sidebar';
import MemberHeader from '@/components/member/Header';
import Swal from 'sweetalert2';
import { Camera, Save, Mail, Phone } from 'lucide-react';

export default function MemberProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
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
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    setFormData({
      first_name: parsedUser.first_name || '',
      last_name: parsedUser.last_name || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
    });
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataPhoto = new FormData();
    formDataPhoto.append('profile_photo', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataPhoto,
      });

      const data = await res.json();

      if (data.success) {
        const updatedUser = { ...user, profile_photo: data.profile_photo };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        Swal.fire({
          icon: 'success',
          title: 'Photo mise à jour !',
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible d\'uploader la photo',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        Swal.fire({
          icon: 'success',
          title: 'Profil mis à jour !',
          confirmButtonColor: '#3776c5',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de mettre à jour',
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
        
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
              <p className="text-sm text-slate-600">Gérez vos informations</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              {/* Avatar */}
              <div className="flex items-center gap-4 pb-5 border-b border-slate-200 mb-5">
                <div className="relative">
                  {user.profile_photo ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${user.profile_photo}`} 
                      alt={user.first_name}
                      className="w-16 h-16 rounded-xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#3776c5] to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                  )}
                  
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#3776c5] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#2d5fa3] transition-all shadow-md">
                    <Camera size={14} className="text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{user.organization?.name}</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prénom</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Mail size={12} /> Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Phone size={12} /> Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3776c5]/20 focus:border-[#3776c5] outline-none"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#3776c5] to-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save size={14} />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}