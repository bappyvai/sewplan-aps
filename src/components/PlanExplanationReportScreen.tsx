import React, { useState, useMemo } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { exportPlanExplanationToExcel } from '../utils/excelExporter';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  ArrowUpDown,
  Building,
  UserCheck,
  Split,
  Tag
} from 'lucide-react';

interface PlanExplanationReportScreenProps {
  isReadOnly?: boolean;
}

export const PlanExplanationReportScreen: React.FC<PlanExplanationReportScreenProps> = () => {
  const { activePlan, tempPlan, planMode, workcenters } = usePlanning();
  const currentPlan = (planMode === 'temp' && tempPlan) ? tempPlan : activePlan;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonTypeFilter, setReasonTypeFilter] = useState<'ALL' | 'STANDARD' | 'MANUAL' | 'AI' | 'SPLIT'>('ALL');
  const [lineFilter, setLineFilter] = useState('ALL');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Helper to determine reason category
  const getReasonCategory = (b: any): 'MANUAL' | 'AI' | 'SPLIT' | 'STANDARD' => {
    if (b.is_manually_updated || b.plan_reason === 'Manual update') {
      return 'MANUAL';
    }
    if (b.is_ai_planned || (b.plan_reason && b.plan_reason.includes('Planned AI based based on Historical data'))) {
      return 'AI';
    }
    if (b.is_auto_split || (b.plan_reason && b.plan_reason.toLowerCase().includes('auto-split'))) {
      return 'SPLIT';
    }
    return 'STANDARD';
  };

  // Helper to get formatted reason text
  const getBlockReasonText = (b: any): string => {
    if (b.plan_reason) return b.plan_reason;
    if (b.is_manually_updated) return 'Manual update';
    if (b.is_ai_planned) return 'Planned AI based based on Historical data';
    if (b.is_auto_split) return `Rule 2 & 6: Auto-split with Line ${b.split_sibling_line || 'WC-02'} to finish within Ship Date (${b.ship_date}).`;
    return `Rule 1-3: Line ${b.workcenter_id} prioritized for ${b.product_category} / ${b.customer_name}. Start date ${b.start_date} ${b.start_time || '08:00'} aligned with PSD (${b.rm_inhouse_date ? `In-House + 3d relaxation` : `Ship - 35 + 3d`}). Duration: ${b.planned_qty} pcs × ${b.smv} SMV.`;
  };

  // Unique customers for filter
  const customersList = useMemo(() => {
    const set = new Set<string>();
    currentPlan.forEach((b) => {
      if (b.customer_name) set.add(b.customer_name);
    });
    return Array.from(set).sort();
  }, [currentPlan]);

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    return currentPlan.filter((b) => {
      const cat = getReasonCategory(b);
      const reasonText = getBlockReasonText(b);

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          b.sales_order_no.toLowerCase().includes(q) ||
          b.customer_name.toLowerCase().includes(q) ||
          b.style_no.toLowerCase().includes(q) ||
          b.color.toLowerCase().includes(q) ||
          b.workcenter_id.toLowerCase().includes(q) ||
          (b.buyer_po && b.buyer_po.toLowerCase().includes(q)) ||
          reasonText.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Reason type filter
      if (reasonTypeFilter !== 'ALL' && cat !== reasonTypeFilter) {
        return false;
      }

      // Line filter
      if (lineFilter !== 'ALL' && b.workcenter_id !== lineFilter) {
        return false;
      }

      // Customer filter
      if (customerFilter !== 'ALL' && b.customer_name !== customerFilter) {
        return false;
      }

      return true;
    });
  }, [currentPlan, searchQuery, reasonTypeFilter, lineFilter, customerFilter]);

  // KPI calculations
  const stats = useMemo(() => {
    let manualCount = 0;
    let aiCount = 0;
    let splitCount = 0;
    let standardCount = 0;
    let totalPcs = 0;

    currentPlan.forEach((b) => {
      totalPcs += b.planned_qty;
      const cat = getReasonCategory(b);
      if (cat === 'MANUAL') manualCount++;
      else if (cat === 'AI') aiCount++;
      else if (cat === 'SPLIT') splitCount++;
      else standardCount++;
    });

    return {
      totalBlocks: currentPlan.length,
      totalPcs,
      manualCount,
      aiCount,
      splitCount,
      standardCount
    };
  }, [currentPlan]);

  const selectedBlock = currentPlan.find((b) => b.block_id === selectedBlockId);

  const handleExportExcel = () => {
    exportPlanExplanationToExcel(filteredBlocks, workcenters);
  };

  const handleExportCSV = () => {
    const headers = [
      'Line No',
      'Sales Order',
      'Buyer PO',
      'Customer',
      'Style No',
      'Style Description',
      'Color',
      'SMV',
      'Qty',
      'Plan Start Date',
      'Plan End Date',
      'Reason of Plan'
    ];

    const csvRows = [headers.join(',')];

    filteredBlocks.forEach((b) => {
      const reason = `"${getBlockReasonText(b).replace(/"/g, '""')}"`;
      const row = [
        b.workcenter_id,
        b.sales_order_no,
        `"${b.buyer_po || ''}"`,
        `"${b.customer_name}"`,
        `"${b.style_no}"`,
        `"${b.style_desc || ''}"`,
        `"${b.color}"`,
        b.smv,
        b.planned_qty,
        `"${b.start_date} ${b.start_time || '08:00'}"`,
        `"${b.end_date} ${b.end_time || '18:50'}"`,
        reason
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SewPlan_Plan_Explanation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1">
              Audit & Decision Traceability
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Plan Explanation Report
            </h1>
            <p className="text-xs text-slate-500">
              Complete transparency into why each production order was assigned to its sewing line and scheduled at its specific start time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Total Blocks</span>
          <div className="text-xl font-extrabold text-slate-900">{stats.totalBlocks.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 font-sans">{stats.totalPcs.toLocaleString()} total pieces</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase font-mono">Standard Engine</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-950">{stats.standardCount}</div>
          <span className="text-[11px] text-emerald-700">Priority & PSD Rules</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase font-mono">Manual Update</span>
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-950">{stats.manualCount}</div>
          <span className="text-[11px] text-amber-700">Planner Overrides</span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 uppercase font-mono">AI Historical</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-950">{stats.aiCount}</div>
          <span className="text-[11px] text-indigo-700">Empirical Output Model</span>
        </div>

        <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-800 uppercase font-mono">Auto-Split</span>
            <Split className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-xl font-extrabold text-sky-950">{stats.splitCount}</div>
          <span className="text-[11px] text-sky-700">Ship Date Protection</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Sales Order, Customer, Style, Color, Line or Reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Reason Type Filter */}
          <select
            value={reasonTypeFilter}
            onChange={(e) => setReasonTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white cursor-pointer focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Reason Types</option>
            <option value="STANDARD">Standard Engine Logics</option>
            <option value="MANUAL">Manual Update (Drag & Drop / Force)</option>
            <option value="AI">Planned AI based based on Historical data</option>
            <option value="SPLIT">Auto-Split Logic</option>
          </select>

          {/* Line Filter */}
          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white cursor-pointer focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Sewing Lines</option>
            {workcenters.map((w) => (
              <option key={w.workcenter_id} value={w.workcenter_id}>
                {w.name} ({w.workcenter_id})
              </option>
            ))}
          </select>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white cursor-pointer focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Customers</option>
            {customersList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing <span className="text-slate-900 font-bold">{filteredBlocks.length}</span> of {currentPlan.length} records
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Line No</th>
                <th className="py-3 px-3">Sales Order</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Style</th>
                <th className="py-3 px-3">Color</th>
                <th className="py-3 px-2.5 text-right">SMV</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3">Plan Start Date</th>
                <th className="py-3 px-3">Plan End Date</th>
                <th className="py-3 px-4 min-w-[320px]">Reason of Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBlocks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold">No planned records match the selected filters.</p>
                  </td>
                </tr>
              ) : (
                filteredBlocks.map((b) => {
                  const cat = getReasonCategory(b);
                  const reasonText = getBlockReasonText(b);
                  const isSelected = selectedBlockId === b.block_id;

                  return (
                    <tr
                      key={b.block_id}
                      onClick={() => setSelectedBlockId(isSelected ? null : b.block_id)}
                      className={`hover:bg-slate-50/80 transition-all cursor-pointer ${
                        isSelected ? 'bg-indigo-50/50 ring-1 ring-indigo-200' : ''
                      }`}
                    >
                      {/* 1. Line No */}
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span>{b.workcenter_id}</span>
                        </div>
                      </td>

                      {/* 2. Sales Order */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono text-[11px]">{b.sales_order_no}</div>
                        {b.buyer_po && <div className="text-[10px] text-slate-400 font-mono">{b.buyer_po}</div>}
                      </td>

                      {/* 3. Customer */}
                      <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {b.customer_name}
                      </td>

                      {/* 4. Style */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800 font-mono text-[11px]">{b.style_no}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{b.style_desc}</div>
                      </td>

                      {/* 5. Color */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700">
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          {b.color} {b.color_index ? `(C${b.color_index})` : ''}
                        </span>
                      </td>

                      {/* 6. SMV */}
                      <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-700">
                        {b.smv.toFixed(1)}
                      </td>

                      {/* 7. Qty */}
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">
                        {b.planned_qty.toLocaleString()}
                      </td>

                      {/* 8. Plan Start Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        <span className="font-bold text-slate-800">{b.start_date}</span>{' '}
                        <span className="text-slate-400">{b.start_time || '08:00'}</span>
                      </td>

                      {/* 9. Plan End Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        <span className="font-bold text-slate-800">{b.end_date}</span>{' '}
                        <span className="text-slate-400">{b.end_time || '18:50'}</span>
                      </td>

                      {/* 10. Reason of Plan */}
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col gap-1">
                          <div>
                            {cat === 'MANUAL' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                <Sliders className="w-3 h-3 text-amber-600" />
                                Manual update
                              </span>
                            )}
                            {cat === 'AI' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                Planned AI based based on Historical data
                              </span>
                            )}
                            {cat === 'SPLIT' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                                <Split className="w-3 h-3 text-sky-600" />
                                Auto-split to meet Ship Date
                              </span>
                            )}
                            {cat === 'STANDARD' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Standard Engine Priority & PSD
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                            {reasonText}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Block Inspection Card Modal */}
      {selectedBlock && (
        <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Decision Audit Breakdown: {selectedBlock.block_id}
              </h3>
            </div>
            <button
              onClick={() => setSelectedBlockId(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase">Sales Order</span>
              <div className="font-bold text-slate-900">{selectedBlock.sales_order_no}</div>
              <div className="text-[11px] text-slate-500 font-sans">{selectedBlock.customer_name}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase">Sewing Line</span>
              <div className="font-bold text-indigo-700">{selectedBlock.workcenter_id}</div>
              <div className="text-[11px] text-slate-500 font-sans">{selectedBlock.product_category}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase">Schedule Window</span>
              <div className="font-bold text-slate-800">{selectedBlock.start_date} ➔ {selectedBlock.end_date}</div>
              <div className="text-[11px] text-slate-500 font-sans">{selectedBlock.working_days_needed} working days</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase">Block Quantity & SMV</span>
              <div className="font-bold text-slate-900">{selectedBlock.planned_qty.toLocaleString()} pcs</div>
              <div className="text-[11px] text-slate-500 font-sans">SMV: {selectedBlock.smv.toFixed(1)} mins</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-1.5">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Full Algorithmic Explanation & Floor Allocation Rationale:</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs font-sans">
              {getBlockReasonText(selectedBlock)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
