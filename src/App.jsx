import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exams from './pages/Exams';
import CreateExam from './pages/CreateExam';
import EditExam from './pages/EditExam';
import QuestionManager from './pages/QuestionManager';
import TakeExam from './pages/TakeExam';
import ExamResult from './pages/ExamResult';
import Results from './pages/Results';
import Subjects from './pages/Subjects';
import Profile from './pages/Profile';

/**
 * Standard Dashboard Shell with Responsive Sidebar & Top Navigation Bar
 */
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:pl-64 transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Exam Engine (Distraction-Free Dedicated Viewport) */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/take-exam/:examId" element={<TakeExam />} />
        </Route>

        {/* Protected ERP Shell Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/results" element={<Results />} />
            <Route path="/exam-result/:attemptId" element={<ExamResult />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin & Teacher Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
              <Route path="/exams/create" element={<CreateExam />} />
              <Route path="/exams/edit/:id" element={<EditExam />} />
              <Route path="/exams/:examId/questions" element={<QuestionManager />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
