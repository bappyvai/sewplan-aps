import React, { useState, useEffect } from 'react';
import { PlannedBlock } from '../types';
import { usePlanning } from '../context/PlanningContext';
import { MoveRight, X, Calendar, AlertTriangle, CheckCircle, Package, Clock, Zap } from 'lucide-react';

interface RescheduleModalProps {
  block: PlannedBlock | null;
  initialTargetLine?: string;
  initialStartDate?: string;
  initialStartTime?: string;
  title?: string;
  isReadOnly?: boolean;
  onClose: () => void;
  onOpenSplit: (block: PlannedBlock) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  block,
  initialTargetLine,
  initialStartDate,
  initialStartTime,
  title,
  isReadOnly = false,
  onClose,
  onOpenSplit
}) => {
  const { workcenters, moveBlock } = usePlanning();

  const [targetLineId, setTargetLineId] = useState<string>(block?.workcenter_id || 'WC-01');
  const [newStartDate, setNewStartDate] = useState<string>(block?.start_date || '2027-01-02');
  const [newStartTime, setNewStartTime] = useState<string>(block?.start_time || '08:00');

  useEffect(() => {
    if (block) {
      setTargetLineId(initialTargetLine || block.workcenter_id);
      setNewStartDate(initialStartDate || block.start_date);
      setNewStartTime(initialStartTime || block.start_time || '08:00');
    }
  }, [block, initialTargetLine, initialStartDate, initialStartTime]);

  if (!block) return null;

  const handleSave = () => {
    moveBlock(block.block_id, targetLineId, newStartDate, newStartTime);
    onClose();
  };

  // Requirement 7: Produce minutes = Order Qty * SMV
  const produceMinutes = Math.round(block.planned_qty * block.smv);

  const leadMarginDays = block.ship_date && block.end_date
    ? Math.round((new Date(block.ship_date).getTime() - new Date(block.end_date).getTime()) / 86400000)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {title || 'Reschedule Order Block & Start Timing'}
              </h3>
              <p className="text-xs text-slate-500">
                {block.sales_order_no} · {block.customer_name} ({block.buyer_po})
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Indicator */}
          <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
            block.status === 'material_delay'
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : block.status === 'ship_date_risk'
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}>
            {block.status === 'material_delay' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : block.status === 'ship_date_risk' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block">
                {block.status === 'material_delay'
                  ? 'Raw Material Delay Alert'
                  : block.status === 'ship_date_risk'
                  ? 'Ship Date Deadline Risk'
                  : 'On-Time Schedule Alignment'}
              </span>
              <span className="text-[11px] opacity-90">{block.status_reason}</span>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Block Number &amp; Color</span>
              <span className="font-mono font-bold text-indigo-700 text-xs block">{block.block_id}</span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                {block.color} {block.color_index ? `(Color ${block.color_index} of ${block.total_colors || 1})` : ''}
              </span>
              {block.parent_block_id && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 mt-1 inline-block">
                  Split from: {block.parent_block_id}
                </span>
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Style &amp; Description</span>
              <span className="font-semibold text-slate-800">{block.style_no}</span>
              <span className="text-[11px] text-slate-500 block truncate">{block.style_desc}</span>
            </div>

            <div className="p-2.5 bg-indigo-50/60 border border-indigo-200/60 rounded-md col-span-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-indigo-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Order Placed Duration Formula:
                </span>
                <span className="font-mono font-bold text-indigo-700">
                  {block.planned_qty.toLocaleString()} Block Qty × {block.smv} SMV = {(block.planned_qty * block.smv).toLocaleString()} Standard Minutes
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Current Schedule</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {block.start_date} {block.start_time || '08:00'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                to {block.end_date} {block.end_time || '18:50'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Buyer Ship Date</span>
              <span className="font-bold text-slate-900 tabular-nums">{block.ship_date}</span>
              <span className="text-[10px] text-slate-500 block">RM Date: {block.rm_inhouse_date || 'N/A'}</span>
            </div>
          </div>

          {/* Re-allocate Form (Planner Only) OR Read-Only Schedule Card (End User) */}
          {isReadOnly ? (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                  <span className="font-semibold text-slate-700">Assigned Workcenter:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {block.workcenter_id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Planned Start Date &amp; Time:</span>
                  <span className="font-semibold text-indigo-700 font-mono">
                    {block.start_date} at {block.start_time || '08:00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Planned Completion Date &amp; Time:</span>
                  <span className="font-semibold text-indigo-700 font-mono">
                    {block.end_date} at {block.end_time || '18:50'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Lead Margin to Ship Date:</span>
                  <span className={`font-semibold ${
                    leadMarginDays < 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {leadMarginDays} days {leadMarginDays < 0 ? '(Ship Date Overrun)' : '(Buffer)'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic bg-slate-100/70 p-2 rounded text-center">
                Viewing mode active: schedule modifications are disabled for end-user safety.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Workcenter Line
                </label>
                <select
                  value={targetLineId}
                  onChange={(e) => setTargetLineId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {workcenters.map((w) => (
                    <option key={w.workcenter_id} value={w.workcenter_id}>
                      {w.workcenter_id} - {w.name} ({w.current_category} · Cadre: {w.standard_cadre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Start Date *</span>
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Start Time (HH:MM) *</span>
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick Shift Time Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Quick Times:</span>
                <button
                  type="button"
                  onClick={() => setNewStartTime('08:00')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    newStartTime === '08:00'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  08:00 (Shift Start)
                </button>
                <button
                  type="button"
                  onClick={() => setNewStartTime('10:30')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    newStartTime === '10:30'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  10:30 (Mid-Morning)
                </button>
                <button
                  type="button"
                  onClick={() => setNewStartTime('13:30')}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    newStartTime === '13:30'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  13:30 (Post Lunch)
                </button>
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200/60 leading-relaxed">
                Applying will position this order on <strong>{targetLineId}</strong> starting at <strong>{newStartDate} {newStartTime}</strong>. Subsequent orders on this line automatically cascade without gaps or overlaps.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {isReadOnly ? (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">End-User Inspection View</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  onClose();
                  onOpenSplit(block);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Split Quantity Across Lines...
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                  Apply &amp; Reschedule
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
