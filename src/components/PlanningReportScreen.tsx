import React, { useState, useMemo } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { CUSTOMERS, PRODUCT_CATEGORIES } from '../utils/seeder';
import { exportProductionPlanToExcel } from '../utils/excelExporter';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Send,
  Building,
  Check,
  X,
  Eye
} from 'lucide-react';

const DEPARTMENTS = [
  'All Production Departments',
  'Cutting Department',
  'Sewing Production Department',
  'Quality Assurance (QA/QC)',
  'Central Merchandising',
  'Raw Material / Fabric Store',
  'Industrial Engineering (IE)'
];

interface PlanningReportScreenProps {
  isReadOnly?: boolean;
}

export const PlanningReportScreen: React.FC<PlanningReportScreenProps> = ({
  isReadOnly = false
}) => {
  const { activePlan, tempPlan, planMode, workcenters, currentKPIs } = usePlanning();
  const currentPlan = planMode === 'temp' && tempPlan ? tempPlan : activePlan;

  const [reportTab, setReportTab] = useState<'matrix' | 'summary'>('matrix');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Excel Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDept, setExportDept] = useState('All Production Departments');
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');
  const [incMatrix, setIncMatrix] = useState(true);
  const [incSummary, setIncSummary] = useState(true);
  const [incSignoff, setIncSignoff] = useState(true);

  // Pagination for heavy matrix
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    return currentPlan.filter((b) => {
      if (customerFilter !== 'ALL' && b.customer_name !== customerFilter) return false;
      if (categoryFilter !== 'ALL' && b.product_category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.sales_order_no.toLowerCase().includes(q) ||
          b.buyer_po.toLowerCase().includes(q) ||
          b.style_no.toLowerCase().includes(q) ||
          b.customer_name.toLowerCase().includes(q) ||
          b.workcenter_id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [currentPlan, customerFilter, categoryFilter, statusFilter, searchQuery]);

  // Extract all unique dates present in current visible blocks' daily allocations
  const reportDates = useMemo(() => {
    const datesSet = new Set<string>();
    filteredBlocks.slice(0, 100).forEach((b) => {
      Object.keys(b.daily_allocations || {}).forEach((d) => datesSet.add(d));
    });
    return Array.from(datesSet).sort().slice(0, 20); // Top 20 active dates for display
  }, [filteredBlocks]);

  const totalPages = Math.ceil(filteredBlocks.length / pageSize);
  const paginatedBlocks = filteredBlocks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Line Summary calculations
  const workcenterSummaries = useMemo(() => {
    return workcenters.map((wc) => {
      const lineBlocks = currentPlan.filter((b) => b.workcenter_id === wc.workcenter_id);
      const totalPlannedQty = lineBlocks.reduce((sum, b) => sum + b.planned_qty, 0);
      const delayedCount = lineBlocks.filter((b) => b.status !== 'on_time').length;
      const onTimeRate = lineBlocks.length > 0
        ? Math.round(((lineBlocks.length - delayedCount) / lineBlocks.length) * 100)
        : 100;

      // Daily SAH minutes for this line
      const dailyMinutes = Math.round(wc.standard_cadre * 9.83 * 60 * 0.80);
      const earliestBlock = lineBlocks.length > 0 ? lineBlocks[0] : null;
      const latestBlock = lineBlocks.length > 0 ? lineBlocks[lineBlocks.length - 1] : null;
      const earliestStart = earliestBlock ? `${earliestBlock.start_date} ${earliestBlock.start_time || '08:00'}` : 'N/A';
      const latestEnd = latestBlock ? `${latestBlock.end_date} ${latestBlock.end_time || '18:50'}` : 'N/A';

      return {
        workcenter_id: wc.workcenter_id,
        name: wc.name,
        floor: wc.floor,
        category: wc.current_category,
        cadre: wc.standard_cadre,
        dailyMinutes,
        orderCount: lineBlocks.length,
        totalPlannedQty,
        onTimeRate,
        earliestStart,
        latestEnd
      };
    });
  }, [workcenters, currentPlan]);

  // Trigger Excel Export (.xlsx)
  const handleExecuteExcelExport = () => {
    const targetBlocks = exportScope === 'filtered' ? filteredBlocks : currentPlan;
    const dateStr = new Date().toISOString().split('T')[0];
    const deptSlug = exportDept.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `SewPlan_${deptSlug}_${dateStr}.xlsx`;

    let activeFilterStr = `Scope: ${exportScope === 'filtered' ? 'Current Filters' : 'All Factory'}`;
    if (customerFilter !== 'ALL') activeFilterStr += ` | Buyer: ${customerFilter}`;
    if (categoryFilter !== 'ALL') activeFilterStr += ` | Cat: ${categoryFilter}`;
    if (statusFilter !== 'ALL') activeFilterStr += ` | Status: ${statusFilter}`;

    exportProductionPlanToExcel(targetBlocks, workcenters, reportDates, {
      fileName,
      departmentName: exportDept,
      includeDailyMatrix: incMatrix,
      includeLineSummary: incSummary,
      includeDistributionSignoff: incSignoff,
      activeFilterSummary: activeFilterStr
    });

    setIsExportModalOpen(false);
  };

  const handleQuickExcelExport = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    exportProductionPlanToExcel(filteredBlocks, workcenters, reportDates, {
      fileName: `SewPlan_Production_Schedule_${dateStr}.xlsx`,
      departmentName: 'All Production Departments',
      includeDailyMatrix: true,
      includeLineSummary: true,
      includeDistributionSignoff: true,
      activeFilterSummary: 'Current Filtered View'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Production Planning &amp; Daily Allocation Report
            </h1>
            {isReadOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>End-User View (Read-Only)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Exportable department schedule matrix with daily quantity breakdown and sewing line utilization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleQuickExcelExport}
            className="px-3.5 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Instant download of current view as .xlsx"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Quick Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Department Excel Workbook...</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Planned Garment Volume
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {currentKPIs.totalPieces.toLocaleString()} <span className="text-xs font-normal text-slate-500">pcs</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled on 60 sewing lines</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            On-Time Delivery Rate
          </span>
          <p className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
            {currentKPIs.totalBlocks > 0
              ? Math.round((currentKPIs.onTimeBlocks / currentKPIs.totalBlocks) * 100)
              : 0}%
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {currentKPIs.onTimeBlocks} of {currentKPIs.totalBlocks} blocks aligned
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Raw Material Delays
          </span>
          <p className="text-xl font-bold text-amber-600 mt-1 tabular-nums">
            {currentKPIs.materialDelayedBlocks} <span className="text-xs font-normal text-slate-500">orders</span>
          </p>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">RM Inhouse &gt; Planned Start</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Active Planning Mode
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 capitalize">
            {planMode === 'temp' ? 'Draft Simulation' : 'Live Confirmed Plan'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {planMode === 'temp' ? 'Pending Planner Approval' : 'Distributed to Floor'}
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Navigation Tabs & Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => {
                setReportTab('matrix');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                reportTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order Daily Planned Output Matrix
            </button>
            <button
              onClick={() => {
                setReportTab('summary');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                reportTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Workcenter Line Summary (60 Lines)
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {reportTab === 'matrix' && (
              <>
                <select
                  value={customerFilter}
                  onChange={(e) => {
                    setCustomerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter report by buyer"
                  className="border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white text-slate-800"
                >
                  <option value="ALL">All Buyers</option>
                  {CUSTOMERS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter report by category"
                  className="border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white text-slate-800"
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
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter report by status"
                  className="border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white text-slate-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="on_time">On-Time</option>
                  <option value="material_delay">Material Delay</option>
                  <option value="ship_date_risk">Ship Date Risk</option>
                </select>
              </>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search orders or lines..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800 w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* View 1: Order Daily Planned Output Matrix */}
        {reportTab === 'matrix' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10">Order No · PO</th>
                  <th className="py-2.5 px-3">Buyer</th>
                  <th className="py-2.5 px-3">Style &amp; Color</th>
                  <th className="py-2.5 px-3">Line</th>
                  <th className="py-2.5 px-3 text-right">Total Qty</th>
                  <th className="py-2.5 px-3 text-center">SMV</th>
                  <th className="py-2.5 px-3 text-center">Start Date &amp; Time</th>
                  <th className="py-2.5 px-3 text-center">End Date &amp; Time</th>
                  <th className="py-2.5 px-3 text-center">Ship Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>

                  {/* Daily Planned Quantity Columns */}
                  {reportDates.map((dStr) => (
                    <th key={dStr} className="py-2.5 px-2 text-right bg-slate-200/60 font-mono text-[10px] min-w-[55px]">
                      {dStr.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedBlocks.map((b) => (
                  <tr key={b.block_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 sticky left-0 bg-white font-mono font-bold text-slate-900 border-r border-slate-200">
                      <div>{b.sales_order_no}</div>
                      <div className="text-[10px] font-normal text-slate-500">{b.buyer_po}</div>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{b.customer_name}</td>
                    <td className="py-2 px-3">
                      <span className="font-semibold text-indigo-700 block">{b.style_no}</span>
                      <span className="text-[10px] text-slate-500">{b.color}</span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-800">
                      <div>{b.workcenter_id}</div>
                      {b.is_auto_split && (
                        <span className="text-[9px] bg-purple-100 text-purple-700 font-semibold px-1 py-0.2 rounded">
                          Split w/ {b.split_sibling_line}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums text-slate-900">
                      {b.planned_qty.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums text-slate-600">{b.smv}m</td>
                    <td className="py-2 px-3 text-center font-mono tabular-nums text-slate-800">
                      <div className="font-semibold">{b.start_date}</div>
                      <div className="text-[10px] font-bold text-indigo-600">{b.start_time || '08:00'}</div>
                    </td>
                    <td className="py-2 px-3 text-center font-mono tabular-nums text-slate-800">
                      <div className="font-semibold">{b.end_date}</div>
                      <div className="text-[10px] font-bold text-indigo-600">{b.end_time || '18:50'}</div>
                    </td>
                    <td className="py-2 px-3 text-center font-mono tabular-nums font-semibold text-slate-900">
                      {b.ship_date}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {b.status === 'material_delay' ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          RM Delay
                        </span>
                      ) : b.status === 'ship_date_risk' ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                          Ship Risk
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          On-Time
                        </span>
                      )}
                    </td>

                    {/* Daily Quantity breakdown */}
                    {reportDates.map((dStr) => {
                      const qty = b.daily_allocations?.[dStr];
                      return (
                        <td
                          key={dStr}
                          className={`py-2 px-2 text-right font-mono text-[11px] tabular-nums ${
                            qty ? 'font-semibold text-slate-900 bg-indigo-50/40' : 'text-slate-300'
                          }`}
                        >
                          {qty ? qty.toLocaleString() : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50">
              <span className="text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredBlocks.length)} of {filteredBlocks.length} planned blocks
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-semibold tabular-nums text-slate-700">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: Workcenter Line Summary */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">Line ID</th>
                  <th className="py-2.5 px-4">Workcenter Name</th>
                  <th className="py-2.5 px-4">Building / Floor</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Cadre (Ops)</th>
                  <th className="py-2.5 px-4 text-right">Daily SAH (Min)</th>
                  <th className="py-2.5 px-4 text-center">Total Orders</th>
                  <th className="py-2.5 px-4 text-right">Total Planned Pcs</th>
                  <th className="py-2.5 px-4 text-center">Production Horizon</th>
                  <th className="py-2.5 px-4 text-center">On-Time %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workcenterSummaries.map((s) => (
                  <tr key={s.workcenter_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.workcenter_id}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{s.floor}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{s.category}</td>
                    <td className="py-2.5 px-4 text-center font-bold tabular-nums text-slate-800">
                      {s.cadre} ops
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-700 tabular-nums">
                      {s.dailyMinutes.toLocaleString()} min
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold tabular-nums text-slate-900">
                      {s.orderCount}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold tabular-nums text-slate-900">
                      {s.totalPlannedQty.toLocaleString()} pcs
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-600">
                      {s.earliestStart} → {s.latestEnd}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                        s.onTimeRate >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.onTimeRate >= 75
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.onTimeRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formatted Excel Distribution Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Export Production Plan to Excel (.xlsx)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generates a multi-sheet formatted workbook for department circulation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              {/* Department Target */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Production Department Circulation Header
                </label>
                <select
                  value={exportDept}
                  onChange={(e) => setExportDept(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Stamps the circulation cover sheet and routing checklist for this department.
                </span>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Export Scope &amp; Filter
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportScope('filtered')}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      exportScope === 'filtered'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold block text-xs">Current Filtered View</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {filteredBlocks.length} planned orders ({filteredBlocks.reduce((s, b) => s + b.planned_qty, 0).toLocaleString()} pcs)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('all')}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      exportScope === 'all'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-bold block text-xs">All Factory Schedule</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      All 500 orders (2,500,000 pcs across 60 lines)
                    </span>
                  </button>
                </div>
              </div>

              {/* Sheets Checklist */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Workbook Sheets to Include
                </label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incMatrix}
                      onChange={(e) => setIncMatrix(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                    <span className="font-medium text-slate-800">
                      1. Production Schedule Matrix (Order details &amp; daily allocated output columns)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incSummary}
                      onChange={(e) => setIncSummary(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                    <span className="font-medium text-slate-800">
                      2. Workcenter Line Capacity Summary (60 lines cadre, SAH min, and on-time %)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incSignoff}
                      onChange={(e) => setIncSignoff(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                    <span className="font-medium text-slate-800">
                      3. Department Distribution &amp; Sign-off Table (Cutting, Sewing, QA, Stores routing)
                    </span>
                  </label>
                </div>
              </div>

              {/* Format features note */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] leading-relaxed">
                <strong>Formatted Excel Specifications:</strong> Custom column auto-fit widths, merged header titles, grand total calculation rows, lead time margins, and vendor RM in-house date checks.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteExcelExport}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Generate &amp; Download Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
