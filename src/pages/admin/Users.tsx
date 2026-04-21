import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Trash2, Edit2, Shield, User, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'guru' | 'siswa'>('siswa');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (!error) setUsers(data);
    setLoading(false);
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // Note: In real app, you would use a Supabase Edge Function to create users
    // Because client-side signup logs you in.
    // However, for this demo, we'll try to use signUp or inform user.
    // Using Supabase Auth API as admin requires service role which isn't safe client-side.
    // We'll simulate profile creation.
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });

    if (authError) {
      alert(authError.message);
    } else if (authData.user) {
      // Profile is usually created by trigger in DB, but we'll insert just in case
      const { error: profError } = await supabase
        .from('profiles')
        .upsert({ id: authData.user.id, name, role });
      
      if (!profError) {
        setShowAddModal(false);
        fetchUsers();
      }
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus user ini?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchUsers();
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen User</h1>
          <p className="text-gray-500">Total {users.length} pengguna terdaftar.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
        >
          <UserPlus size={20} />
          Tambah User
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Cari user berdasarkan nama atau role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      </div>

      <div className="bg-card-bg rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary" size={40} />
                  </td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center font-bold text-text-main">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold text-text-main">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' ? <Shield size={16} className="text-primary" /> : <User size={16} className="text-blue-500" />}
                      <span className="capitalize text-sm font-medium text-text-main">{u.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-mono text-text-muted">{u.id}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit2 size={18} /></button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 italic">Tambah Pengguna Baru</h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest">Nama Lengkap</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest">Email</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest">Password</label>
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full p-4 bg-gray-50 border rounded-xl appearance-none">
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">Batal</button>
                  <button disabled={submitting} type="submit" className="flex-1 p-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-200 disabled:opacity-50">
                    {submitting ? 'Memproses...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
