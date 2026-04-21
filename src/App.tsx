/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { supabase, type Profile } from './lib/supabase';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardPage from './pages/Dashboard';
import Shell from './components/layout/Shell';

// Admin
import AdminUsers from './pages/admin/Users';
import AdminExams from './pages/admin/Exams';
import AdminQuestions from './pages/admin/Questions';

// Guru
import GuruQuestions from './pages/guru/Questions';
import GuruExams from './pages/guru/Exams';

// Siswa
import SiswaExams from './pages/siswa/Exams';
import SiswaExamRoom from './pages/siswa/ExamRoom';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(id: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, we might want to sign out or show a setup screen
        // For now, we'll just stop loading so the UI can handle the null profile
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle case where session exists but profile doesn't load
  const isAuthenticated = !!profile;
  const isActuallyAuthenticated = !!supabase.auth.getSession(); // Rough check

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!profile ? <Login /> : <Navigate to="/app" />} />
        
        <Route path="/app" element={profile ? <Shell profile={profile} /> : <Navigate to="/login" />}>
          <Route index element={<DashboardPage profile={profile} />} />
          
          <Route path="questions" element={
            ['admin', 'guru'].includes(profile?.role || '') 
              ? <GuruQuestions /> as any
              : <Navigate to="/app" />
          } />

          {/* Admin Routes */}
          {profile?.role === 'admin' && (
            <>
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/exams" element={<AdminExams />} />
            </>
          )}

          {/* Guru Routes */}
          {profile?.role === 'guru' && (
            <>
              <Route path="guru/exams" element={<GuruExams />} />
            </>
          )}

          {/* Siswa Routes */}
          {profile?.role === 'siswa' && (
            <>
              <Route path="siswa/exams" element={<SiswaExams profile={profile} />} />
            </>
          )}
        </Route>

        {/* Special Route: Exam Room (Full screen, no Shell) */}
        <Route 
          path="/exam/:examId" 
          element={profile?.role === 'siswa' ? <SiswaExamRoom profile={profile} /> : <Navigate to="/login" />} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
