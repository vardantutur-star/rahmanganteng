import { Link } from 'react-router-dom';
import { BookOpen, Monitor, Code, Palette, DollarSign, Radio, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const JURUSAN = [
  { name: 'TKJ', desc: 'Teknik Komputer & Jaringan', icon: Monitor, color: 'bg-blue-500' },
  { name: 'DKV', desc: 'Desain Komunikasi Visual', icon: Palette, color: 'bg-purple-500' },
  { name: 'AK', desc: 'Akuntansi', icon: DollarSign, color: 'bg-green-500' },
  { name: 'BC', desc: 'Broadcasting', icon: Radio, color: 'bg-red-500' },
  { name: 'MPLB', desc: 'Manajemen Perkantoran & Layanan Bisnis', icon: Briefcase, color: 'bg-orange-500' },
  { name: 'BD', desc: 'Bisnis Digital', icon: TrendingUp, color: 'bg-cyan-500' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <BookOpen size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">SMK PRIMA UNGGUL</span>
          </div>
          <Link 
            to="/login" 
            className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-red-600 transition-all shadow-lg shadow-red-200"
          >
            Masuk ke Aplikasi
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
          >
            Sistem Ujian Online <br />
            <span className="text-primary italic">Terpercaya & Efisien</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-10"
          >
            Platform CBT eksklusif untuk seluruh civitas akademika SMK Prima Unggul. 
            Kelola soal, kerjakan ujian, dan pantau hasil secara real-time.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/login" className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all">
              Mulai Sekarang <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Jurusan Section */}
      <section className="py-20 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Jurusan Unggulan</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {JURUSAN.map((j, i) => (
              <motion.div
                key={j.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`${j.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <j.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">{j.name}</h3>
                <p className="text-gray-500 leading-relaxed">{j.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 SMK Prima Unggul. Built for Excellence.</p>
        </div>
      </footer>
    </div>
  );
}
