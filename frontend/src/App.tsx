import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Learning from './pages/Learning';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import Courses from './pages/Courses';
import CoursePlayer from './pages/CoursePlayer';
import Landing from './pages/Landing';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-medium animate-pulse">Initializing LearnMind AI...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <SignedIn>
        <AuthProvider>
          <AuthGuard>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 p-6 overflow-y-auto">
                {children}
              </main>
            </div>
          </AuthGuard>
        </AuthProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <>
            <SignedIn><Navigate to="/dashboard" replace /></SignedIn>
            <SignedOut><Login /></SignedOut>
          </>
        } />
        <Route path="/*" element={
          <Routes>
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/learn" element={<ProtectedLayout><Learning /></ProtectedLayout>} />
            <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
            <Route path="/goals" element={<ProtectedLayout><Goals /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
            <Route path="/courses" element={<ProtectedLayout><Courses /></ProtectedLayout>} />
            <Route path="/player/:id" element={<ProtectedLayout><CoursePlayer /></ProtectedLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
