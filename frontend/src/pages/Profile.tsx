import React from 'react';
import { UserCheck, ShieldCheck, Mail, Calendar, Key, Sparkles, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Faculty & Administrator Profile</h1>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            Verified Credential
          </span>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
          Institutional access credentials and departmental role permissions
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || 'Authorized Member'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
                {user?.role || 'faculty'} ACCESS TIER
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
              <Mail className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-bold text-white mt-0.5">{user?.email || 'user@smartdrop.edu'}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3.5">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Enrolled</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Session Security Token</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">HMAC-SHA256 Encrypted Bearer Active</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            Authenticated
          </span>
        </div>
      </div>
    </div>
  );
};
