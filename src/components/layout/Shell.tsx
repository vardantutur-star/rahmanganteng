import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase, type Profile } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  LogOut, 
  GraduationCap, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface ShellProps {
  profile: Profile;
}

export default function Shell({ profile }: ShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/app', roles: ['admin', 'guru', 'siswa'] },
    // Admin Only
    { label: 'Manajemen User', icon: Users, path: '/app/admin/users', roles: ['admin'] },
    { label: 'Manajemen Ujian', icon: FileText, path: '/app/admin/exams', roles: ['admin'] },
    // Guru & Admin (Bank Soal)
    { label: 'Bank Soal', icon: HelpCircle, path: '/app/questions', roles: ['admin', 'guru'] },
    // Guru Only
    { label: 'Buat Ujian', icon: FileText, path: '/app/guru/exams', roles: ['guru'] },
    // Siswa Only
    { label: 'Daftar Ujian', icon: BookOpen, path: '/app/siswa/exams', roles: ['siswa'] },
  ].filter(item => item.roles.includes(profile.role));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-card-bg border-r border-border transition-transform lg:translate-x-0 lg:static lg:block",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center font-bold">
              U
            </div>
            <div>
              <h1 className="font-bold text-sm text-[#0F172A] leading-tight uppercase tracking-wider">SMK Prima Unggul</h1>
              <p className="text-[11px] text-text-muted font-medium">CBT Platform</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                  location.pathname === item.path 
                    ? "bg-primary text-white" 
                    : "text-text-muted hover:bg-[#F1F5F9] hover:text-text-main"
                )}
              >
                <item.icon size={18} className={cn(
                  "transition-colors",
                  location.pathname === item.path ? "text-white" : "text-text-muted group-hover:text-text-main"
                )} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-5 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FDEAF1] border-2 border-white flex items-center justify-center text-primary font-bold">
                {profile.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main truncate max-w-[140px]">{profile.name}</p>
                <p className="text-xs text-text-muted font-medium capitalize">{profile.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] border-b border-border bg-card-bg/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden lg:block">
            <span className="text-text-muted text-sm">
              Dashboard &raquo; <b className="text-text-main">{menuItems.find(i => i.path === location.pathname)?.label || 'Utama'}</b>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handleLogout}
              className="text-text-muted text-sm font-semibold hover:text-text-main transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
