import React, { useEffect, useState } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import { Users, FileText, HelpCircle, GraduationCap, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  profile: Profile | null;
}

export default function Dashboard({ profile }: DashboardProps) {
  const [stats, setStats] = useState({
    users: 0,
    exams: 0,
    questions: 0,
    activeExams: 0,
    completedExams: 0,
  });

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  async function fetchStats() {
    // Basic counts
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: examCount } = await supabase.from('exams').select('*', { count: 'exact', head: true });
    const { count: questionCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    
    // Role specific
    if (profile?.role === 'siswa') {
      const { count: completed } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);
      
      setStats(prev => ({ ...prev, completedExams: completed || 0 }));
    }

    setStats(prev => ({
      ...prev,
      users: userCount || 0,
      exams: examCount || 0,
      questions: questionCount || 0,
    }));
  }

  const cards = [
    { label: 'Total User', value: stats.users, icon: Users, color: 'bg-blue-500', roles: ['admin'] },
    { label: 'Bank Soal', value: stats.questions, icon: HelpCircle, color: 'bg-purple-500', roles: ['admin', 'guru'] },
    { label: 'Ujian Dibuat', value: stats.exams, icon: FileText, color: 'bg-green-500', roles: ['admin', 'guru'] },
    { label: 'Ujian Selesai', value: stats.completedExams, icon: CheckCircle, color: 'bg-primary', roles: ['siswa'] },
    { label: 'Ujian Tersedia', value: stats.exams, icon: Clock, color: 'bg-orange-500', roles: ['siswa'] },
  ].filter(c => c.roles.includes(profile?.role || ''));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Halo, {profile?.name}! 👋</h1>
        <p className="text-gray-500 mt-2">Selamat datang kembali di sistem CBT SMK Prima Unggul.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card-bg p-6 rounded-2xl border border-border shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm", card.color)}>
              <card.icon size={24} />
            </div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{card.label}</p>
            <p className="text-4xl font-extrabold text-text-main mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {profile?.role === 'siswa' && (
        <div className="bg-[#0F172A] rounded-2xl p-10 text-white relative overflow-hidden shadow-xl border border-border">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold mb-4 italic">Siap Ujian Hari Ini?</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Pastikan koneksi internet Anda stabil dan bismillah sebelum mengerjakan. 
              Gunakan waktu sebaik mungkin untuk hasil maksimal.
            </p>
            <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20">
              Lihat Daftar Ujian
            </button>
          </div>
          <GraduationCap size={240} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
        </div>
      )}
    </div>
  );
}
