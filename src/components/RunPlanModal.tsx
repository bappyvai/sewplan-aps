import React, { useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { Play, Sparkles, X, CheckCircle2, ArrowRight, Layers, RefreshCw, PlusCircle } from 'lucide-react';

interface RunPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RunPlanModal: React.FC<RunPlanModalProps> = ({ isOpen, onClose }) => {
  const {
    runAutoPlan,
    runAIPlan,
    workcenters,
    isSimulating,
    openOrdersCount,
    openOrdersTotalVolume,
    alreadyProducedTotal,
    netBalanceTotalToPlan,
    tempPlannedOrders,
    unplannedOrdersCount,
    clearTempPlannedOrders
  } = usePlanning();

  const [algorithmMode, setAlgorithmMode] = useState<'ai' | 'standard'>('ai');
  const [scopeMode, setScopeMode] = useState<'all' | 'new'>(
    unplannedOrdersCount > 0 ? 'new' : 'all'
  );

  if (!isOpen) return null;

  const handleExecute = () => {
    if (algorithmMode === 'ai') {
      runAIPlan({ onlyNewOrders: scopeMode === 'new' });
    } else {
      runAutoPlan({ onlyNewOrders: scopeMode === 'new' });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Run Production Planning Simulation
              </h3>
              <p className="text-xs text-slate-500">
                Allocate open sales orders and remaining balances across sewing lines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Orders & Volume Calculation Display */}
        <div className="p-6 space-y-4">
          {/* Algorithm Engine Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Planning Engine &amp; Algorithm Logic
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAlgorithmMode('ai')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  algorithmMode === 'ai'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    AI Plan (Empirical)
                  </span>
                  <span className="text-[9px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded uppercase">
                    New AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Learns from closed orders &amp; peak efficiency. Start: Ship-32d, End: Ship-5d. Priority/Availability bypassed.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAlgorithmMode('standard')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  algorithmMode === 'standard'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    Standard APS
                  </span>
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded uppercase">
                    Priority
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Evaluates Workcenter Priority ranks &amp; Workcenter Availability master tables.
                </p>
              </button>
            </div>
          </div>

          {/* Scope Mode Selector (Requirement 4) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Planning Scope &amp; Temp Order Table Matching
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setScopeMode('new')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  scopeMode === 'new'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                    New Orders Only
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                    {unplannedOrdersCount} New
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Only consider sales orders not yet in the temp planning table.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScopeMode('all')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  scopeMode === 'all'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    Full Re-Plan All
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {openOrdersCount} Total
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Re-evaluate all eligible open orders from scratch across all lines.
                </p>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 border-b border-slate-200/80 pb-2">
              <span>Dynamic Volume &amp; Deduction Breakdown</span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                {scopeMode === 'new' ? `${unplannedOrdersCount} New Orders` : `${openOrdersCount} Open Orders`}
              </span>
            </div>

            {/* Dynamic Metric Rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Order Volume (Open Orders):</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {openOrdersTotalVolume.toLocaleString()} pcs
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Already Produced Output:</span>
                <span className="font-semibold text-emerald-700 tabular-nums">
                  - {alreadyProducedTotal.toLocaleString()} pcs
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-200">
                <span className="font-bold text-slate-900">
                  Net Balance Quantity to Plan:
                </span>
                <span className="text-base font-extrabold text-indigo-600 tabular-nums">
                  {netBalanceTotalToPlan.toLocaleString()} pcs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-md cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={isSimulating}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {algorithmMode === 'ai'
                ? (scopeMode === 'new'
                    ? `Execute AI Plan (${unplannedOrdersCount} New)`
                    : `Execute AI Plan (${netBalanceTotalToPlan.toLocaleString()} pcs)`)
                : (scopeMode === 'new'
                    ? `Plan ${unplannedOrdersCount} New Orders`
                    : `Generate Full Plan (${netBalanceTotalToPlan.toLocaleString()} pcs)`)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
