import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Award, CheckCircle2, GraduationCap } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Account details, role authorizations, and ERP identification.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <span className="px-3 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
            <p className="text-xs text-slate-400">
              Account ID: <span className="font-mono text-slate-600">{user?._id}</span>
            </p>
          </div>
        </div>

        {/* Profile Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Full Name
              </span>
              <span className="text-sm font-bold text-slate-800">{user?.name}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Email Address
              </span>
              <span className="text-sm font-bold text-slate-800">{user?.email}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Access Permissions
              </span>
              <span className="text-sm font-bold text-slate-800 capitalize">
                {user?.role} (Full Access)
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Member Since
              </span>
              <span className="text-sm font-bold text-slate-800">
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
