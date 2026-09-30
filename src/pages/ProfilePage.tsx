import React from 'react';
import { PageId, Language } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Loader2,
  UserCheck,
  Building2,
  Briefcase,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  language: Language;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <Loader2 className="w-8 h-8 text-[#2490EF] animate-spin mx-auto" />
        <p className="text-slate-400 mt-4">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-3 bg-[#2490EF] text-white rounded-lg font-semibold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  // Determine user type
  const getUserType = () => {
    if (user.is_dealer) return { label: 'Dealer Partner', color: '#F5A623', icon: Building2 };
    if (user.is_customer) return { label: 'Customer', color: '#2490EF', icon: UserCheck };
    return { label: 'Website User', color: '#94a3b8', icon: User };
  };

  const userType = getUserType();
  const UserTypeIcon = userType.icon;

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2490EF] bg-[#2490EF]/10 border border-[#2490EF]/30 px-3.5 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your Account</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading">
          My Profile
        </h1>
      </div>

      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-[#2490EF]/20 border-2 border-[#2490EF]/40 flex items-center justify-center text-[#2490EF] text-2xl font-bold shrink-0">
            {user.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {user.full_name}
            </h2>
            <div className="flex items-center gap-2">
              <UserTypeIcon className="w-4 h-4" style={{ color: userType.color }} />
              <span
                className="text-sm font-semibold"
                style={{ color: userType.color }}
              >
                {userType.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                Email
              </div>
              <div className="text-sm text-white">{user.email}</div>
            </div>
          </div>

          {user.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                  Phone
                </div>
                <div className="text-sm text-white">{user.phone}</div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                Roles
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps / Actions */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h3 className="text-lg font-bold text-white font-heading mb-4">
          What would you like to do?
        </h3>

        <div className="space-y-3">
          {/* Customer Portal */}
          {user.is_customer && (
            <button
              onClick={() => onNavigate('portal')}
              className="w-full p-4 rounded-xl bg-[#2490EF]/10 border border-[#2490EF]/30 hover:border-[#2490EF]/60 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2490EF]/15 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6 text-[#2490EF]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white mb-1">Customer Dashboard</div>
                <div className="text-xs text-slate-400">
                  Track bookings, payments, documents
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#2490EF] transition-colors" />
            </button>
          )}

          {/* Dealer Portal */}
          {user.is_dealer && (
            <button
              onClick={() => onNavigate('dealer')}
              className="w-full p-4 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/30 hover:border-[#F5A623]/60 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F5A623]/15 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-[#F5A623]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white mb-1">Dealer Dashboard</div>
                <div className="text-xs text-slate-400">
                  Manage leads, deals, commissions
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#F5A623] transition-colors" />
            </button>
          )}

          {/* Become Customer (if not already) */}
          {!user.is_customer && (
            <button
              onClick={() => onNavigate('become-customer')}
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-[#2490EF]/60 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6 text-[#2490EF]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white mb-1">Become a Customer</div>
                <div className="text-xs text-slate-400">
                  Register to book properties and track payments
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#2490EF] transition-colors" />
            </button>
          )}

          {/* Become Dealer (if not already) */}
          {!user.is_dealer && (
            <button
              onClick={() => onNavigate('become-dealer')}
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-[#F5A623]/60 transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-[#F5A623]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white mb-1">Become a Dealer</div>
                <div className="text-xs text-slate-400">
                  Join 60% commission split partner program
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-[#F5A623] transition-colors" />
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-300 mb-1">Logout</div>
              <div className="text-xs text-slate-400">
                Sign out of your account
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
