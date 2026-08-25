import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Award, CheckCircle2, GraduationCap } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Account details, role authorizations, and ERP identification.
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-8 min-w-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-slate-100 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg shadow-indigo-200 flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 break-words">{user?.name}</h2>
              <span className="px-2.5 sm:px-3 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium break-words">{user?.email}</p>
            <p className="text-xs text-slate-400 break-words">
              Account ID: <span className="font-mono text-slate-600 break-all">{user?._id}</span>
            </p>
          </div>
        </div>

        {/* Profile Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-5 sm:pt-6">
          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Full Name
              </span>
              <span className="text-sm font-bold text-slate-800 break-words block">{user?.name}</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs flex-shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Email Address
              </span>
              <span className="text-sm font-bold text-slate-800 break-words block">{user?.email}</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Access Permissions
              </span>
              <span className="text-sm font-bold text-slate-800 capitalize break-words block">
                {user?.role} (Full Access)
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Member Since
              </span>
              <span className="text-sm font-bold text-slate-800 break-words block">
                {user?.createdAt ? formatDate(user.createdAt, false) : 'Recently Registered'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
