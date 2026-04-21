import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { HelpCircle, Plus, Trash2, Edit2, Loader2, Search, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function Questions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Auto hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setQuestions(data);
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Gagal mengambil data soal.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak ditemukan.');

      // Validation
      if (!formData.question || !formData.option_a || !formData.option_b || !formData.option_c || !formData.option_d) {
        throw new Error('Semua field wajib diisi.');
      }

      if (editingId) {
        const { error } = await supabase
          .from('questions')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        setNotification({ type: 'success', message: 'Soal berhasil diperbarui.' });
      } else {
        const { error } = await supabase
          .from('questions')
          .insert({ ...formData, created_by: user.id });
        
        if (error) throw error;
        setNotification({ type: 'success', message: 'Soal berhasil ditambahkan ke bank soal.' });
      }

      setShowModal(false);
      setFormData({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' });
      setEditingId(null);
      fetchQuestions();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Terjadi kesalahan saat menyimpan data.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      try {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) throw error;
        setNotification({ type: 'success', message: 'Soal berhasil dihapus.' });
        fetchQuestions();
      } catch (err: any) {
        setNotification({ type: 'error', message: 'Gagal menghapus soal.' });
      }
    }
  }

  const filtered = questions.filter(q => q.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-4 right-4 z-[110] p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 max-w-sm",
              notification.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
            )}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <p className="font-bold text-sm tracking-tight">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100 transition-opacity">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main">Bank Soal</h1>
          <p className="text-text-muted mt-1 font-medium">Kelola kumpulan soal ujian sekolah.</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-red-500/20"
        >
          <Plus size={20} />
          Tambah Soal
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Cari pertanyaan soal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-text-muted font-bold animate-pulse">Memuat bank soal...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.length === 0 ? (
            <div className="py-20 text-center bg-card-bg rounded-2xl border border-dashed border-border p-10">
              <HelpCircle size={48} className="mx-auto text-text-muted mb-4" />
              <h3 className="text-lg font-bold text-text-main">Belum Ada Soal</h3>
              <p className="text-text-muted">Klik "Tambah Soal" untuk mulai mengisi bank soal.</p>
            </div>
          ) : filtered.map((q) => (
            <motion.div 
              layout
              key={q.id} 
              className="bg-card-bg p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 bg-[#F1F5F9] text-text-muted rounded-lg flex items-center justify-center text-xs font-black">
                    #{q.id.slice(0, 4)}
                  </span>
                  <p className="text-lg font-bold text-text-main leading-relaxed">{q.question}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt} className={cn(
                      "p-3 rounded-xl border text-sm flex items-center justify-between transition-all",
                      q.correct_answer === opt 
                        ? "bg-[rgba(225,29,72,0.05)] border-primary text-primary font-bold" 
                        : "bg-[#F8FAFC] border-border text-text-muted"
                    )}>
                      <span><b className="uppercase mr-2 opacity-50">{opt}.</b> {q[`option_${opt}` as keyof typeof q]}</span>
                      {q.correct_answer === opt && <CheckCircle2 size={16} />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex md:flex-col gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-6 justify-center">
                <button 
                  onClick={() => {
                    setEditingId(q.id);
                    setFormData({
                      question: q.question,
                      option_a: q.option_a,
                      option_b: q.option_b,
                      option_c: q.option_c,
                      option_d: q.option_d,
                      correct_answer: q.correct_answer
                    });
                    setShowModal(true);
                  }}
                  className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                  title="Edit Soal"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(q.id)}
                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                  title="Hapus Soal"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setShowModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card-bg rounded-[2rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto border border-border"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black italic text-text-main">{editingId ? 'Edit Pertanyaan' : 'Buat Soal Baru'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Pertanyaan Soal</label>
                  <textarea 
                    required 
                    value={formData.question} 
                    onChange={e => setFormData({...formData, question: e.target.value})} 
                    className="w-full p-4 bg-[#F8FAFC] border border-border rounded-xl min-h-[120px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-medium" 
                    placeholder="Contoh: Apa kepanjangan dari CPU?" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <div key={opt}>
                      <label className="block text-[10px] font-bold text-text-muted mb-2 uppercase tracking-widest">Opsi {opt}</label>
                      <input 
                        required 
                        value={formData[`option_${opt}` as keyof typeof formData]} 
                        onChange={e => setFormData({...formData, [`option_${opt}`]: e.target.value})} 
                        className="w-full p-4 bg-[#F8FAFC] border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium" 
                        placeholder={`Pilihan ${opt.toUpperCase()}...`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-4 uppercase tracking-widest">Pilih Jawaban Benar</label>
                  <div className="flex flex-wrap justify-between gap-2">
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <button 
                        key={opt}
                        type="button"
                        onClick={() => setFormData({...formData, correct_answer: opt})}
                        className={cn(
                          "flex-1 h-16 rounded-xl font-black uppercase transition-all flex items-center justify-center border-2 text-lg",
                          formData.correct_answer === opt 
                            ? "bg-primary text-white border-primary shadow-lg shadow-red-500/20 scale-105" 
                            : "bg-white border-border text-text-muted hover:border-gray-300"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 flex gap-4 border-t border-border">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 font-bold text-text-muted hover:text-text-main transition-colors">Batal</button>
                  <button 
                    disabled={submitting} 
                    type="submit" 
                    className="flex-1 p-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : null}
                    {submitting ? 'Menyimpan...' : 'Simpan ke Bank Soal'}
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
