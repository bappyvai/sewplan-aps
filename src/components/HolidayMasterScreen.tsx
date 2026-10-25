import React, { useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { CalendarDays, Plus, Trash2, Check, ShieldAlert, Sparkles } from 'lucide-react';

const WEEKDAYS = [
  { index: 0, name: 'Sunday', short: 'Sun' },
  { index: 1, name: 'Monday', short: 'Mon' },
  { index: 2, name: 'Tuesday', short: 'Tue' },
  { index: 3, name: 'Wednesday', short: 'Wed' },
  { index: 4, name: 'Thursday', short: 'Thu' },
  { index: 5, name: 'Friday', short: 'Fri' },
  { index: 6, name: 'Saturday', short: 'Sat' }
];

export const HolidayMasterScreen: React.FC = () => {
  const { holidayMaster, toggleWeeklyOff, addHoliday, deleteHoliday } = usePlanning();

  const [name, setName] = useState('');
  const [date, setDate] = useState('2027-02-14');
  const [type, setType] = useState<'National' | 'Festival' | 'Company'>('Festival');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    addHoliday(name.trim(), date, type);
    setName('');
    setIsFormOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Holiday &amp; Weekly Off Master
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure non-working days. Production schedules automatically omit these dates when calculating lead times.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isFormOpen ? 'Close Form' : 'Add Holiday Entry'}
        </button>
      </div>

      {/* Weekly Off Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Weekly Off Working Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Select factory rest days (typically Friday in Bangladesh/MENA or Sunday in Western hubs).
            </p>
          </div>
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded font-semibold">
            {holidayMaster.weekly_offs.length} Day(s) Weekly Off Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
          {WEEKDAYS.map((w) => {
            const isOff = holidayMaster.weekly_offs.includes(w.index);
            return (
              <button
                key={w.index}
                type="button"
                onClick={() => toggleWeeklyOff(w.index)}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  isOff
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="block text-xs uppercase tracking-wider">{w.short}</span>
                <span className="block text-sm mt-0.5">{w.name}</span>
                <span className={`block text-[10px] mt-1 ${isOff ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {isOff ? 'Weekly Off (No Prod)' : 'Working Day'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Holiday Form */}
      {isFormOpen && (
        <form onSubmit={handleAdd} className="bg-white border border-indigo-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Create New National / Festival Holiday Entry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Holiday Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Eid-ul-Adha, Spring Festival"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Holiday Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Holiday Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800"
              >
                <option value="National">National Holiday</option>
                <option value="Festival">Festival Holiday</option>
                <option value="Company">Company / Factory Event</option>
              </select>
            </div>
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
              Save Holiday
            </button>
          </div>
        </form>
      )}

      {/* Holidays List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Calendar Holidays List ({holidayMaster.holidays.length} Dates Configured)
          </span>
          <span className="text-[11px] text-slate-500">
            Omitted when adding working days for line blocks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Holiday ID</th>
                <th className="py-2.5 px-4">Holiday Name</th>
                <th className="py-2.5 px-4">Calendar Date</th>
                <th className="py-2.5 px-4">Day of Week</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {holidayMaster.holidays.map((h) => {
                const d = new Date(h.date + 'T00:00:00');
                const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{h.id}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{h.name}</td>
                    <td className="py-2.5 px-4 font-mono font-bold tabular-nums text-indigo-700">{h.date}</td>
                    <td className="py-2.5 px-4 text-slate-600">{dayName}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        h.type === 'Festival'
                          ? 'bg-amber-100 text-amber-800'
                          : h.type === 'National'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {h.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => deleteHoliday(h.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete Holiday"
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
