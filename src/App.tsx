import React, { useState } from 'react';
import { PlanningProvider } from './context/PlanningContext';
import { Header } from './components/Header';
import { PlanningBoard } from './components/PlanningBoard';
import { WorkcenterPriorityScreen } from './components/WorkcenterPriorityScreen';
import { WorkcenterAvailabilityScreen } from './components/WorkcenterAvailabilityScreen';
import { WorkcenterShiftScreen } from './components/WorkcenterShiftScreen';
import { HolidayMasterScreen } from './components/HolidayMasterScreen';
import { SourceDataScreen } from './components/SourceDataScreen';
import { ProductionTableScreen } from './components/ProductionTableScreen';
import { PlanningReportScreen } from './components/PlanningReportScreen';
import { PlanExplanationReportScreen } from './components/PlanExplanationReportScreen';
import { AIPlanScreen } from './components/AIPlanScreen';
import { DocumentationScreen } from './components/DocumentationScreen';
import { RunPlanModal } from './components/RunPlanModal';
import { LoginScreen } from './components/LoginScreen';
import { AuthUser, AppUserRole } from './types';

export default function App() {
  // Authentication session state: null indicates unauthenticated -> renders LoginScreen
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sewplan_auth_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.role === 'admin' || parsed.role === 'viewer')) {
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  });

  const [currentTab, setCurrentTab] = useState<string>('board');
  const [isRunPlanModalOpen, setIsRunPlanModalOpen] = useState(false);

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('sewplan_auth_session');
    } catch {}
    setCurrentUser(null);
  };

  // Role switch handler
  const handleSwitchRole = (role: AppUserRole) => {
    const updatedUser: AuthUser = {
      role,
      username: role === 'admin' ? 'admin' : 'viewer',
      loggedInAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('sewplan_auth_session', JSON.stringify(updatedUser));
    } catch {}
    setCurrentUser(updatedUser);
    if (
      role === 'viewer' &&
      currentTab !== 'board' &&
      currentTab !== 'plan-explanation' &&
      currentTab !== 'report'
    ) {
      setCurrentTab('board');
    }
  };

  // If unauthenticated, render the full-screen Login Portal
  if (!currentUser) {
    return (
      <PlanningProvider>
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setCurrentTab('board');
          }}
        />
      </PlanningProvider>
    );
  }

  // Permissions: Viewer is strictly read-only and can only view board & reports
  const isReadOnly = currentUser.role === 'viewer';

  return (
    <PlanningProvider>
      <div className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden select-text">
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
          onOpenRunPlanModal={() => setIsRunPlanModalOpen(true)}
        />

        <main
          className={`flex-1 min-h-0 w-full ${
            currentTab === 'board' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'
          }`}
        >
          {/* Planning Board: Admin has full editable mode; Viewer has View Only mode */}
          {currentTab === 'board' && (
            <PlanningBoard
              onOpenRunPlanModal={() => setIsRunPlanModalOpen(true)}
              isReadOnly={isReadOnly}
            />
          )}

          {/* Plan Explanation Report: Accessible to both Admin and Viewer */}
          {currentTab === 'plan-explanation' && (
            <PlanExplanationReportScreen isReadOnly={isReadOnly} />
          )}

          {/* Planning Report: Accessible to both Admin and Viewer */}
          {currentTab === 'report' && <PlanningReportScreen isReadOnly={isReadOnly} />}

          {/* Admin-only screens (Hidden and restricted from Viewer) */}
          {!isReadOnly && currentTab === 'ai-plan' && (
            <AIPlanScreen onNavigateToBoard={() => setCurrentTab('board')} />
          )}
          {!isReadOnly && currentTab === 'production' && <ProductionTableScreen />}
          {!isReadOnly && currentTab === 'priority' && <WorkcenterPriorityScreen />}
          {!isReadOnly && currentTab === 'availability' && <WorkcenterAvailabilityScreen />}
          {!isReadOnly && currentTab === 'shift' && <WorkcenterShiftScreen />}
          {!isReadOnly && currentTab === 'holiday' && <HolidayMasterScreen />}
          {!isReadOnly && currentTab === 'source-data' && <SourceDataScreen />}
          {!isReadOnly && currentTab === 'docs' && <DocumentationScreen />}
        </main>

        <RunPlanModal
          isOpen={isRunPlanModalOpen}
          onClose={() => setIsRunPlanModalOpen(false)}
        />
      </div>
    </PlanningProvider>
  );
}
