import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Database,
  Cpu,
  Layers,
  CheckCircle,
  Copy,
  Search,
  ExternalLink,
  Code2,
  Table,
  Workflow,
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  Split,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Info,
  ArrowDown,
  ShieldCheck,
  Eye,
  Globe,
  Rocket,
  Cloud,
  Server
} from 'lucide-react';

export const DocumentationScreen: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'all' | 'planning_logic' | 'business' | 'screens' | 'database' | 'tech' | 'local_setup' | 'mongo_api' | 'auth_and_audit' | 'hosting'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Interactive Planning Engine Flowchart & Simulator State
  const [activeStepTab, setActiveStepTab] = useState<number>(1);
  const [simQty, setSimQty] = useState<number>(5000);
  const [simColorStr, setSimColorStr] = useState<string>('Black, White, Navy, Red, Charcoal');
  const [simSmv, setSimSmv] = useState<number>(15.0);
  const [simCadre, setSimCadre] = useState<number>(43);
  const [simEfficiency, setSimEfficiency] = useState<number>(85);
  const [simHasPO, setSimHasPO] = useState<boolean>(true);
  const [simInhouse, setSimInhouse] = useState<string>('2027-02-10');
  const [simShipDate, setSimShipDate] = useState<string>('2027-03-25');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Live Simulator Calculations
  const colorsList = simColorStr
    .split(/[,/|;+]|\s+&\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const colorCount = Math.max(1, colorsList.length);
  const baseBlockQty = Math.floor(simQty / colorCount);

  // PSD: inhouse + 3 days or shipdate - 35 + 3 days
  const simPsdDisplay = simHasPO
    ? '2027-02-13 (In-House 2027-02-10 + 3 Days)'
    : '2027-02-21 (Ship 2027-03-25 - 35 + 3 Days = -32 Days)';

  const netShiftMins = 590; // 9.833 hrs
  const dailyCapacityMins = Math.round(simCadre * netShiftMins * (simEfficiency / 100));
  const dailyOutputPcs = Math.round(dailyCapacityMins / Math.max(1, simSmv));
  const totalWorkContentMins = Math.round(simQty * simSmv);
  const workingDaysNeeded = Math.ceil(totalWorkContentMins / Math.max(1, dailyCapacityMins));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-300">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Unified Architecture & System Specification v4.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SewPlan APS: Full Business & Technical Documentation
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            End-to-end architectural guide detailing the scheduling algorithms, planning engine flow, AI empirical planning, floor production deduction models,
            database schema, MongoDB integration, Express API topology, and local deployment guidelines.
          </p>

          {/* Quick Filter Navigation */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { id: 'all', label: 'Complete Document' },
              { id: 'planning_logic', label: '★ Planning Engine Flowchart & 6 Logics' },
              { id: 'business', label: '1. Business Logics & Math' },
              { id: 'screens', label: '2. Screens & UI Workflows' },
              { id: 'database', label: '3. DB Tables & Schema' },
              { id: 'tech', label: '4. Frontend & Backend Stack' },
              { id: 'local_setup', label: '5. Local Setup Guideline' },
              { id: 'mongo_api', label: '6. Internal Storage Engine' },
              { id: 'auth_and_audit', label: '7. Login Roles & Plan Explanation Report' },
              { id: 'hosting', label: '8. 🚀 Free Online Hosting Guide' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveSection(btn.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSection === btn.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION: PLANNING ENGINE ARCHITECTURAL FLOWCHART & 6-STEP LOGICS */}
      {(activeSection === 'all' || activeSection === 'planning_logic') && (
        <section className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 sm:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-extrabold shadow-sm">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1">
                  Core Industrial Engineering Engine
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Planning Engine Flowchart & Step-by-Step Logics
                </h2>
                <p className="text-xs text-slate-500">
                  Detailed visualization of how sales orders are sequenced, prioritized, evaluated, capacity-checked, and placed on the planning board.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-semibold text-slate-500">Jump to Step:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setActiveStepTab(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      activeStepTab === num
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VISUAL ARCHITECTURAL FLOWCHART */}
          <div className="bg-slate-950 text-white rounded-xl p-5 sm:p-6 space-y-6 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Planning Engine Execution Pipeline Flowchart
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Algorithm v4.2 • Deterministic Multi-Pass</span>
            </div>

            {/* Grid Flow Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
              {/* Node 1 */}
              <div
                onClick={() => setActiveStepTab(1)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  activeStepTab === 1
                    ? 'bg-indigo-900/60 border-indigo-400 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Sort</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Ship Date Sorting</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Arrange orders by ship date ascending. Earliest ship date checked first.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-indigo-300">
                  min(Ship_Date) ➔ Next
                </div>
              </div>

              {/* Node 2 */}
              <div
                onClick={() => setActiveStepTab(2)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  activeStepTab === 2
                    ? 'bg-indigo-900/60 border-indigo-400 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Priority</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Line Priority</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Check product category / style / customer ranking across lines.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-indigo-300">
                  Priority 1, 2, 3...
                </div>
              </div>

              {/* Node 3 */}
              <div
                onClick={() => setActiveStepTab(3)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  activeStepTab === 3
                    ? 'bg-amber-900/50 border-amber-400 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-extrabold flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">PSD</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Line & RM In-House</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Line busy cursor check + PO In-House + 3d (or Ship - 35 + 3d).
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-amber-300">
                  PSD = In-House + 3d
                </div>
              </div>

              {/* Node 4 */}
              <div
                onClick={() => setActiveStepTab(4)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  activeStepTab === 4
                    ? 'bg-violet-900/50 border-violet-400 ring-2 ring-violet-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-extrabold flex items-center justify-center">
                    4
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Capacity</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Available Minutes</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Shift hours (reduced break) & cadre & category efficiency %.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-violet-300">
                  Cadre * Mins * Eff %
                </div>
              </div>

              {/* Node 5 */}
              <div
                onClick={() => setActiveStepTab(5)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  activeStepTab === 5
                    ? 'bg-emerald-900/50 border-emerald-400 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold flex items-center justify-center">
                    5
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Duration</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Block Qty * SMV</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Duration based on Block Qty * SMV converted to working days/clock time.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-emerald-300">
                  Work = Qty * SMV
                </div>
              </div>

              {/* Node 6 */}
              <div
                onClick={() => setActiveStepTab(6)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  activeStepTab === 6
                    ? 'bg-sky-900/50 border-sky-400 ring-2 ring-sky-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-extrabold flex items-center justify-center">
                    6
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Blocks</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Group by Color</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  5 colors = 5 block IDs. Auto/manual split introduces new ID!
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-sky-300">
                  BLK-C1..C5 (+S1)
                </div>
              </div>
            </div>

            {/* Decision & Placement Branch */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <GitBranch className="w-4 h-4" />
                <span>Decision Branch: On-Time Delivery Verification & Split Optimization</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Path A: Priority 1 On Time</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Line 1 finishes on or before Ship Date. All color blocks placed sequentially on Line 1 with base IDs <code className="text-emerald-300 font-mono">BLK-SO-1001-C1..C5</code>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>Path B: Alternative Prioritized Line</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Line 1 busy or finishes late, but Priority 2 or 3 Line is available and finishes on time. Entire order routed to Alternative Line without split!
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Split className="w-3.5 h-3.5" />
                    <span>Path C: Auto-Split Across 2 Lines</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    No single line can finish on time. Order auto-split across Line 1 and Line 2. Line 2 receives <strong>new system block IDs</strong> <code className="text-amber-300 font-mono">BLK-SO-1001-C1-S1</code>!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP DETAILS INSPECTOR (TABS 1 TO 6) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <div className="flex flex-wrap border-b border-slate-200 bg-white">
              {[
                { id: 1, label: 'Step 1: Ship Date Sequence' },
                { id: 2, label: 'Step 2: Line Priority Lookup' },
                { id: 3, label: 'Step 3: Line & Material PSD' },
                { id: 4, label: 'Step 4: Shift Cadre & Efficiency' },
                { id: 5, label: 'Step 5: Duration (Block Qty * SMV)' },
                { id: 6, label: 'Step 6: Color Grouping & IDs' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStepTab(tab.id)}
                  className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-2 cursor-pointer ${
                    activeStepTab === tab.id
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-extrabold ${
                    activeStepTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.id}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeStepTab === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">Rule 1</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Sales Order Arrangement Based on Ship Date (First Ship Date Checked First)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    In apparel manufacturing, shipping deadlines to buyers (e.g. Zara, H&M, Nike, Levi Strauss) are strictly contractual with heavy penalties for air-freight or cancellation. Therefore, the planning engine sorts all eligible sales orders ascending by <code className="font-mono text-indigo-600 font-bold">ship_date</code>.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800">1. Inclusion Filter</div>
                      <p className="text-slate-500 text-[11px]">Only orders with status <code className="text-indigo-600 font-semibold">Open</code> or <code className="text-emerald-600 font-semibold">In_Production</code> are evaluated.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800">2. Floor Production Deduction</div>
                      <p className="text-slate-500 text-[11px]">Deducts already completed pieces from sewing records: <code className="text-slate-800 font-semibold">Balance = Order Qty - Produced</code>.</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800">3. Ascending Sort</div>
                      <p className="text-slate-500 text-[11px]">Orders with the earliest ship date get first access to high-priority line slots.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">Rule 2</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Order-Related Product Category / Style / Customer Line Priority
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Lines in the factory are pre-configured with specialized machinery (e.g. 2-needle chainstitch for Denim, cylinder bed for Polo collars). The engine references the <code className="font-mono text-indigo-600 font-bold">Workcenter Priority Master</code> to find which sewing lines hold the highest priority for the order's attributes.
                  </p>
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs font-mono space-y-2">
                    <div className="text-slate-800 font-bold">Priority Hierarchical Ranking Structure:</div>
                    <div className="flex items-center justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                      <span>Level 1 (Highest): Exact Style Match</span>
                      <span className="text-indigo-600 font-semibold">(Line, Category, Customer, Style) ➔ Rank 1..5</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 border-b border-slate-100 pb-1.5">
                      <span>Level 2 (High): Customer Level Match</span>
                      <span className="text-indigo-600 font-semibold">(Line, Category, Customer) ➔ Rank 10 + Priority</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 pb-1">
                      <span>Level 3 (Standard): Category Match</span>
                      <span className="text-indigo-600 font-semibold">(Line, Category) ➔ Rank 100 + Priority</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-bold">Rule 3</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Line Availability & Raw Material In-House Date (PSD Calculation)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sewing lines cannot start an order without fabric and trims in the factory warehouse. The Planned Start Date (PSD) is calculated using strict garment manufacturing relaxation rules:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Case A: Material PO Information Available</span>
                      </div>
                      <p className="text-slate-600">
                        When the Raw Material PO is logged with an <code className="font-semibold text-slate-900">inhouse_date</code>:
                      </p>
                      <div className="p-2.5 bg-amber-50 rounded-lg font-mono text-amber-900 font-bold text-[11px]">
                        Target PSD = inhouse_date + 3 Calendar Days
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Rationale: 3-day buffer is required for lab dip shade verification, 24-48h fabric relaxation (preventing shrinkage), spreading, and cutting.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Info className="w-4 h-4 text-slate-600" />
                        <span>Case B: No Material PO Information</span>
                      </div>
                      <p className="text-slate-600">
                        When no purchase information has been entered yet:
                      </p>
                      <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-slate-900 font-bold text-[11px]">
                        Target PSD = Ship Date - 35 Days + 3 Days (= Ship Date - 32 Days)
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Calendar Rule: If Target PSD lands on Friday (weekly off) or a holiday, it automatically moves to the next working day.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 text-xs font-bold">Rule 4</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Line Available Minutes / Hours Based on Shift Info & Category Efficiency %
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Daily sewing line capacity is never assumed to be 100%. It is mathematically calculated by combining the operator cadre from the Shift Master with the category efficiency percentage from the Workcenter Availability Master.
                  </p>
                  <div className="p-4 bg-white rounded-xl border border-violet-200 text-xs space-y-3">
                    <div className="font-mono text-violet-900 font-bold text-[13px] bg-violet-50 p-3 rounded-lg border border-violet-200">
                      Daily Available Capacity (Mins) = Cadre × (Net Shift Hours × 60) × (Efficiency % / 100)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-700">Cadre (Operators):</span>
                        <p className="text-slate-500">Standard 43 operators from Shift Master (sewing operators + helpers).</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Net Shift Hours:</span>
                        <p className="text-slate-500">Gross shift 10.833h (08:00-18:50) - 1.0h meal break = 9.833h (590 mins).</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Efficiency %:</span>
                        <p className="text-slate-500">Specific to line & category from Availability Master (e.g. 85% = 0.85).</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">Rule 5</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Order Placed Duration Based on (Block Qty × SMV)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Total workload content is the product of the block quantity and Standard Minute Value (SMV). The clock duration and working days needed on the line are derived directly from this standard work content:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="text-slate-800 font-bold">Standard Work Content Formula:</div>
                      <div className="p-2 bg-slate-50 rounded text-emerald-700 font-bold">
                        Total Work Mins = Block Quantity × SMV
                      </div>
                      <p className="text-[11px] font-sans text-slate-500">
                        e.g., 1,000 pieces of a 15.0 SMV Polo T-Shirt = 15,000 standard minutes.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="text-slate-800 font-bold">Working Days Required Formula:</div>
                      <div className="p-2 bg-slate-50 rounded text-indigo-700 font-bold">
                        Days = ⌈ (Block Qty × SMV) / Daily Available Capacity ⌉
                      </div>
                      <p className="text-[11px] font-sans text-slate-500">
                        Minute-level precision schedules production across working shifts with 60-min lunch breaks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 6 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-xs font-bold">Rule 6</span>
                    <h3 className="text-base font-bold text-slate-900">
                      System-Generated Block Numbers Grouped by Color & Split IDs
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cutting and sewing floors produce in color batches to prevent dye lot shade variation. If an order has 5 colors, the system generates exactly 5 discrete planned blocks. When any split occurs (auto-split or manual split), a new unique block ID is introduced.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-white rounded-xl border border-sky-200 space-y-2">
                      <div className="font-bold text-sky-900">Standard Color Grouping (5 Colors = 5 Blocks)</div>
                      <div className="p-2.5 bg-sky-50 rounded font-mono text-[11px] text-sky-950 space-y-1">
                        <div>Color 1: <span className="font-bold text-sky-700">BLK-SO-1001-C1</span> (Black, 1000 pcs)</div>
                        <div>Color 2: <span className="font-bold text-sky-700">BLK-SO-1001-C2</span> (White, 1000 pcs)</div>
                        <div>Color 3: <span className="font-bold text-sky-700">BLK-SO-1001-C3</span> (Navy, 1000 pcs)</div>
                        <div>Color 4: <span className="font-bold text-sky-700">BLK-SO-1001-C4</span> (Red, 1000 pcs)</div>
                        <div>Color 5: <span className="font-bold text-sky-700">BLK-SO-1001-C5</span> (Grey, 1000 pcs)</div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-2">
                      <div className="font-bold text-amber-900">Split Event: New Block ID Introduced</div>
                      <div className="p-2.5 bg-amber-50 rounded font-mono text-[11px] text-amber-950 space-y-1">
                        <div>Line 1 (Retained): <span className="font-bold text-slate-800">BLK-SO-1001-C1</span> (500 pcs)</div>
                        <div>Line 2 (Split): <span className="font-bold text-amber-700">BLK-SO-1001-C1-S1</span> (500 pcs)</div>
                        <div className="text-[10px] text-slate-500 pt-1 font-sans">
                          * If split again: <code className="font-bold text-amber-800">BLK-SO-1001-C1-S2</code> is introduced.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INTERACTIVE PLANNING ENGINE SIMULATOR & CALCULATOR */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-5 border border-indigo-900/50 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">Interactive Planning Engine Simulator</h3>
                  <p className="text-[11px] text-slate-400">Test order quantities, colors, SMV, cadres, and material dates to see live calculations.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold self-start sm:self-auto">
                Live React Math Model
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Order Quantity (Pcs):</span>
                  <span className="font-mono text-indigo-300 font-bold">{simQty.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={simQty}
                  onChange={(e) => setSimQty(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Garment SMV (mins):</span>
                  <span className="font-mono text-indigo-300 font-bold">{simSmv.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="5.0"
                  max="35.0"
                  step="0.5"
                  value={simSmv}
                  onChange={(e) => setSimSmv(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Line Cadre (Operators):</span>
                  <span className="font-mono text-indigo-300 font-bold">{simCadre}</span>
                </label>
                <input
                  type="range"
                  min="25"
                  max="60"
                  step="1"
                  value={simCadre}
                  onChange={(e) => setSimCadre(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Category Efficiency %:</span>
                  <span className="font-mono text-indigo-300 font-bold">{simEfficiency}%</span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={simEfficiency}
                  onChange={(e) => setSimEfficiency(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Colors Input & PO Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">
                  Colors in Order (Comma/Slash Separated ➔ Sets Block Count):
                </label>
                <input
                  type="text"
                  value={simColorStr}
                  onChange={(e) => setSimColorStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Black, White, Navy, Red, Charcoal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Material Purchase Info Mode:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSimHasPO(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      simHasPO ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    PO Exists (In-House + 3d)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimHasPO(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      !simHasPO ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    No PO (Ship - 35 + 3d)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Computed Engine Output */}
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                <span>SIMULATOR LIVE OUTPUT RESULTS</span>
                <span className="font-mono text-[11px] text-slate-400">{colorCount} Colors ➔ {colorCount} Distinct Blocks</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">1. Calculated PSD</span>
                  <div className="font-bold text-amber-300 truncate">{simPsdDisplay}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">2. Daily Capacity</span>
                  <div className="font-bold text-violet-300">
                    {dailyCapacityMins.toLocaleString()} mins <span className="text-[10px] text-slate-400">({dailyOutputPcs.toLocaleString()} pcs/d)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">3. Total Work Content</span>
                  <div className="font-bold text-emerald-300">
                    {totalWorkContentMins.toLocaleString()} mins <span className="text-[10px] text-slate-400">({workingDaysNeeded} days)</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">4. Generated Blocks</span>
                  <div className="font-bold text-sky-300">{colorCount} Blocks ({baseBlockQty.toLocaleString()} pcs ea)</div>
                </div>
              </div>

              {/* Sample Generated Block IDs */}
              <div className="pt-2 text-xs space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Sample System-Generated Block IDs for this Order:</span>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-sky-300 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      BLK-SO-1042-C{idx + 1} ({col} • {baseBlockQty.toLocaleString()} pcs)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 1: BUSINESS LOGICS & MATHEMATICAL MODELS */}
      {(activeSection === 'all' || activeSection === 'business') && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Core Business Logics, Formulas & Algorithms
              </h2>
              <p className="text-xs text-slate-500">
                Mathematical modeling of apparel manufacturing, SMV, line capacity, and floor deductions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logic 1 */}
            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Logic 1.1: Order Status Matrix
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Eligibility & Lifecycle Inclusion
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Orders move across 4 discrete states: <code className="text-indigo-600 font-semibold">Open</code>,{' '}
                <code className="text-emerald-600 font-semibold">In_Production</code>,{' '}
                <code className="text-blue-600 font-semibold">Shipped</code>, and{' '}
                <code className="text-slate-500 font-semibold">Closed</code>.
              </p>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-emerald-700 font-bold">Open & In_Production:</span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Included in Planning & Board
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-rose-700 font-bold">Shipped & Closed:</span>
                  <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                    Excluded (Pruned from Board)
                  </span>
                </div>
              </div>
            </div>

            {/* Logic 2 */}
            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Logic 1.2: Floor Production Deduction
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Net Balance Formulation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When sewing outputs are logged in the Production Table, completed garments are subtracted dynamically from order volume:
              </p>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs space-y-1">
                <div className="text-emerald-400">P(S) = sum(produced_qty for SalesOrder S)</div>
                <div className="text-amber-300">Balance_Qty = max(0, Order_Qty - P(S))</div>
                <div className="text-slate-400 text-[10px] pt-1">
                  * Planned blocks and Run Plan volume only allocate Balance_Qty.
                </div>
              </div>
            </div>

            {/* Logic 3 */}
            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Logic 1.3: Capacity & Working Days
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Standard Minute Value (SMV) Calculations
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apparel industrial engineering formulas calculating required production minutes and capacity:
              </p>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs space-y-1.5">
                <div className="text-amber-300">Produce_Minutes = Order_Qty * SMV</div>
                <div className="text-indigo-300">Line_Capacity_Minutes = Carder (Shift Master) * Shift_Hours_Net * 60 * Efficiency% (Avail Master)</div>
                <div className="text-emerald-400">Balance_Minutes_Needed = Balance_Qty * SMV</div>
                <div className="text-purple-300">Working_Days = ceil(Balance_Minutes_Needed / Line_Capacity_Minutes)</div>
              </div>
            </div>

            {/* Logic 4 */}
            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Logic 1.4: Production Start Date (PSD) & Multi-Line Splitting
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                PSD Anchor & Co-Allocation Rules
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Default sewing start date is Ship Date - 38 days. If raw material purchase order is not yet in-housed, PSD = PO delivery date + 3 days:
              </p>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs space-y-1">
                <div className="text-indigo-300">Default_PSD = Ship_Date - 38 days</div>
                <div className="text-amber-300">If (!PO.is_inhoused) PSD = max(Default_PSD, PO_Delivery_Date + 3 days)</div>
                <div className="text-emerald-400">If (Line 1 cannot finish before Ship Date & Multiple Lines Mapped in Priority): Auto-Split Balance to Line 2</div>
                <div className="text-rose-300">Else: Plan on same line and display Late Color (ship_date_risk)</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: SCREENS & UI SPECIFICATIONS */}
      {(activeSection === 'all' || activeSection === 'screens') && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Screen-by-Screen User Interface & Workflows
              </h2>
              <p className="text-xs text-slate-500">
                Detailed breakdowns of the 8 primary screens and 3 action modals.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                name: '1. Planning Board (Interactive Gantt Matrix & Hours View)',
                badge: 'Primary View',
                desc: 'Full-viewport interactive Gantt chart displaying all 60 sewing lines across 180 days. Supports Hours Level View (08:00 - 18:50 shift slots) for half-day orders, sub-day side-by-side order scheduling, building filtering, zoom levels (Hours, Day, Standard, Compact), quick month jump buttons (Jan - Jun), and drag-and-drop or click rescheduling with interactive date & start time popup modal.'
              },
              {
                name: '2. Production Table Screen (Shop-Floor Actuals)',
                badge: 'Floor Execution',
                desc: 'Dedicated interface for sewing supervisors to record daily shift production counts. Features real-time order completion progress bars, order-wise remaining balances, and detailed daily logs by date, workcenter, shift, and headcount.'
              },
              {
                name: '3. Workcenter Priority Screen',
                badge: 'Master Setup',
                desc: 'Configures machine preferences by Line, Category, Buyer Customer, and Style. Rank 1 matches take precedence over lower tiers in the scheduling engine.'
              },
              {
                name: '4. Availability & Splitting Screen',
                badge: 'IE / Line Setup',
                desc: 'Defines line efficiency percentages (e.g. 80%) and configures dual-line splitting (e.g., dividing standard 43 operators into 25 for Denim and 18 for Shorts).'
              },
              {
                name: '5. Shift Master Screen',
                badge: 'Factory Hours',
                desc: 'Defines workcenter shift hours (08:00 - 18:50, 9.83 hrs, 60m break). Modifying shift hours instantly updates the daily minute capacity of all assigned lines.'
              },
              {
                name: '6. Holiday Master Screen',
                badge: 'Working Calendar',
                desc: 'Interactive selector for weekly non-working days (e.g. Friday weekly off) and national/festival holidays (Eid, New Year). Schedule automatically skips holidays.'
              },
              {
                name: '7. Source Data Master Screen (Main Sales & Temp Planning Table)',
                badge: 'Master Data & Temp Table',
                desc: 'Main Sales Order table with 1,200 orders totaling 5,000,000 pcs, and a dedicated Temp Planning Order Table tab tracking which sales orders are already planned in APS. Allows running new plans for unallocated orders only, and resetting planned orders.'
              },
              {
                name: '8. Planning Report Screen & Excel Export',
                badge: 'Reporting & XLSX',
                desc: 'Operational tabular schedule for factory distribution showing exact Start Date & Time and End Date & Time. Includes high-fidelity Microsoft Excel (.xlsx) export engine with multi-color styling, KPI summary headers, and health indicators.'
              }
            ].map((screen, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-white">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-slate-900">{screen.name}</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {screen.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{screen.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: DATABASE TABLES & CONNECTIVITY */}
      {(activeSection === 'all' || activeSection === 'database') && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Database Tables, Schemas & Storage Connectivity
              </h2>
              <p className="text-xs text-slate-500">
                Relational schema definitions (PostgreSQL / Cloud SQL) and client-side LocalStorage protocol.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Table Name</th>
                  <th className="px-4 py-3">Primary Key</th>
                  <th className="px-4 py-3">Key Foreign Keys</th>
                  <th className="px-4 py-3">Purpose & Business Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">sales_orders</td>
                  <td className="px-4 py-3 font-mono">sales_order_no</td>
                  <td className="px-4 py-3 font-mono text-slate-400">None</td>
                  <td className="px-4 py-3">Master order ledger (Buyer PO, customer, SMV, ship_date, order_status).</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">production_records</td>
                  <td className="px-4 py-3 font-mono">production_id</td>
                  <td className="px-4 py-3 font-mono">sales_order_no, workcenter_id</td>
                  <td className="px-4 py-3">Floor execution output records logged daily by shift and line.</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">raw_material_pos</td>
                  <td className="px-4 py-3 font-mono">po_no</td>
                  <td className="px-4 py-3 font-mono">sales_order_no</td>
                  <td className="px-4 py-3">Fabric and trims procurement tracking with in-house dates.</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">workcenters</td>
                  <td className="px-4 py-3 font-mono">workcenter_id</td>
                  <td className="px-4 py-3 font-mono text-slate-400">None</td>
                  <td className="px-4 py-3">60 sewing lines, standard 43 cadre, building assignments, category.</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">workcenter_priorities</td>
                  <td className="px-4 py-3 font-mono">id</td>
                  <td className="px-4 py-3 font-mono">workcenter_id</td>
                  <td className="px-4 py-3">Machine assignment priority ranking (Style, Customer, Category).</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">planned_blocks</td>
                  <td className="px-4 py-3 font-mono">block_id</td>
                  <td className="px-4 py-3 font-mono">sales_order_no, workcenter_id</td>
                  <td className="px-4 py-3">Gantt schedule records, start/end dates, daily allocations, health status.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 text-slate-100 text-xs font-mono relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
              <span>PostgreSQL Production DDL Snippet</span>
              <button
                onClick={() =>
                  handleCopy(
                    `CREATE TABLE sales_orders (
  sales_order_no VARCHAR(64) PRIMARY KEY,
  buyer_po VARCHAR(64) NOT NULL,
  order_quantity INT NOT NULL CHECK (order_quantity > 0),
  order_status VARCHAR(32) NOT NULL DEFAULT 'Open',
  ship_date DATE NOT NULL
);`,
                    'ddl-copy'
                  )
                }
                className="hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode === 'ddl-copy' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 text-[11px] overflow-x-auto">
{`-- Client-Side LocalStorage Key: sewplan_aps_data_v3
-- Debounced sync (1,500ms) with non-blocking JSON persistence`}
            </pre>
          </div>
        </section>
      )}

      {/* SECTION 4: FRONTEND & BACKEND ARCHITECTURE */}
      {(activeSection === 'all' || activeSection === 'tech') && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Frontend & Backend Technical Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Technology stack, API contracts, ERP/MES webhook integration, and performance benchmarks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Frontend Technology Stack</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li><strong className="text-slate-800">Framework:</strong> React 19 SPA running on Vite.</li>
                <li><strong className="text-slate-800">Language:</strong> TypeScript 5.8 with strict interface contracts.</li>
                <li><strong className="text-slate-800">Styling:</strong> Tailwind CSS v4 with custom responsive flex-viewport layout.</li>
                <li><strong className="text-slate-800">Icons:</strong> Lucide React enterprise icon pack.</li>
                <li><strong className="text-slate-800">Excel Export:</strong> XLSX library generating styled, formatted production schedules.</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>Backend & API Topology</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li><strong className="text-slate-800">Backend Server:</strong> Express 4.x running on Node.js / TSX on port 3000.</li>
                <li><strong className="text-slate-800">Endpoints:</strong> RESTful API under <code className="text-indigo-600">/api/*</code> for orders, plans, masters, and seeding.</li>
                <li><strong className="text-slate-800">Database:</strong> MongoDB Atlas cloud cluster with Mongoose ODM.</li>
                <li><strong className="text-slate-800">Dev Mode:</strong> Unified single process mounting Vite middleware directly into Express.</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: LOCAL SYSTEM SETUP & IMPLEMENTATION GUIDELINE */}
      {(activeSection === 'all' || activeSection === 'local_setup') && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center font-bold">
              5
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Local System Step-by-Step Installation & Implementation Guideline
              </h2>
              <p className="text-xs text-slate-500">
                Complete walkthrough from fresh clone to full-stack execution on Windows, macOS, or Linux.
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>1. Required Tools & Prerequisites</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">Node.js (v18+ or v20 LTS)</span>
                <span className="text-slate-500 text-[11px]">JavaScript runtime environment</span>
                <code className="text-[10px] text-indigo-600 block mt-1">node -v</code>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">NPM (v9+ or v10+)</span>
                <span className="text-slate-500 text-[11px]">Package manager (included with Node)</span>
                <code className="text-[10px] text-indigo-600 block mt-1">npm -v</code>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">Git</span>
                <span className="text-slate-500 text-[11px]">Source code repository cloning</span>
                <code className="text-[10px] text-indigo-600 block mt-1">git --version</code>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">Internal Storage Engine</span>
                <span className="text-slate-500 text-[11px]">Self-contained browser & memory store</span>
                <span className="text-[10px] text-emerald-600 font-mono block mt-1">Zero External DB Setup</span>
              </div>
            </div>
          </div>

          {/* Step by step commands */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900">2. Command-Line Installation Steps</h3>

            {/* Step 1 & 2 */}
            <div className="bg-slate-900 rounded-xl p-4 text-slate-100 text-xs font-mono relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                <span>Step A: Clone Repository & Install Dependencies</span>
                <button
                  onClick={() => handleCopy(`git clone <repo-url> sewplan-aps\ncd sewplan-aps\nnpm install`, 'step-a')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode === 'step-a' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-emerald-400 text-[11px] overflow-x-auto">
{`# 1. Clone repository & enter directory
git clone <repo-url> sewplan-aps
cd sewplan-aps

# 2. Install all dependencies (Vite, React 19, Tailwind CSS v4, Lucide Icons, SheetJS XLSX)
npm install`}
              </pre>
            </div>

            {/* Step 3: Run Dev Server */}
            <div className="bg-slate-900 rounded-xl p-4 text-slate-100 text-xs font-mono relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                <span>Step B: Start Local Development Server</span>
                <button
                  onClick={() => handleCopy(`npm run dev`, 'step-dev')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode === 'step-dev' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-emerald-400 text-[11px] overflow-x-auto">
{`# 1. Start the Vite development server
npm run dev

# 2. Open your browser:
# http://localhost:3000

# Full dataset (1,200 Orders, 60 Sewing Lines, 1,200 Material POs)
# loads automatically into internal memory & localStorage!`}
              </pre>
            </div>

            {/* Step 4: Production Build */}
            <div className="bg-slate-900 rounded-xl p-4 text-slate-100 text-xs font-mono relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                <span>Step C: Create Production Build (For Deployment)</span>
                <button
                  onClick={() => handleCopy(`npm run build\nnpm run preview`, 'step-build')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode === 'step-build' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-amber-300 text-[11px] overflow-x-auto">
{`# Compile optimized static bundle into /dist folder
npm run build

# Preview production build locally
npm run preview`}
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: EXPRESS API & MONGODB ARCHITECTURE */}
      {/* SECTION 6: HIGH-SPEED INTERNAL STORAGE & ARCHITECTURE */}
      {(activeSection === 'all' || activeSection === 'mongo_api') && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold">
              6
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                High-Performance Internal Storage Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Zero external database latency, in-browser persistence, and deterministic scheduling seeder.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              To eliminate external database bottlenecks, network latency, and connectivity requirements,
              SewPlan APS operates with an <strong>autonomous internal storage architecture</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">1. In-Memory APS Engine</span>
                <p className="text-[11px] text-slate-500">
                  Sub-millisecond planning runs across 1,200 orders and 60 lines with immediate Gantt canvas rendering and drag &amp; drop updates.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">2. Local Storage Persistence</span>
                <p className="text-[11px] text-slate-500">
                  State changes are automatically debounced and persisted to browser internal storage under <code className="text-indigo-600 font-mono">sewplan_aps_data_v4</code>.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">3. Portable JSON Backup</span>
                <p className="text-[11px] text-slate-500">
                  Users can export the full database state as a portable JSON file at any time from the Source Data Master screen.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs space-y-2 mt-4">
              <div className="text-emerald-400 font-bold">// Key Internal Storage Capabilities:</div>
              <div>• 1,200 realistic apparel sales orders (Zara, H&amp;M, Levi&apos;s, Nike, Uniqlo, Gap)</div>
              <div>• 60 production lines with dedicated SMV capabilities, learning curves, and shifts</div>
              <div>• 1,200 raw material purchase orders with strict inhouse date gating</div>
              <div>• 340 daily floor production output logs with real-time balance deductions</div>
              <div>• 1,262 planned blocks scheduled across the multi-line Gantt timeline</div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: AUTHENTICATION ROLES & PLAN EXPLANATION REPORT */}
      {(activeSection === 'all' || activeSection === 'auth_and_audit') && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
              7
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Authentication System, Role Permissions & Plan Explanation Report
              </h2>
              <p className="text-xs text-slate-500">
                User access control model (Admin vs. Viewer) and the comprehensive algorithmic explanation report with decision traceability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 7.1 Two Login Criteria */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Criterion 7.1: Two-Tier Login System
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                  Initial Key: 123
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Admin (Editable Mode) vs. Viewer (View Mode Only)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The application features a secure, dedicated login portal at startup with credential verification. Initial password for both accounts is <code className="text-indigo-600 font-bold font-mono">123</code>:
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <ShieldCheck className="w-4 h-4" />
                      1. Admin Account
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">admin / 123</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Full controller privileges: Sees the Planning Board in <strong>editable mode</strong> with drag-and-drop rescheduling, order splitting, simulation mode, AI studio, and all master configuration screens (Priority, Availability, Shifts, Holidays, Production, DB).
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Eye className="w-4 h-4 text-slate-500" />
                      2. Viewer Account
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">viewer / 123</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Shop floor and stakeholder read-only view: Sees the Planning Board in <strong>view mode only</strong> (all drag-and-drop, splitting, and administrative actions are locked), the <strong>Plan Explanation Report</strong>, and the <strong>Planning Report</strong> with Excel export.
                  </p>
                </div>
              </div>
            </div>

            {/* 7.2 Plan Explanation Report */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Feature 7.2: Plan Explanation Report
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                10-Column Algorithmic Decision Audit & Traceability
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A dedicated report screen detailing the exact mathematical and operational reasoning behind every block placed on the planning board:
              </p>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono space-y-1 text-slate-700">
                <div className="font-bold text-slate-900 font-sans mb-1 text-[11px]">Report Schema Columns:</div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div>1. Line No (Workcenter)</div>
                  <div>2. Sales Order (Buyer PO)</div>
                  <div>3. Customer Name</div>
                  <div>4. Style No & Description</div>
                  <div>5. Colorway (Color Index)</div>
                  <div>6. SMV (Standard Minutes)</div>
                  <div>7. Qty (Block Volume)</div>
                  <div>8. Plan Start Date (HH:MM)</div>
                  <div>9. Plan End Date (HH:MM)</div>
                  <div className="font-bold text-indigo-700">10. Reason of Plan</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-900">Reason of Plan Classification:</div>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc pl-4">
                  <li>
                    <strong className="text-amber-700">Manual update</strong>: Displayed whenever a planner forces or drags & drops a block from the UI to change its time.
                  </li>
                  <li>
                    <strong className="text-purple-700">Planned AI based based on Historical data</strong>: Displayed when generated by the historical closed-order machine learning engine.
                  </li>
                  <li>
                    <strong className="text-emerald-700">Standard Engine Priority & PSD</strong>: Explains line priority rank, Raw Material in-house relaxation (+3 days or ship - 35 + 3 days), line availability, and SMV capacity duration.
                  </li>
                  <li>
                    <strong className="text-sky-700">Auto-split</strong>: Documents concurrent line splitting and introduced block IDs to prevent ship date risk.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 8: FREE ONLINE HOSTING GUIDE */}
      {(activeSection === 'all' || activeSection === 'hosting') && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl flex items-center justify-center font-bold shadow-xs">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  How to Host This Project Online for Free (100% Free Hosting Guide)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Zero Cost • Zero Server Bills
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Deploy SewPlan APS to global high-speed CDN platforms in under 3 minutes with automatic HTTPS and free custom domain support.
              </p>
            </div>
          </div>

          {/* Architecture Advantage Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Why This Project is 100% Free to Host Anywhere</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Because SewPlan APS uses a <strong>Self-Contained Internal Storage Engine</strong> (in-memory scheduling algorithms + browser localStorage persistence), it has <strong>zero dependency on paid backend servers or MongoDB clusters</strong>.
              When you run <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-semibold text-emerald-900">npm run build</code>, Vite bundles everything into pure static HTML, CSS, and JavaScript inside the <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-semibold text-emerald-900">dist/</code> directory.
              This means you can host it forever on any free static hosting platform without paying a single cent!
            </p>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Vercel (Recommended)
              </span>
              <p className="text-[11px] text-slate-500">Fastest 1-click import from GitHub. Zero configuration required. Free SSL.</p>
              <span className="text-[10px] text-indigo-600 font-medium block">vercel.com</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Netlify
              </span>
              <p className="text-[11px] text-slate-500">Supports drag-and-drop of the dist/ folder directly, or Git auto-deployments.</p>
              <span className="text-[10px] text-indigo-600 font-medium block">netlify.com</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                GitHub Pages
              </span>
              <p className="text-[11px] text-slate-500">Host directly from your GitHub repository with built-in free GitHub Actions.</p>
              <span className="text-[10px] text-indigo-600 font-medium block">pages.github.com</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Cloudflare Pages
              </span>
              <p className="text-[11px] text-slate-500">Unlimited bandwidth on Cloudflare&apos;s 300+ city global edge CDN.</p>
              <span className="text-[10px] text-indigo-600 font-medium block">pages.cloudflare.com</span>
            </div>
          </div>

          {/* Universal Build Settings */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2 font-sans">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Universal Build Settings (Used on ALL hosting providers)
              </span>
              <span className="text-emerald-400 font-mono">Framework: Vite</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Build Command:</span>
                <span className="text-emerald-400 font-bold">npm run build</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Output Directory:</span>
                <span className="text-amber-300 font-bold">dist</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Install Command:</span>
                <span className="text-sky-300 font-bold">npm install</span>
              </div>
            </div>
          </div>

          {/* Option 1: Vercel Walkthrough */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs">▲</span>
                <h3 className="font-bold text-sm text-slate-900">Method 1: Deploy on Vercel (Easiest &amp; Most Popular)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">100% Free Forever</span>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600">
              <li>
                Create a free account at <strong className="text-slate-900">https://vercel.com</strong> (Sign in with your GitHub account).
              </li>
              <li>
                Push your project code to a GitHub repository:
                <div className="mt-2 bg-slate-900 rounded-lg p-3 text-emerald-400 font-mono text-[11px] relative">
                  <button
                    onClick={() => handleCopy(`git init\ngit add .\ngit commit -m "Initial commit for SewPlan APS"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/sewplan-aps.git\ngit push -u origin main`, 'git-push')}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-sans text-[10px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCode === 'git-push' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <pre className="overflow-x-auto">
{`git init
git add .
git commit -m "Initial commit of SewPlan APS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sewplan-aps.git
git push -u origin main`}
                  </pre>
                </div>
              </li>
              <li>
                On your Vercel Dashboard, click <strong className="text-slate-900">&quot;Add New...&quot; &gt; &quot;Project&quot;</strong>.
              </li>
              <li>
                Select your <strong className="text-slate-900">sewplan-aps</strong> repository and click <strong className="text-slate-900">&quot;Import&quot;</strong>.
              </li>
              <li>
                Vercel will automatically detect <strong className="text-emerald-700">Vite</strong> as the framework preset!
                Ensure Build Command is <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-900 font-mono">npm run build</code> and Output Directory is <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-900 font-mono">dist</code>.
              </li>
              <li>
                Click <strong className="text-emerald-700 font-bold">&quot;Deploy&quot;</strong>. Within 45 seconds, your live URL will be active (e.g. <code className="text-indigo-600 font-mono">https://sewplan-aps.vercel.app</code>)!
              </li>
            </ol>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
              💡 <em>Note:</em> The included <code className="font-mono text-indigo-700">vercel.json</code> file in this project already configures SPA URL rewriting so routing functions seamlessly.
            </div>
          </div>

          {/* Option 2: Netlify Walkthrough */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-xs">◆</span>
                <h3 className="font-bold text-sm text-slate-900">Method 2: Deploy on Netlify (Drag &amp; Drop or Git)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">100% Free Forever</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Way A: Instant Drag-and-Drop (No Git Needed!)</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                  <li>Run <code className="font-mono bg-white px-1 border rounded text-slate-800">npm run build</code> on your computer.</li>
                  <li>Sign up for free at <strong className="text-slate-900">https://app.netlify.com/drop</strong></li>
                  <li>Drag and drop the newly created <code className="font-mono bg-white px-1 border rounded text-emerald-700 font-bold">dist/</code> folder into the browser window.</li>
                  <li>Your site is live instantly on a free <code className="text-indigo-600">*.netlify.app</code> domain!</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Way B: Continuous Git Integration</span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                  <li>Log in to <strong className="text-slate-900">https://netlify.com</strong> with GitHub.</li>
                  <li>Click <strong className="text-slate-900">&quot;Add new site&quot; &gt; &quot;Import an existing project&quot;</strong>.</li>
                  <li>Choose GitHub and select your repository.</li>
                  <li>Set Build Command to <code className="font-mono bg-white px-1 border rounded text-slate-800">npm run build</code> and Publish directory to <code className="font-mono bg-white px-1 border rounded text-slate-800">dist</code>.</li>
                  <li>Click <strong className="text-teal-700 font-bold">&quot;Deploy Site&quot;</strong>.</li>
                </ol>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
              💡 <em>Note:</em> The project includes <code className="font-mono text-indigo-700">public/_redirects</code> (<code className="font-mono">/* /index.html 200</code>) which Netlify automatically detects for client-side routing.
            </div>
          </div>

          {/* Option 3: GitHub Pages Walkthrough */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-xs">gh</span>
                <h3 className="font-bold text-sm text-slate-900">Method 3: GitHub Pages (Directly from Repository)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Built-in to GitHub</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If your repository is already on GitHub, you can publish it straight to GitHub Pages using the official GitHub Actions workflow:
            </p>

            <div className="bg-slate-900 rounded-xl p-4 text-slate-100 text-xs font-mono relative">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                <span>Save this file as: .github/workflows/deploy.yml</span>
                <button
                  onClick={() => handleCopy(`name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4`, 'gh-action')}
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode === 'gh-action' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-sky-300 text-[11px] overflow-x-auto">
{`name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4`}
              </pre>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>After pushing that file:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Go to your GitHub repo &gt; <strong>Settings &gt; Pages</strong>.</li>
                <li>Under <strong>Source</strong>, select <strong className="text-slate-900">GitHub Actions</strong>.</li>
                <li>Every time you push to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">main</code>, GitHub automatically builds and deploys your site to <code className="text-indigo-600 font-mono">https://YOUR_USERNAME.github.io/YOUR_REPO/</code>!</li>
              </ol>
            </div>
          </div>

          {/* Option 4: Cloudflare Pages Walkthrough */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center font-bold text-xs">☁</span>
                <h3 className="font-bold text-sm text-slate-900">Method 4: Cloudflare Pages</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">Unlimited Bandwidth</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
              <li>Sign in to <strong className="text-slate-900">https://dash.cloudflare.com</strong> and open <strong>Workers &amp; Pages</strong>.</li>
              <li>Click <strong>Create application &gt; Pages &gt; Connect to Git</strong>.</li>
              <li>Select your repository. In <strong>Build settings</strong>:</li>
              <ul className="list-disc list-inside pl-6 space-y-0.5 font-mono text-[11px] text-slate-700">
                <li>Framework preset: <strong className="text-slate-900">Vite</strong></li>
                <li>Build command: <strong className="text-slate-900">npm run build</strong></li>
                <li>Build output directory: <strong className="text-slate-900">dist</strong></li>
              </ul>
              <li>Click <strong>Save and Deploy</strong>. Cloudflare distributes your static app across 300+ global edge data centers.</li>
            </ol>
          </div>

          {/* Custom Domain & HTTPS note */}
          <div className="p-4 bg-slate-900 text-slate-300 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Can I Use My Own Custom Domain for Free?</span>
            </div>
            <p className="leading-relaxed">
              <strong>Yes!</strong> All four providers (Vercel, Netlify, GitHub Pages, and Cloudflare Pages) let you connect your own custom domain (e.g. <code className="text-emerald-400 font-mono">sewplan.yourfactory.com</code>) at <strong>no cost</strong>.
              They all issue free automatic SSL / HTTPS certificates through Let&apos;s Encrypt and handle automatic renewal.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

