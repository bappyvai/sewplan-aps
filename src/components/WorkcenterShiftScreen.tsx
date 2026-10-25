import React, { useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { WorkcenterShift } from '../types';
import { Clock, Calculator, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const WorkcenterShiftScreen: React.FC = () => {
  const { shifts, workcenters, updateShift } = usePlanning();

  const [selectedWcId, setSelectedWcId] = useState<string>('WC-01');
  const [cadre, setCadre] = useState<number>(43);
  const [workingHours, setWorkingHours] = useState<number>(9.83);
  const [breakMinutes, setBreakMinutes] = useState<number>(60);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('18:50');
  const [fromDate, setFromDate] = useState<string>('2027-01-01');
  const [toDate, setToDate] = useState<string>('2027-12-31');

  // Interactive Live SAH Simulator inputs
  const [simOperators, setSimOperators] = useState<number>(43);
  const [simHours, setSimHours] = useState<number>(9.83);
  const [simEfficiency, setSimEfficiency] = useState<number>(80);
  const [simSmv, setSimSmv] = useState<number>(18.5); // Denim SMV

  const simDailyMinutes = Math.round(simOperators * simHours * 60 * (simEfficiency / 100));
  const simDailyPieces = simSmv > 0 ? Math.floor(simDailyMinutes / simSmv) : 0;

  const handleApplySingle = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = shifts.find((s) => s.workcenter_id === selectedWcId);
    if (!existing) return;

    updateShift({
      ...existing,
      from_date: fromDate,
      to_date: toDate,
      working_hours: Number(workingHours),
      break_time_minutes: Number(breakMinutes),
      shift_start_time: startTime,
      shift_end_time: endTime,
      cadre: Number(cadre)
    });
  };

  const handleBulkApply = () => {
    shifts.forEach((s) => {
      updateShift({
        ...s,
        from_date: fromDate,
        to_date: toDate,
        working_hours: Number(workingHours),
        break_time_minutes: Number(breakMinutes),
        shift_start_time: startTime,
        shift_end_time: endTime,
        cadre: Number(cadre)
      });
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Workcenter Shift Master &amp; SAH Capacity Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage daily working schedules, break durations, and line capacity parameters.
        </p>
      </div>

      {/* Live SAH Formula & Simulator Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Garment SAH Capacity Formula (Advanced Planning Specification)
              </h2>
              <p className="text-xs text-slate-400">
                Band Available Minutes Day Wise = Operators × Working Hours × 60 × Efficiency%
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded">
            Live Math Verification
          </span>
        </div>

        {/* Interactive Math Sandbox */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              1. Operators (Cadre)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="80"
                value={simOperators}
                onChange={(e) => setSimOperators(Number(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-bold text-white tabular-nums"
              />
              <span className="text-xs text-slate-400">sewing ops</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              2. Working Hours (Shift)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="6"
                max="16"
                value={simHours}
                onChange={(e) => setSimHours(Number(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-bold text-white tabular-nums"
              />
              <span className="text-xs text-slate-400">hrs/day</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              3. Efficiency %
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="40"
                max="100"
                value={simEfficiency}
                onChange={(e) => setSimEfficiency(Number(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-bold text-white tabular-nums"
              />
              <span className="text-xs text-slate-400">% target</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/80 rounded-lg border border-indigo-700 space-y-1">
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
              Daily Available Capacity
            </span>
            <div className="text-xl font-bold text-indigo-200 tabular-nums">
              {simDailyMinutes.toLocaleString()} <span className="text-xs font-normal text-indigo-400">min/day</span>
            </div>
            <p className="text-[10px] text-indigo-300">
              Output @ SMV {simSmv}m: <strong>{simDailyPieces.toLocaleString()} pcs/day</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Edit Shift Form */}
      <form onSubmit={handleApplySingle} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Shift Schedule &amp; Timings Configuration
          </span>
          <button
            type="button"
            onClick={handleBulkApply}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Apply Timings to All 60 Workcenters →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Workcenter
            </label>
            <select
              value={selectedWcId}
              onChange={(e) => {
                setSelectedWcId(e.target.value);
                const s = shifts.find((sh) => sh.workcenter_id === e.target.value);
                if (s) {
                  setWorkingHours(s.working_hours);
                  setBreakMinutes(s.break_time_minutes);
                  setStartTime(s.shift_start_time);
                  setEndTime(s.shift_end_time);
                  setCadre(s.cadre ?? 43);
                }
              }}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800"
            >
              {workcenters.map((w) => (
                <option key={w.workcenter_id} value={w.workcenter_id}>
                  {w.workcenter_id} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Line Carder (Operators) *
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={cadre}
              onChange={(e) => setCadre(Number(e.target.value))}
              required
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Working Hours / Day *
            </label>
            <input
              type="number"
              step="0.01"
              value={workingHours}
              onChange={(e) => setWorkingHours(Number(e.target.value))}
              required
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Break Time (Minutes)
            </label>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shift Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shift End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Update Line Shift
            </button>
          </div>
        </div>
      </form>

      {/* Shifts Summary Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Shift Master Schedule (60 Workcenters)
          </span>
          <span className="text-[11px] text-slate-500">
            Standard: 08:00 - 18:50 (9.83 Working Hours)
          </span>
        </div>

        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200">
              <tr className="text-slate-700 font-semibold">
                <th className="py-2.5 px-4">Shift ID</th>
                <th className="py-2.5 px-4">Workcenter ID</th>
                <th className="py-2.5 px-4 text-center">Carder (Operators)</th>
                <th className="py-2.5 px-4">Effective Period</th>
                <th className="py-2.5 px-4 text-center">Shift Start</th>
                <th className="py-2.5 px-4 text-center">Shift End</th>
                <th className="py-2.5 px-4 text-center">Break Time</th>
                <th className="py-2.5 px-4 text-center">Net Working Hours</th>
                <th className="py-2.5 px-4 text-right">Daily SAH Minutes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {shifts.map((s) => {
                const wc = workcenters.find((w) => w.workcenter_id === s.workcenter_id);
                const shiftCadre = s.cadre ?? (wc ? wc.standard_cadre : 43);
                const dailyMinutes = Math.round(shiftCadre * s.working_hours * 60 * 0.80);

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{s.id}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s.workcenter_id}</td>
                    <td className="py-2.5 px-4 text-center font-bold font-mono text-indigo-700 tabular-nums">
                      {shiftCadre}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                      {s.from_date} to {s.to_date}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono tabular-nums">{s.shift_start_time}</td>
                    <td className="py-2.5 px-4 text-center font-mono tabular-nums">{s.shift_end_time}</td>
                    <td className="py-2.5 px-4 text-center tabular-nums text-slate-600">
                      {s.break_time_minutes} min
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold tabular-nums text-slate-900">
                      {s.working_hours} hrs
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-700 tabular-nums">
                      {dailyMinutes.toLocaleString()} min
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
