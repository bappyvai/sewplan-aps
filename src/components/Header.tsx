import React from 'react';
import { usePlanning } from '../context/PlanningContext';
import { AuthUser, AppUserRole } from '../types';
import {
  Calendar,
  Layers,
  Clock,
  CalendarDays,
  FileSpreadsheet,
  Database,
  Factory,
  Play,
  RefreshCw,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Eye,
  Lock,
  LogOut,
  ShieldCheck,
  FileText,
  BookOpen,
  ArrowRightLeft
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: AuthUser;
  onLogout: () => void;
  onSwitchRole: (role: AppUserRole) => void;
  onOpenRunPlanModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onSwitchRole,
  onOpenRunPlanModal
}) => {
  const {
    planMode,
    tempPlan,
    confirmTempPlan,
    discardTempPlan,
    currentKPIs,
    isSimulating,
    syncPlan,
    isAIPlanDraft,
    dbStatus,
    syncWithDatabase
  } = usePlanning();

  const isAdmin = currentUser.role === 'admin';

  // Navigation Items according to user permissions
  // Viewer only sees Planning Board (view mode), Plan Explanation Report, and Planning Report
  // Admin sees all screens in editable mode
  const navItems = isAdmin
    ? [
        { id: 'board', label: 'Planning Board', icon: Calendar },
        { id: 'plan-explanation', label: 'Plan Explanation', icon: FileText },
        { id: 'report', label: 'Planning Report', icon: FileSpreadsheet },
        { id: 'ai-plan', label: 'AI Plan Studio', icon: Sparkles },
        { id: 'production', label: 'Production Floor', icon: Factory },
        { id: 'priority', label: 'Line Priority', icon: Layers },
        { id: 'availability', label: 'Availability & Split', icon: Clock },
        { id: 'shift', label: 'Shift Master', icon: Clock },
        { id: 'holiday', label: 'Holiday Master', icon: CalendarDays },
        { id: 'source-data', label: 'Source Data & DB', icon: Database },
        { id: 'docs', label: 'Documentation', icon: BookOpen }
      ]
    : [
        { id: 'board', label: 'Planning Board (View Only)', icon: Calendar },
        { id: 'plan-explanation', label: 'Plan Explanation Report', icon: FileText },
        { id: 'report', label: 'Planning Report', icon: FileSpreadsheet }
      ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Simulation Alert Banner (Admin Only) */}
      {isAdmin && planMode === 'temp' && tempPlan && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white px-3 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <span className="bg-white/25 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{isAIPlanDraft ? 'AI Empirical Draft' : 'Simulation Draft'}</span>
            </span>
            <span className="text-[11px] sm:text-xs">
              {isAIPlanDraft
                ? `AI Plan (${currentKPIs.totalBlocks} blocks, ${currentKPIs.totalPieces.toLocaleString()} pcs) generated from closed orders & line efficiency. Test moves or ripple shifts before publishing.`
                : `Draft plan (${currentKPIs.totalBlocks} blocks, ${currentKPIs.totalPieces.toLocaleString()} pcs). Test moves & splits before confirming.`}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={discardTempPlan}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
            <button
              onClick={confirmTempPlan}
              className="px-3.5 py-1 bg-white text-amber-900 hover:bg-amber-50 rounded text-xs font-black transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAIPlanDraft ? 'Publish AI Plan' : 'Confirm Plan'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Zone 1: Wordmark & Role Badge & Database Indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
              isAdmin ? 'bg-indigo-600' : 'bg-slate-800'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 whitespace-nowrap">
                SewPlan APS
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  isAdmin
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {isAdmin ? 'Admin (Editable)' : 'Viewer (Read-Only)'}
              </span>

              {/* Internal Storage Status Indicator */}
              <button
                type="button"
                onClick={() => syncWithDatabase()}
                title="Internal Storage: Persisted locally with instant in-memory scheduling (1,200 orders, 60 lines). Click to refresh state."
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 cursor-pointer transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Internal Storage Active</span>
              </button>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block -mt-0.5 font-medium">
              {isAdmin
                ? 'Garment Production Planning • Full Controller & Editable Mode'
                : 'Viewer Mode • Non-Editable Gantt & Analytical Reports'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden 2xl:flex items-center gap-1 text-sm font-medium text-slate-600 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Run Plan / Sync + User Profile & Logout) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick tab dropdown for compact screens */}
          <div className="2xl:hidden">
            <select
              value={currentTab}
              onChange={(e) => setCurrentTab(e.target.value)}
              aria-label="Select screen"
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium max-w-[150px] sm:max-w-none truncate"
            >
              {navItems.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* Admin Editing Tools: Sync Plan & Run Plan */}
          {isAdmin && (
            <>
              {/* Synchronize Plan Button */}
              <button
                onClick={syncPlan}
                disabled={isSimulating}
                className="hidden sm:flex px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg border border-slate-300 shadow-xs transition-colors items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
                title="Adjust planning board according to latest RM in-house dates and completed sewing pieces"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-slate-600 shrink-0 ${
                    isSimulating ? 'animate-spin' : ''
                  }`}
                />
                <span>Sync Plan</span>
              </button>

              {/* Run Plan Button */}
              <button
                onClick={onOpenRunPlanModal}
                disabled={isSimulating}
                className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Plan</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Role Switcher Pill (Quick preview switch) */}
          <button
            onClick={() => onSwitchRole(isAdmin ? 'viewer' : 'admin')}
            className="hidden md:flex px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold items-center gap-1.5 cursor-pointer transition-all"
            title={`Switch to ${isAdmin ? 'Viewer' : 'Admin'} mode`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>{isAdmin ? 'Preview Viewer' : 'Switch to Admin'}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Log out and return to Login Screen"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
