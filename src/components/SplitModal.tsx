import React, { useState } from 'react';
import { PlannedBlock, Workcenter } from '../types';
import { usePlanning } from '../context/PlanningContext';
import { Scissors, AlertCircle, X, ArrowRight } from 'lucide-react';

interface SplitModalProps {
  block: PlannedBlock | null;
  onClose: () => void;
}

export const SplitModal: React.FC<SplitModalProps> = ({ block, onClose }) => {
  const { workcenters, splitBlock } = usePlanning();

  if (!block) return null;

  // Split quantity defaults to 50%
  const defaultSplit = Math.floor(block.planned_qty / 2);
  const [splitQty, setSplitQty] = useState<number>(defaultSplit);
  const [targetLineId, setTargetLineId] = useState<string>(
    workcenters.find((w) => w.workcenter_id !== block.workcenter_id)?.workcenter_id || 'WC-02'
  );
  const [targetStartDate, setTargetStartDate] = useState<string>(block.start_date);

  const keepQty = block.planned_qty - splitQty;
  const targetWorkcenter = workcenters.find((w) => w.workcenter_id === targetLineId);

  const handleConfirm = () => {
    if (splitQty <= 0 || splitQty >= block.planned_qty) return;
    splitBlock(block.block_id, keepQty, splitQty, targetLineId, targetStartDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Split Planned Quantity Across Lines
              </h3>
              <p className="text-xs text-slate-500">
                Divide order volume to reduce bottleneck and accelerate delivery
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Order Details Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">{block.sales_order_no} · {block.buyer_po}</span>
              <span className="font-semibold text-slate-900">{block.customer_name}</span>
            </div>
            <div className="text-slate-500 flex items-center gap-3">
              <span>Style: <strong className="text-slate-700">{block.style_no}</strong> ({block.color})</span>
              <span>SMV: <strong className="text-slate-700">{block.smv} min</strong></span>
              <span>Current Total: <strong className="text-slate-900">{block.planned_qty.toLocaleString()} pcs</strong></span>
            </div>
          </div>

          {/* Allocation Sliders & Inputs */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Split Quantity to Move</span>
                <span className="tabular-nums font-semibold text-indigo-600">
                  {splitQty.toLocaleString()} pcs ({( (splitQty / block.planned_qty) * 100 ).toFixed(0)}%)
                </span>
              </div>
              <input
                type="range"
                min="100"
                max={block.planned_qty - 100}
                step="50"
                value={splitQty}
                onChange={(e) => setSplitQty(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="100"
                  max={block.planned_qty - 100}
                  step="50"
                  value={splitQty}
                  onChange={(e) => setSplitQty(Math.max(100, Math.min(block.planned_qty - 100, Number(e.target.value))))}
                  className="w-32 border border-slate-300 rounded px-2.5 py-1 text-xs tabular-nums text-slate-800"
                />
                <span className="text-xs text-slate-500">pieces to allocate to second line</span>
              </div>
            </div>

            {/* Split Comparison Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Line 1 (Keep on {block.workcenter_id})
                </span>
                <p className="text-base font-bold text-slate-900 tabular-nums">
                  {keepQty.toLocaleString()} <span className="text-xs font-normal text-slate-500">pcs</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Starts: {block.start_date}
                </p>
              </div>

              <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50/50">
                <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block mb-1">
                  Line 2 (Move to New Line)
                </span>
                <p className="text-base font-bold text-indigo-900 tabular-nums">
                  {splitQty.toLocaleString()} <span className="text-xs font-normal text-indigo-600">pcs</span>
                </p>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Allocates new block ID
                </p>
              </div>
            </div>

            {/* Target Workcenter & Start Date */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Workcenter Line
                </label>
                <select
                  value={targetLineId}
                  onChange={(e) => setTargetLineId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {workcenters.map((w) => (
                    <option key={w.workcenter_id} value={w.workcenter_id} disabled={w.workcenter_id === block.workcenter_id}>
                      {w.workcenter_id} - {w.name} ({w.current_category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Start Date
                </label>
                <input
                  type="date"
                  value={targetStartDate}
                  onChange={(e) => setTargetStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {targetWorkcenter && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Target Line Cadre: <strong>{targetWorkcenter.standard_cadre} operators</strong> · 
                  Efficiency: <strong>80%</strong> · Duration will be automatically calculated using SAH formula.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Confirm Split & Synchronize</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
