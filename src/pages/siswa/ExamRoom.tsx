import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Profile } from '../../lib/supabase';
import { Clock, Loader2, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SiswaExamRoomProps {
  profile: Profile;
}

export default function SiswaExamRoom({ profile }: SiswaExamRoomProps) {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchExamData();
    
    // Warn before leave
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !loading && exam) {
      handleAutoSubmit();
    }
  }, [timeLeft, loading, exam]);

  async function fetchExamData() {
    // 1. Get Exam
    const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
    if (!examData) return navigate('/app');

    // 2. Check if already finished
    const { data: existingResult } = await supabase.from('results').select('*').eq('user_id', profile.id).eq('exam_id', examId).single();
    if (existingResult) return navigate('/app/siswa/exams');

    // 3. Get Questions via junction table
    const { data: eqData } = await supabase.from('exam_questions').select('question_id').eq('exam_id', examId);
    if (!eqData) return;

    const qIds = eqData.map(r => r.question_id);
    const { data: qData } = await supabase.from('questions').select('*').in('id', qIds);
    
    if (examData && qData) {
      setExam(examData);
      setQuestions(qData);
      setTimeLeft(examData.duration * 60);
    }
    setLoading(false);
  }

  async function handleAutoSubmit() {
    alert('Waktu habis! Jawaban Anda akan dikirim otomatis.');
    await finishExam();
  }

  async function finishExam() {
    setIsSubmitting(true);
    let correctCount = 0;
    
    // Calculate Score
    const answerData = questions.map(q => {
      const isCorrect = answers[q.id] === q.correct_answer;
      if (isCorrect) correctCount++;
      return {
        user_id: profile.id,
        exam_id: exam.id,
        question_id: q.id,
        answer: answers[q.id] || ''
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // Save Results
    await supabase.from('answers').insert(answerData);
    await supabase.from('results').insert({
      user_id: profile.id,
      exam_id: exam.id,
      score: score
    });

    navigate('/app/siswa/exams');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="animate-spin text-primary mb-4" size={60} />
        <h2 className="text-2xl font-bold">Mempersiapkan Ruang Ujian...</h2>
        <p className="text-gray-500 mt-2">Mohon tunggu, jangan tutup halaman ini.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="min-h-screen bg-soft-bg flex flex-col">
      {/* Header Room */}
      <header className="h-[72px] bg-card-bg border-b border-border px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-sm capitalize">
            Ujian &raquo; <b className="text-text-main">{exam.title}</b>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className={cn(
            "timer-badge flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm",
            timeLeft < 300 ? "bg-primary text-white animate-pulse" : "bg-[rgba(225,29,72,0.1)] text-primary"
          )}>
            <span>⏱</span> {formatTime(timeLeft)}
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/login');
            }}
            className="text-text-muted text-sm font-semibold hover:text-text-main transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Main Section */}
        <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 max-w-7xl mx-auto w-full">
          <section className="bg-card-bg rounded-2xl border border-border p-8 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F1F5F9]">
              <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                Soal No. {currentIndex + 1} dari {questions.length}
              </span>
              <span className="text-text-muted text-xs">Bobot: 2.5 Poin</span>
            </div>

            <div className="mb-8">
              <h2 className="text-lg md:text-xl font-medium leading-relaxed text-text-main">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3">
              {['a', 'b', 'c', 'd'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswers({...answers, [currentQuestion.id]: opt})}
                  className={cn(
                    "w-full p-4 rounded-xl border flex items-center gap-4 transition-all group",
                    answers[currentQuestion.id] === opt 
                      ? "border-primary bg-[rgba(225,29,72,0.05)] border-2" 
                      : "border-border hover:border-primary hover:bg-[rgba(225,29,72,0.02)]"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm transition-colors",
                    answers[currentQuestion.id] === opt ? "bg-primary text-white" : "bg-[#F1F5F9] text-text-main"
                  )}>
                    {opt.toUpperCase()}
                  </div>
                  <span className="font-medium text-text-main">{currentQuestion[`option_${opt}`]}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto pt-8 flex items-center justify-between border-t border-[#F1F5F9]">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="px-6 py-3 rounded-lg border border-border bg-white text-text-main font-semibold disabled:opacity-30 transition-all hover:bg-gray-50"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-8 py-3 rounded-lg bg-primary text-white font-semibold transition-all hover:bg-primary-dark shadow-lg shadow-red-200"
              >
                Selanjutnya
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="bg-card-bg rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text-main mb-1">Navigasi Soal</h3>
              <p className="text-xs text-text-muted mb-4">Klik nomor untuk berpindah soal</p>
              
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center font-bold text-sm transition-all border",
                      currentIndex === i ? "border-primary text-primary" : 
                      answers[questions[i].id] ? "bg-[#F1F5F9] text-text-main border-border" : "bg-white border-border text-text-muted hover:border-gray-400"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[#F1F5F9] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[2px] bg-[#F1F5F9] border border-border"></div>
                  <span className="text-xs text-text-main">Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[2px] border border-primary"></div>
                  <span className="text-xs text-text-main">Sedang Dikerjakan</span>
                </div>
                <button 
                  onClick={() => setShowConfirm(true)}
                  className="w-full py-3.5 rounded-lg bg-[#0F172A] text-white font-bold text-sm hover:bg-black transition-all shadow-lg"
                >
                  Selesaikan Ujian
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 text-center"
            >
              <div className="bg-red-50 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-4 italic">Selesaikan Ujian?</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Pastikan seluruh soal telah terjawab. Setelah terkirim, Anda tidak dapat mengubah jawaban lagi.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 p-4 font-bold text-gray-400 hover:text-gray-600">Batal</button>
                <button 
                  disabled={isSubmitting}
                  onClick={finishExam} 
                  className="flex-1 p-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Ya, Kirim'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
