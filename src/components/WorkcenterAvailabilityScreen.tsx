import React, { useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { WorkcenterAvailability, ProductCategory } from '../types';
import { PRODUCT_CATEGORIES } from '../utils/seeder';
import { Clock, Plus, Trash2, Calendar, Split, Check, Info } from 'lucide-react';

export const WorkcenterAvailabilityScreen: React.FC = () => {
  const { availabilities, workcenters, addAvailability, deleteAvailability } = usePlanning();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [workcenterId, setWorkcenterId] = useState('WC-01');
  const [category, setCategory] = useState<ProductCategory>('Denim Pant');
  const [startDate, setStartDate] = useState('2027-02-01');
  const [endDate, setEndDate] = useState('');
  const [efficiencyPct, setEfficiencyPct] = useState<number>(80);

  // Splitting state
  const [isSplitting, setIsSplitting] = useState(false);
  const [allocatedCadre, setAllocatedCadre] = useState<number>(25);

  const selectedWc = workcenters.find((w) => w.workcenter_id === workcenterId);
  const standardCadre = selectedWc ? selectedWc.standard_cadre : 43;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAvailability({
      workcenter_id: workcenterId,
      product_category: category,
      start_date: startDate,
      end_date: endDate ? endDate : undefined,
      efficiency_pct: Number(efficiencyPct),
      is_splitting_active: isSplitting,
      allocated_cadre: isSplitting ? Number(allocatedCadre) : standardCadre
    });
    setIsFormOpen(false);
    setEndDate('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Workcenter Availability &amp; Multi-Category Splitting
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure line allocation date bands and concurrent cadre division across multiple garment categories.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isFormOpen ? 'Close Form' : 'Map Availability Band'}
        </button>
      </div>

      {/* Rules Notice */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
            <Split className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1 text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900 block">
              Time Period Mapping &amp; Workcenter Splitting Logic:
            </span>
            <p>
              <strong>1. Open-Ended Start Dates:</strong> End date is optional. If Category A is mapped from Jan 1 and a new entry for Category B is added starting Feb 1, Category A&apos;s end date automatically bounds to Jan 31.
            </p>
            <p>
              <strong>2. Concurrent Multi-Category Splitting:</strong> When a workcenter runs multiple categories at the same time, standard cadre (43 operators) is divided proportionally (e.g. 25 ops for Denim, 18 ops for Shorts), scaling SAH daily capacity accordingly.
            </p>
          </div>
        </div>
      </div>

      {/* Form Drawer */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-indigo-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Add Workcenter Availability Mapping
            </span>
            <span className="text-[11px] text-slate-500">
              End Date is optional (will auto-chain on subsequent mappings)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workcenter Line *
              </label>
              <select
                value={workcenterId}
                onChange={(e) => setWorkcenterId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800"
              >
                {workcenters.map((w) => (
                  <option key={w.workcenter_id} value={w.workcenter_id}>
                    {w.workcenter_id} - {w.name} (Cadre: {w.standard_cadre})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800"
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Band Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Band End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Splitting Section */}
          <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="splitCheckbox"
                checked={isSplitting}
                onChange={(e) => setIsSplitting(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="splitCheckbox" className="text-xs font-semibold text-purple-950 cursor-pointer">
                Enable Multi-Category Workcenter Splitting (Run concurrently on this line)
              </label>
            </div>

            {isSplitting && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                <div>
                  <label className="block font-medium text-purple-900 mb-1">
                    Allocated Operators / Cadre for this Category:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max={standardCadre}
                      value={allocatedCadre}
                      onChange={(e) => setAllocatedCadre(Number(e.target.value))}
                      className="border border-purple-300 rounded px-2.5 py-1 text-xs w-24 bg-white text-slate-900"
                    />
                    <span className="text-purple-700">
                      of {standardCadre} standard operators ({standardCadre - allocatedCadre} available for second category)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-purple-900 mb-1">
                    Planned Efficiency %:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="40"
                      max="100"
                      value={efficiencyPct}
                      onChange={(e) => setEfficiencyPct(Number(e.target.value))}
                      className="border border-purple-300 rounded px-2.5 py-1 text-xs w-24 bg-white text-slate-900"
                    />
                    <span className="text-purple-700">%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Save Availability Band
            </button>
          </div>
        </form>
      )}

      {/* Availability List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Workcenter Availability Schedule ({availabilities.length} Mappings)
          </span>
          <span className="text-[11px] text-slate-500">
            Real-time daily minutes computed using Shift hours &amp; Cadre
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Band ID</th>
                <th className="py-2.5 px-4">Workcenter</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Start Date</th>
                <th className="py-2.5 px-4">End Date</th>
                <th className="py-2.5 px-4 text-center">Cadre (Operators)</th>
                <th className="py-2.5 px-4 text-center">Efficiency</th>
                <th className="py-2.5 px-4 text-center">Splitting Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {availabilities.slice(0, 100).map((a) => {
                const wc = workcenters.find((w) => w.workcenter_id === a.workcenter_id);
                const operators = a.allocated_cadre || (wc ? wc.standard_cadre : 43);

                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{a.id}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {a.workcenter_id} <span className="text-slate-400 font-normal">({wc?.name})</span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{a.product_category}</td>
                    <td className="py-2.5 px-4 font-mono tabular-nums">{a.start_date}</td>
                    <td className="py-2.5 px-4 font-mono tabular-nums">
                      {a.end_date ? a.end_date : <span className="text-slate-400 italic">Open-ended</span>}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold tabular-nums text-slate-900">
                      {operators} <span className="text-[10px] font-normal text-slate-500">ops</span>
                    </td>
                    <td className="py-2.5 px-4 text-center tabular-nums font-semibold text-slate-800">
                      {a.efficiency_pct}%
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {a.is_splitting_active ? (
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Split Cadre
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Full Standard</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => deleteAvailability(a.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete Band"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
