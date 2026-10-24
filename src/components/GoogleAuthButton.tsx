import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { LogOut, User as UserIcon, CheckCircle2, ChevronDown, RefreshCw } from 'lucide-react';
import { googleSignIn, logout } from '../utils/auth';
import { sounds } from '../utils/sound';

interface GoogleAuthButtonProps {
  currentUser: User | null;
  onUserChanged: (user: User | null) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  currentUser,
  onUserChanged,
}) => {
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const res = await googleSignIn();
      if (res?.user) {
        sounds.playSuccessChime();
        onUserChanged(res.user);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      sounds.playWaterDrop();
      await logout();
      onUserChanged(null);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (currentUser) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900 border border-white/15 hover:border-emerald-500/50 transition-all text-left group"
        >
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User profile'}
              className="w-7 h-7 rounded-full object-cover border border-emerald-400/50 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </div>
          )}

          <div className="hidden sm:block min-w-0 pr-1">
            <div className="text-xs font-bold text-white truncate max-w-[110px] flex items-center gap-1">
              <span>{currentUser.displayName || 'Google User'}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[110px] font-mono">
              {currentUser.email}
            </div>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 hidden sm:block" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121620] border border-white/15 shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
            <div className="p-2 border-b border-white/10">
              <div className="text-xs font-bold text-white truncate">
                {currentUser.displayName || 'Google Account'}
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">
                {currentUser.email}
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Google OAuth Synced</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full text-left p-2 rounded-xl text-xs text-rose-300 hover:text-white hover:bg-rose-500/20 flex items-center gap-2 transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      {/* Official Sign in with Google Button specification */}
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="group relative inline-flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-all shadow-md active:scale-98 disabled:opacity-50"
        title="Sign in with your Google Account"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 text-slate-600 animate-spin" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        )}
        <span className="font-bold tracking-tight">
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </span>
      </button>

      {authError && (
        <span className="text-[10px] text-rose-400 mt-1 max-w-[200px] text-right">
          {authError}
        </span>
      )}
    </div>
  );
};
