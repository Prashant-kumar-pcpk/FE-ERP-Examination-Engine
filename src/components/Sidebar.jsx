import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  PlusCircle,
  Award,
  User,
  X,
  GraduationCap
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isTeacher, isStudent } = useAuth();

  const getNavLinks = () => {
    const common = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ];

    if (isAdmin) {
      return [
        ...common,
        { name: 'Subjects', path: '/subjects', icon: BookOpen },
        { name: 'All Exams', path: '/exams', icon: FileSpreadsheet },
        { name: 'Create Exam', path: '/exams/create', icon: PlusCircle },
        { name: 'Results & Attempts', path: '/results', icon: Award },
        { name: 'My Profile', path: '/profile', icon: User }
      ];
    }

    if (isTeacher) {
      return [
        ...common,
        { name: 'Subjects', path: '/subjects', icon: BookOpen },
        { name: 'My Exams', path: '/exams', icon: FileSpreadsheet },
        { name: 'Create Exam', path: '/exams/create', icon: PlusCircle },
        { name: 'Student Results', path: '/results', icon: Award },
        { name: 'My Profile', path: '/profile', icon: User }
      ];
    }

    // Student
    return [
      ...common,
      { name: 'Exams Portal', path: '/exams', icon: FileSpreadsheet },
      { name: 'My Results', path: '/results', icon: Award },
      { name: 'Subjects', path: '/subjects', icon: BookOpen },
      { name: 'My Profile', path: '/profile', icon: User }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header with logo & close */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-slate-900 block leading-tight truncate">ERP System</span>
              <span className="text-[10px] font-semibold text-indigo-600 block uppercase tracking-wider truncate">Examination Engine</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview */}
        <div className="p-3.5 mx-3 my-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <span className="inline-block text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-0.5">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/dashboard' || link.path === '/exams'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom meta */}
        <div className="p-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">Exam Engine v1.0 • School ERP</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
