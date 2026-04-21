import React, { useEffect, useState } from 'react';
import { supabase, type Profile } from '../../lib/supabase';
import { BookOpen, Clock, ArrowRight, Loader2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

interface SiswaExamsProps {
  profile: Profile;
}

export default function SiswaExams({ profile }: SiswaExamsProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamsAndResults();
  }, []);

  async function fetchExamsAndResults() {
    const { data: examData } = await supabase.from('exams').select('*');
    const { data: resultData } = await supabase.from('results').select('*').eq('user_id', profile.id);
    
    if (examData) setExams(examData);
    if (resultData) setResults(resultData);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold italic">Daftar Ujian Tersedia</h1>
        <p className="text-gray-500 mt-2">Pilih ujian yang ingin Anda kerjakan hari ini.</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : exams.length === 0 ? (
        <div className="bg-white border rounded-[2rem] p-20 text-center text-gray-400">
          <BookOpen size={64} className="mx-auto mb-4 opacity-10" />
          <p className="text-xl font-medium">Belum ada ujian yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const result = results.find(r => r.exam_id === exam.id);
            const isCompleted = !!result;

            return (
              <motion.div 
                key={exam.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card-bg rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
              >
                <div className="p-8 pb-4">
                  <div className="flex items-center gap-2 text-primary font-extrabold text-[10px] uppercase tracking-widest mb-4">
                    <Clock size={12} />
                    <span>{exam.duration} Menit</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-main mb-2 tracking-tight">{exam.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    Ujian ini bersifat rahasia. Pastikan Anda sudah siap secara teknis dan mental.
                  </p>
                </div>

                <div className="mt-auto p-8 pt-4">
                  {isCompleted ? (
                    <div className="bg-[#F1F5F9] p-4 rounded-xl border border-border flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Skor</p>
                        <p className="text-2xl font-black text-text-main">{result.score}</p>
                      </div>
                      <div className="text-text-muted font-bold text-xs">SELESAI</div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate(`/exam/${exam.id}`)}
                      className="w-full bg-[#0F172A] hover:bg-black text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all group"
                    >
                      Mulai Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
