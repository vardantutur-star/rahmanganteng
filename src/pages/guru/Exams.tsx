import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Plus, Trash2, Edit2, Loader2, Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Exams() {
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  async function fetchExams() {
    const { data } = await supabase.from('exams').select('*').order('id', { ascending: false });
    if (data) setExams(data);
    setLoading(false);
  }

  async function fetchQuestions() {
    const { data } = await supabase.from('questions').select('*');
    if (data) setQuestions(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedQuestions.length === 0) return alert('Pilih minimal 1 soal!');
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({ title, duration, created_by: user.id })
      .select()
      .single();

    if (!examError && exam) {
      const examQuestions = selectedQuestions.map(qid => ({
        exam_id: exam.id,
        question_id: qid
      }));

      await supabase.from('exam_questions').insert(examQuestions);
      setShowModal(false);
      fetchExams();
      setTitle('');
      setDuration(60);
      setSelectedQuestions([]);
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (confirm('Hapus ujian ini?')) {
      await supabase.from('exams').delete().eq('id', id);
      fetchExams();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Ujian</h1>
          <p className="text-gray-500">Jadwalkan dan kelola ujian siswa.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
        >
          <Plus size={20} />
          Buat Ujian
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : exams.map((exam) => (
          <motion.div 
            layout
            key={exam.id} 
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{exam.title}</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                  <Clock size={16} />
                  <span>Durasi: {exam.duration} Menit</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                  <Calendar size={16} />
                  <span>Dibuat: {new Date(exam.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <button 
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                  Lihat Detail <ArrowRight size={18} />
                </button>
              </div>
            </div>
            <FileText size={100} className="absolute -bottom-4 -right-4 text-gray-50 group-hover:text-red-50 transition-colors -z-0" />
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] flex flex-col"
            >
              <h2 className="text-2xl font-bold mb-6">Buat Ujian Baru</h2>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">Judul Ujian</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 border rounded-xl" placeholder="Ujian Akhir Semester..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">Durasi (Menit)</label>
                    <input required type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full p-4 bg-gray-50 border rounded-xl" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest">Pilih Soal ({selectedQuestions.length} Terpilih)</label>
                    <div className="text-xs font-bold text-primary italic uppercase underline cursor-pointer" onClick={() => setSelectedQuestions(questions.map(q => q.id))}>Pilih Semua</div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto p-2 bg-gray-50 rounded-2xl border">
                    {questions.map(q => (
                      <label key={q.id} className="flex items-start gap-4 p-4 bg-white border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedQuestions.includes(q.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedQuestions([...selectedQuestions, q.id]);
                            else setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                          }}
                          className="mt-1 w-5 h-5 rounded accent-primary"
                        />
                        <span className="text-sm font-medium">{q.question}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4 border-t sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-4 font-bold text-gray-400 hover:text-gray-600">Batal</button>
                  <button disabled={submitting} type="submit" className="flex-1 p-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-red-200 disabled:opacity-50">
                    {submitting ? 'Memproses...' : 'Simpan Ujian'}
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
