import React, { useState } from 'react';
import { AppUserRole, AuthUser } from '../types';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  Layers,
  AlertCircle
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<AppUserRole>('admin');
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleTabChange = (role: AppUserRole) => {
    setSelectedRole(role);
    setUsername(role);
    setPassword('123');
    setErrorMsg(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Initial password check: password must be "123"
    if (password !== '123') {
      setErrorMsg('Invalid password. Default initial password is 123.');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('Please enter a username.');
      return;
    }

    const authUser: AuthUser = {
      role: selectedRole,
      username: username.trim(),
      loggedInAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('sewplan_auth_session', JSON.stringify(authUser));
    } catch {}

    onLoginSuccess(authUser);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-slate-950 p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Garment Production APS v4.2</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            SewPlan <span className="text-indigo-400">Enterprise</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Advanced Planning & Scheduling for High-Capacity Apparel Manufacturing
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Role Tabs */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Select Login Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>1. Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('viewer')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'viewer'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>2. Viewer</span>
              </button>
            </div>
          </div>

          {/* Role Permissions Description */}
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
            selectedRole === 'admin'
              ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {selectedRole === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-white">Admin Privileges:</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-white">Viewer Privileges:</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedRole === 'admin'
                ? 'Full editable mode: Drag-and-drop planning board, order splitting, AI plan studio, shift & holiday configuration, and all reports.'
                : 'View mode only: Read-only planning board, Plan Explanation Report, and production schedule reports with Excel export.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Username:</span>
                <span className="text-[10px] text-slate-500 font-mono">admin or viewer</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Password:</span>
                <span className="text-[10px] text-indigo-400 font-mono font-bold">Initial: 123</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter password (123)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Single Login Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-sm font-bold flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-600/30 transition-all"
            >
              Login
            </button>
          </form>
        </div>

        {/* Security Footer Note */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>SewPlan Advanced Planning & Scheduling • Session Secured</p>
          <p className="text-[10px] text-slate-600 font-mono">Initial System Credentials: Username: admin / viewer • Password: 123</p>
        </div>
      </div>
    </div>
  );
};
