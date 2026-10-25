import React, { useState, useMemo } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { PlannedBlock, ProductCategory, BlockStatus } from '../types';
import { CUSTOMERS, PRODUCT_CATEGORIES } from '../utils/seeder';
import { parseTimeToWorkingMinute, formatWorkingMinuteToTime } from '../utils/planningEngine';
import { RescheduleModal } from './RescheduleModal';
import { SplitModal } from './SplitModal';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Scissors,
  Layers,
  Sparkles,
  Clock,
  Clock4,
  Eye,
  RotateCcw
} from 'lucide-react';

const SHIFT_HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '18:50'
];

interface PlanningBoardProps {
  onOpenRunPlanModal?: () => void;
  isReadOnly?: boolean;
}

export const PlanningBoard: React.FC<PlanningBoardProps> = ({
  onOpenRunPlanModal,
  isReadOnly = false
}) => {
  const {
    activePlan,
    tempPlan,
    planMode,
    workcenters,
    currentKPIs,
    moveBlock,
    shiftBlock,
    confirmTempPlan,
    discardTempPlan,
    isAIPlanDraft
  } = usePlanning();

  const currentPlan = planMode === 'temp' && tempPlan ? tempPlan : activePlan;

  // Modals state
  const [selectedBlockForModal, setSelectedBlockForModal] = useState<PlannedBlock | null>(null);
  const [modalTargetLine, setModalTargetLine] = useState<string>('WC-01');
  const [modalTargetDate, setModalTargetDate] = useState<string>('2027-01-02');
  const [modalTargetTime, setModalTargetTime] = useState<string>('08:00');
  const [modalTitle, setModalTitle] = useState<string>('Order Block Schedule & Timing Details');
  const [splitBlockTarget, setSplitBlockTarget] = useState<PlannedBlock | null>(null);

  // Drag and drop tracking
  const [isDraggingBlockId, setIsDraggingBlockId] = useState<string | null>(null);
  const [dragOverLineId, setDragOverLineId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'on_time' | 'material_delay' | 'ship_date_risk'>('ALL');
  const [buildingFilter, setBuildingFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');

  // Time navigation & Zoom state (Requirement 1: Hours level view option)
  const [viewMode, setViewMode] = useState<'hours' | 'day' | 'standard' | 'compact'>('day');
  const [viewDateOffset, setViewDateOffset] = useState<number>(0); // Start from Jan 1, 2027

  // View parameters based on viewMode
  const { visibleDaysCount, cellWidth, hourCellWidth } = useMemo(() => {
    switch (viewMode) {
      case 'hours':
        return { visibleDaysCount: 6, cellWidth: 468, hourCellWidth: 39 };
      case 'day':
        return { visibleDaysCount: 22, cellWidth: 62, hourCellWidth: 20 };
      case 'standard':
        return { visibleDaysCount: 35, cellWidth: 42, hourCellWidth: 15 };
      case 'compact':
        return { visibleDaysCount: 50, cellWidth: 28, hourCellWidth: 10 };
      default:
        return { visibleDaysCount: 22, cellWidth: 62, hourCellWidth: 20 };
    }
  }, [viewMode]);

  // Generate date array for current viewport
  const timelineDates = useMemo(() => {
    const dates: string[] = [];
    const base = new Date('2027-01-01T00:00:00');
    base.setDate(base.getDate() + viewDateOffset);

    for (let i = 0; i < visibleDaysCount; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, [viewDateOffset, visibleDaysCount]);

  // Filtered workcenters
  const filteredWorkcenters = useMemo(() => {
    return workcenters.filter((wc) => {
      if (buildingFilter === 'A') {
        const lineNum = parseInt(wc.workcenter_id.replace('WC-', ''));
        if (lineNum > 20) return false;
      } else if (buildingFilter === 'B') {
        const lineNum = parseInt(wc.workcenter_id.replace('WC-', ''));
        if (lineNum <= 20 || lineNum > 40) return false;
      } else if (buildingFilter === 'C') {
        const lineNum = parseInt(wc.workcenter_id.replace('WC-', ''));
        if (lineNum <= 40) return false;
      }

      if (selectedCategory !== 'ALL' && wc.current_category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [workcenters, buildingFilter, selectedCategory]);

  // Group blocks by workcenter
  const blocksByWorkcenter = useMemo(() => {
    const map = new Map<string, PlannedBlock[]>();
    workcenters.forEach((wc) => map.set(wc.workcenter_id, []));

    currentPlan.forEach((block) => {
      // Apply filters
      if (selectedCustomer !== 'ALL' && block.customer_name !== selectedCustomer) return;
      if (selectedCategory !== 'ALL' && block.product_category !== selectedCategory) return;
      if (statusFilter !== 'ALL' && block.status !== statusFilter) return;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          block.sales_order_no.toLowerCase().includes(query) ||
          block.buyer_po.toLowerCase().includes(query) ||
          block.style_no.toLowerCase().includes(query) ||
          block.customer_name.toLowerCase().includes(query);
        if (!matches) return;
      }

      const list = map.get(block.workcenter_id) || [];
      list.push(block);
      map.set(block.workcenter_id, list);
    });

    return map;
  }, [currentPlan, workcenters, selectedCustomer, selectedCategory, statusFilter, searchQuery]);

  // Helper to calculate X position and width with sub-day and hour precision (Requirement 1)
  const getBlockStyle = (block: PlannedBlock) => {
    const viewStartStr = timelineDates[0];
    const blockStart = new Date(block.start_date + 'T00:00:00').getTime();
    const blockEnd = new Date(block.end_date + 'T00:00:00').getTime();
    const viewStart = new Date(viewStartStr + 'T00:00:00').getTime();

    const diffDaysFromStart = Math.round((blockStart - viewStart) / 86400000);
    const daySpan = Math.round((blockEnd - blockStart) / 86400000);

    const startMin = parseTimeToWorkingMinute(block.start_time || '08:00');
    const endMin = parseTimeToWorkingMinute(block.end_time || '18:50');
    const NET_DAY_MINS = 590; // 08:00 to 18:50 working minutes

    const startFraction = Math.min(0.95, Math.max(0, startMin / NET_DAY_MINS));
    const endFraction = Math.min(1.0, Math.max(0.05, endMin / NET_DAY_MINS));

    if (viewMode === 'hours') {
      const dayWidth = cellWidth; // 468px
      const left = diffDaysFromStart * dayWidth + (startFraction * dayWidth);

      let width: number;
      if (daySpan === 0) {
        const frac = Math.max(0.08, endFraction - startFraction);
        width = frac * dayWidth - 4;
      } else {
        const fullDays = Math.max(0, daySpan - 1);
        const frac = (1.0 - startFraction) + fullDays + endFraction;
        width = frac * dayWidth - 4;
      }

      return {
        left: `${Math.round(left)}px`,
        width: `${Math.max(38, Math.round(width))}px`
      };
    }

    // Day / Standard / Compact with sub-day hour offsets:
    const left = diffDaysFromStart * cellWidth + (startFraction * cellWidth);
    let width: number;
    if (daySpan === 0) {
      const frac = Math.max(0.14, endFraction - startFraction);
      width = frac * cellWidth - 3;
    } else {
      const fullDays = Math.max(0, daySpan - 1);
      const frac = (1.0 - startFraction) + fullDays + endFraction;
      width = frac * cellWidth - 4;
    }

    return {
      left: `${Math.round(left)}px`,
      width: `${Math.max(28, Math.round(width))}px`
    };
  };

  const getCustomerMeta = (custName: string) => {
    return CUSTOMERS.find((c) => c.name === custName) || CUSTOMERS[0];
  };

  // Drag and drop handler:
  // - On same line: immediately repositions order and cascades adjacent bars (updating their dates and times)
  // - Across different lines: opens RescheduleModal with prefilled line, date, and suggested start time (Requirement 3)
  // - Read-only mode: disabled completely
  const handleCellDrop = (targetLineId: string, targetDate: string, e: React.DragEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    const blockId = e.dataTransfer.getData('text/plain');
    if (!blockId) return;

    const block = currentPlan.find((b) => b.block_id === blockId);
    if (!block) return;

    // Moving on the SAME line: execute immediate ripple/cascade move!
    if (block.workcenter_id === targetLineId) {
      let targetTime = block.start_time || '08:00';
      if (viewMode === 'hours') {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const offsetX = Math.max(0, e.clientX - rect.left);
        const fraction = Math.max(0, Math.min(0.95, offsetX / cellWidth));
        const workingMins = Math.round(fraction * 590);
        targetTime = formatWorkingMinuteToTime(workingMins, '08:00');
      }

      moveBlock(block.block_id, targetLineId, targetDate, targetTime);
      setDragOverLineId(null);
      setIsDraggingBlockId(null);
      return;
    }

    // Moving to a DIFFERENT line -> Open modal to review line transfer
    const existing = currentPlan.filter(
      (b) => b.workcenter_id === targetLineId && b.end_date === targetDate && b.block_id !== blockId
    );
    let suggestedTime = '08:00';
    if (existing.length > 0) {
      const sorted = [...existing].sort((a, b) =>
        (b.end_time || '08:00').localeCompare(a.end_time || '08:00')
      );
      suggestedTime = sorted[0].end_time || '08:00';
    }

    setSelectedBlockForModal(block);
    setModalTargetLine(targetLineId);
    setModalTargetDate(targetDate);
    setModalTargetTime(suggestedTime);
    setModalTitle(`Confirm Line Transfer: Move ${block.sales_order_no} to ${targetLineId}`);
    setDragOverLineId(null);
    setIsDraggingBlockId(null);
  };

  const handleBlockClick = (block: PlannedBlock) => {
    setSelectedBlockForModal(block);
    setModalTargetLine(block.workcenter_id);
    setModalTargetDate(block.start_date);
    setModalTargetTime(block.start_time || '08:00');
    setModalTitle(isReadOnly ? 'Order Production Schedule Details (Read-Only)' : 'Order Block Schedule & Start Timing Details');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-slate-100 overflow-hidden">
      {/* Top Controls & KPI Bar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 space-y-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: View & Filter Summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Sewing Line Gantt Board
              </span>
              {isReadOnly ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  <Eye className="w-3 h-3 text-emerald-600" />
                  <span>End-User View (Read-Only)</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-normal">
                  ({filteredWorkcenters.length} of 60 lines visible)
                </span>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Quick KPI stats */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-medium">
              <span className="text-slate-600">
                Total Orders: <strong className="text-slate-900 font-bold tabular-nums">{currentKPIs.totalOrders}</strong>
              </span>
              <span className="text-slate-600">
                Volume: <strong className="text-slate-900 font-bold tabular-nums">{currentKPIs.totalPieces.toLocaleString()} pcs</strong>
              </span>
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <strong className="tabular-nums">{currentKPIs.onTimeBlocks}</strong> On-Time
              </span>
              {currentKPIs.materialDelayedBlocks > 0 && (
                <span className="text-amber-700 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <strong className="tabular-nums">{currentKPIs.materialDelayedBlocks}</strong> RM Delayed
                </span>
              )}
              {currentKPIs.shipRiskBlocks > 0 && (
                <span className="text-rose-700 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <strong className="tabular-nums">{currentKPIs.shipRiskBlocks}</strong> Ship Risk
                </span>
              )}
            </div>
          </div>

          {/* Right: Timeline Zoom & Date Navigation Controls (Requirement 1) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Jump Buttons */}
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 text-xs">
              <button
                onClick={() => setViewDateOffset((prev) => Math.max(0, prev - (viewMode === 'hours' ? 5 : 14)))}
                title="Scroll Previous"
                className="p-1 hover:bg-white rounded transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewDateOffset(0)}
                className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                  viewDateOffset < 31 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Jan
              </button>
              <button
                onClick={() => setViewDateOffset(31)}
                className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                  viewDateOffset >= 31 && viewDateOffset < 59 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Feb
              </button>
              <button
                onClick={() => setViewDateOffset(59)}
                className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                  viewDateOffset >= 59 && viewDateOffset < 90 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Mar
              </button>
              <button
                onClick={() => setViewDateOffset(90)}
                className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                  viewDateOffset >= 90 && viewDateOffset < 120 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Apr
              </button>
              <button
                onClick={() => setViewDateOffset(120)}
                className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                  viewDateOffset >= 120 && viewDateOffset < 151 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                May
              </button>
              <button
                onClick={() => setViewDateOffset(151)}
                className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                  viewDateOffset >= 151 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Jun
              </button>
              <button
                onClick={() => setViewDateOffset((prev) => prev + (viewMode === 'hours' ? 5 : 14))}
                title="Scroll Next"
                className="p-1 hover:bg-white rounded transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Toggle: Hours View / Day / Standard / Compact */}
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('hours')}
                title="Hours Level View: View individual shift working hours (08:00 - 18:50)"
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'hours' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Clock4 className="w-3.5 h-3.5" />
                <span>Hours View</span>
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('standard')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'standard' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'compact' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Compact
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Filters, Search, and Building Segments */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
          {/* Building Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 overflow-x-auto max-w-full">
            <button
              onClick={() => setBuildingFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                buildingFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 60 Lines
            </button>
            <button
              onClick={() => setBuildingFilter('A')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                buildingFilter === 'A' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bldg A (01-20)
            </button>
            <button
              onClick={() => setBuildingFilter('B')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                buildingFilter === 'B' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bldg B (21-40)
            </button>
            <button
              onClick={() => setBuildingFilter('C')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                buildingFilter === 'C' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bldg C (41-60)
            </button>
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Order / PO / Style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800 w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              aria-label="Filter by customer"
              className="border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Customers</option>
              {CUSTOMERS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by product category"
              className="border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by production delay status"
              className="border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="on_time">On Time Only</option>
              <option value="material_delay">Material Delay (Amber)</option>
              <option value="ship_date_risk">Ship Date Risk (Red)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Simulation / Temporary Planning Board Action Bar */}
      {!isReadOnly && planMode === 'temp' && tempPlan && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white px-4 py-2 border-b border-amber-600 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{isAIPlanDraft ? 'Temporary AI Plan Active' : 'Temporary Plan Mode'}</span>
            </span>
            <span className="font-medium text-amber-50">
              {isAIPlanDraft
                ? `Empirical AI Schedule (${tempPlan.length} blocks). Move bars left/right to ripple adjacent orders & auto-update times. Review and publish when ready.`
                : `Draft schedule (${tempPlan.length} blocks). Test drag-and-drop or line splits before publishing.`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={discardTempPlan}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Draft</span>
            </button>
            <button
              onClick={confirmTempPlan}
              className="px-3.5 py-1 bg-white text-amber-950 hover:bg-amber-50 rounded text-xs font-black transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Publish to Actual Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* End-User View Indicator Banner */}
      {isReadOnly && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-600" />
              <span>End-User Portal (Read-Only)</span>
            </span>
            <span className="font-medium text-emerald-800">
              Viewing authorized factory production schedule. Click any order block to inspect garment specifications, buyer PO, and timing details. (Modifications are locked).
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold hidden md:inline">
            Authoritative Shop-Floor Schedule
          </span>
        </div>
      )}

      {/* Main Gantt Grid Area */}
      <div className="flex-1 overflow-auto bg-slate-200/60 relative">
        <div className="min-w-max bg-white">
          {/* Gantt Header: Workcenter column + Day/Hour timeline columns */}
          <div className="sticky top-0 z-20 flex bg-slate-800 text-white text-xs border-b border-slate-700 shadow-sm">
            {/* Left Header Corner */}
            <div className="w-64 shrink-0 px-4 py-2.5 bg-slate-900 border-r border-slate-700 font-semibold flex items-center justify-between">
              <span>Workcenter (Line Cadre)</span>
              <span className="text-[11px] text-slate-400 font-normal">Daily SAH</span>
            </div>

            {/* Timeline Headers */}
            <div className="flex">
              {timelineDates.map((dateStr) => {
                const dateObj = new Date(dateStr + 'T00:00:00');
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const isFriday = dateObj.getDay() === 5; // Standard weekly off

                if (viewMode === 'hours') {
                  // In Hours mode: render day title + 12 shift hour slots
                  return (
                    <div
                      key={dateStr}
                      style={{ width: `${cellWidth}px` }}
                      className={`shrink-0 border-r border-slate-700 ${
                        isFriday ? 'bg-slate-950/80 text-rose-300' : 'bg-slate-800'
                      }`}
                    >
                      <div className="py-1 px-2 text-center font-bold text-[11px] border-b border-slate-700/80 bg-slate-900/60">
                        {dayName}, {dateStr.slice(5)} {isFriday ? '(Weekly Off)' : ''}
                      </div>
                      <div className="flex text-[9px] font-mono text-slate-400">
                        {SHIFT_HOURS.map((hr, hrIdx) => (
                          <div
                            key={hr}
                            style={{ width: `${hourCellWidth}px` }}
                            className={`py-0.5 text-center border-r border-slate-700/40 ${
                              hr === '13:00' ? 'bg-amber-900/40 text-amber-300 font-semibold' : ''
                            }`}
                            title={hr === '13:00' ? '13:00 - 14:00 Lunch Break' : `Hour slot: ${hr}`}
                          >
                            {hr.slice(0, 2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Day / Standard / Compact header
                return (
                  <div
                    key={dateStr}
                    style={{ width: `${cellWidth}px` }}
                    className={`shrink-0 text-center py-2.5 border-r border-slate-700 font-mono text-[11px] select-none ${
                      isFriday ? 'bg-slate-950/80 text-rose-300' : ''
                    }`}
                  >
                    <div className="text-[10px] uppercase font-sans text-slate-400 font-medium">
                      {dayName}
                    </div>
                    <div className="font-bold">{dateStr.slice(5)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gantt Rows: 60 Sewing Lines */}
          <div className="divide-y divide-slate-200">
            {filteredWorkcenters.map((wc) => {
              const lineBlocks = blocksByWorkcenter.get(wc.workcenter_id) || [];
              const isOverThisLine = dragOverLineId === wc.workcenter_id;

              return (
                <div
                  key={wc.workcenter_id}
                  className={`flex h-16 hover:bg-slate-50/70 transition-colors ${
                    isOverThisLine ? 'bg-indigo-50/80 ring-2 ring-indigo-500 z-10' : ''
                  }`}
                >
                  {/* Left Workcenter Metadata Column */}
                  <div className="w-64 shrink-0 px-4 py-2 border-r border-slate-200 bg-white flex flex-col justify-center sticky left-0 z-10">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {wc.workcenter_id}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {wc.standard_cadre} Carder
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {wc.name} · {wc.current_category}
                    </div>
                  </div>

                  {/* Timeline Lane with Drop Targets */}
                  <div className="flex relative">
                    {/* Background Day Cells */}
                    {timelineDates.map((dateStr) => {
                      const dateObj = new Date(dateStr + 'T00:00:00');
                      const isFriday = dateObj.getDay() === 5;

                      return (
                        <div
                          key={dateStr}
                          style={{ width: `${cellWidth}px` }}
                          onDragOver={(e) => {
                            if (isReadOnly) return;
                            e.preventDefault();
                            setDragOverLineId(wc.workcenter_id);
                          }}
                          onDragLeave={() => {
                            if (isReadOnly) return;
                            if (dragOverLineId === wc.workcenter_id) {
                              setDragOverLineId(null);
                            }
                          }}
                          onDrop={(e) => {
                            if (!isReadOnly) handleCellDrop(wc.workcenter_id, dateStr, e);
                          }}
                          className={`shrink-0 border-r border-slate-200/80 h-full relative transition-colors ${
                            isFriday ? 'bg-slate-100/70' : 'bg-white'
                          } ${
                            !isReadOnly && isOverThisLine ? 'bg-indigo-50/50' : ''
                          }`}
                        >
                          {/* In Hours mode, render vertical guide lines for each shift hour */}
                          {viewMode === 'hours' && (
                            <div className="absolute inset-0 flex pointer-events-none">
                              {SHIFT_HOURS.map((hr, idx) => (
                                <div
                                  key={hr}
                                  style={{ width: `${hourCellWidth}px` }}
                                  className={`h-full border-r border-slate-100/90 ${
                                    hr === '13:00' ? 'bg-amber-50/30' : ''
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Planned Blocks on this Line */}
                    {lineBlocks.map((block) => {
                      const style = getBlockStyle(block);
                      const viewStart = new Date(timelineDates[0] + 'T00:00:00').getTime();
                      const blockStart = new Date(block.start_date + 'T00:00:00').getTime();
                      const blockEnd = new Date(block.end_date + 'T00:00:00').getTime();

                      const diffDays = Math.round((blockStart - viewStart) / 86400000);
                      const dur = Math.round((blockEnd - blockStart) / 86400000) + 1;
                      if (diffDays + dur < -1 || diffDays > visibleDaysCount + 2) {
                        return null;
                      }

                      const custMeta = getCustomerMeta(block.customer_name);
                      const isMaterialDelay = block.status === 'material_delay';
                      const isShipRisk = block.status === 'ship_date_risk';
                      const isDraggingThis = isDraggingBlockId === block.block_id;

                      return (
                        <div
                          key={block.block_id}
                          style={style}
                          draggable={!isReadOnly}
                          onDragStart={(e) => {
                            if (isReadOnly) return;
                            e.dataTransfer.setData('text/plain', block.block_id);
                            setIsDraggingBlockId(block.block_id);
                          }}
                          onDragEnd={() => {
                            if (isReadOnly) return;
                            setIsDraggingBlockId(null);
                            setDragOverLineId(null);
                          }}
                          onClick={() => handleBlockClick(block)}
                          title={`[Block ID: ${block.block_id}]\nOrder: ${block.sales_order_no} (${block.buyer_po}) | Buyer: ${block.customer_name}\nStyle: ${block.style_no} | Color: ${block.color} ${block.color_index ? `(Color ${block.color_index} of ${block.total_colors || 1})` : ''}\nQuantity: ${block.planned_qty.toLocaleString()} pcs\nDuration (Block Qty × SMV): ${(block.planned_qty * block.smv).toLocaleString()} Standard Minutes (SMV ${block.smv})\nSchedule: ${block.start_date} ${block.start_time || '08:00'} ➔ ${block.end_date} ${block.end_time || '18:50'}\nShip Date: ${block.ship_date}${block.parent_block_id ? `\nSplit From: ${block.parent_block_id}` : ''}`}
                          className={`absolute top-2 h-12 rounded-md p-1.5 text-xs shadow-xs border select-none transition-all overflow-hidden flex flex-col justify-between group/block ${
                            isReadOnly ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400' : 'cursor-grab active:cursor-grabbing hover:scale-[1.01] hover:z-30'
                          } ${
                            isDraggingThis ? 'opacity-40 ring-2 ring-indigo-500' : ''
                          } ${
                            isMaterialDelay
                              ? 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                              : isShipRisk
                              ? 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-400'
                              : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          {/* Left Customer Color Stripe */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1.5"
                            style={{ backgroundColor: custMeta.color }}
                          />

                          {/* Top Row: Customer & Order No & Time / Status Indicator */}
                          <div className="flex items-center justify-between pl-1 gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="font-bold text-[11px] truncate tracking-tight text-slate-900">
                                {block.customer_name} · {block.sales_order_no}
                              </span>
                              <span
                                className="px-1 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[9px] font-bold border border-slate-200 shrink-0"
                                title={`System Generated Block ID: ${block.block_id}`}
                              >
                                {block.block_id.replace(/^BLK-SO-\d{4}-/, 'B-')}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Prominent Start & End Time Badge (Requirement 1) */}
                              <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200/60 hidden sm:inline-flex items-center gap-0.5">
                                <span>{block.start_time || '08:00'}</span>
                                <span className="text-slate-400">➔</span>
                                <span>{block.end_time || '18:50'}</span>
                              </span>

                              {/* Quick Shift & Split Buttons on hover (Planner Only) */}
                              {!isReadOnly && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      shiftBlock(block.block_id, 'left', viewMode === 'hours' ? 'hour' : 'day');
                                    }}
                                    title="Shift Left / Earlier (moves bar & cascades adjacent orders)"
                                    className="hidden group-hover/block:flex items-center justify-center w-4 h-4 rounded bg-slate-200 hover:bg-indigo-600 hover:text-white text-slate-700 transition-colors"
                                  >
                                    <ChevronLeft className="w-2.5 h-2.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      shiftBlock(block.block_id, 'right', viewMode === 'hours' ? 'hour' : 'day');
                                    }}
                                    title="Shift Right / Later (moves bar & cascades next orders)"
                                    className="hidden group-hover/block:flex items-center justify-center w-4 h-4 rounded bg-slate-200 hover:bg-indigo-600 hover:text-white text-slate-700 transition-colors"
                                  >
                                    <ChevronRight className="w-2.5 h-2.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSplitBlockTarget(block);
                                    }}
                                    title="Split Quantity to another line"
                                    className="hidden group-hover/block:flex items-center justify-center w-4 h-4 rounded bg-slate-200 hover:bg-indigo-600 hover:text-white text-slate-700 transition-colors"
                                  >
                                    <Scissors className="w-2.5 h-2.5" />
                                  </button>
                                </>
                              )}

                              {isMaterialDelay ? (
                                <span className="bg-amber-500 text-white text-[9px] font-bold px-1 py-0.2 rounded shrink-0 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  RM
                                </span>
                              ) : isShipRisk ? (
                                <span className="bg-rose-600 text-white text-[9px] font-bold px-1 py-0.2 rounded shrink-0 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Late
                                </span>
                              ) : (
                                <span className="text-[9px] text-emerald-600 font-semibold shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bottom Row: Style, Qty, and Shift Timing */}
                          <div className="flex items-center justify-between text-[10px] pl-1 text-slate-600">
                            <span className="truncate">
                              {block.style_no} ({block.color})
                            </span>
                            <span className="font-semibold tabular-nums text-slate-900 shrink-0 ml-1">
                              {block.planned_qty.toLocaleString()} pcs
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Color Legend & Guidance Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-800">Customer Palettes:</span>
          {CUSTOMERS.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400" />
            <span className="font-medium text-amber-900">Material Delay (Inhouse &gt; Start)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-400" />
            <span className="font-medium text-rose-900">Ship Date Risk (&gt; Ship Date)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white border border-slate-300" />
            <span>On-Time Normal</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RescheduleModal
        block={selectedBlockForModal}
        initialTargetLine={modalTargetLine}
        initialStartDate={modalTargetDate}
        initialStartTime={modalTargetTime}
        title={modalTitle}
        isReadOnly={isReadOnly}
        onClose={() => setSelectedBlockForModal(null)}
        onOpenSplit={(block) => setSplitBlockTarget(block)}
      />

      {!isReadOnly && (
        <SplitModal
          block={splitBlockTarget}
          onClose={() => setSplitBlockTarget(null)}
        />
      )}
    </div>
  );
};
