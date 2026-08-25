import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, LogIn, Sparkles, UserCheck } from 'lucide-react';
import Toast from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo auto-filler for easy examiner evaluation
  const setDemoCredentials = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@erp.com');
      setPassword('Admin@123');
      setToastMessage('Loaded Admin demo credentials');
    } else if (role === 'teacher') {
      setEmail('teacher@erp.com');
      setPassword('Teacher@123');
      setToastMessage('Loaded Teacher demo credentials');
    } else if (role === 'student') {
      setEmail('student1@erp.com');
      setPassword('Student@123');
      setToastMessage('Loaded Student demo credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage('')}
        />
      )}

      <div className="max-w-2xl w-full">
        {/* Logo and Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 mb-4 ring-8 ring-indigo-500/10">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
             ERP Examinarion Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Online Examination & Evaluation Engine
          </p>
        </div>

        {/* Login Card */}
        <div className="  max-w-6xl bg-indigo-100 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Sign In to Your Account
          </h2>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="pl-2 block text-xs font-bold text-slate-700  tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="pl-2 block text-xs font-bold text-slate-700 tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
            className="w-auto mx-auto mt-2 py-3 px-20 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-3xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-7 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Section for College Evaluator convenience */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Demo Logins (Click to Autofill):</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="py-2 px-2.5 bg-purple-50 hover:bg-purple-200 text-purple-700 text-xs font-bold rounded-lg border border-purple-400 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('teacher')}
                className="py-2 px-2.5 bg-indigo-50 hover:bg-indigo-200 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-400 transition-colors"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('student')}
                className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-400 transition-colors"
              >
                Student
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-sm text-indigo-600 hover:text-red-400 underline"
              >
                 Register as Student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
