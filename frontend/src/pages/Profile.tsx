import React from 'react';
import { UserCheck, ShieldCheck, Mail, Calendar, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Faculty / Admin Profile</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Institutional access credentials and departmental role details
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-black shadow-inner">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name || 'Authorized Member'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
                {user?.role || 'faculty'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Email Address</p>
              <p className="text-sm font-bold text-white">{user?.email || 'user@edupulse.edu'}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Account Created</p>
              <p className="text-sm font-bold text-white">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-white">Session Security Token</p>
              <p className="text-[11px] text-slate-400">HMAC-SHA256 Encrypted JWT Active</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
            Authenticated
          </span>
        </div>
      </div>
    </div>
  );
};
