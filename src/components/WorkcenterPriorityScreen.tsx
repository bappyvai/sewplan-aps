import React, { useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { WorkcenterPriority, ProductCategory } from '../types';
import { CUSTOMERS, PRODUCT_CATEGORIES } from '../utils/seeder';
import { Layers, Plus, Trash2, Search, Filter, Info, CheckCircle2 } from 'lucide-react';

export const WorkcenterPriorityScreen: React.FC = () => {
  const { priorities, workcenters, addPriority, deletePriority } = usePlanning();

  // New rule form states
  const [selectedWcId, setSelectedWcId] = useState('WC-01');
  const [selectedCat, setSelectedCat] = useState<ProductCategory>('Denim Pant');
  const [customerName, setCustomerName] = useState<string>('');
  const [styleNo, setStyleNo] = useState<string>('');
  const [rank, setRank] = useState<number>(1);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Search & Filters
  const [filterWc, setFilterWc] = useState('ALL');
  const [filterCat, setFilterCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addPriority({
      workcenter_id: selectedWcId,
      product_category: selectedCat,
      customer_name: customerName ? customerName : undefined,
      style_no: styleNo.trim() ? styleNo.trim().toUpperCase() : undefined,
      rank: Number(rank)
    });
    setCustomerName('');
    setStyleNo('');
    setRank(1);
    setIsFormOpen(false);
  };

  const filteredPriorities = priorities.filter((p) => {
    if (filterWc !== 'ALL' && p.workcenter_id !== filterWc) return false;
    if (filterCat !== 'ALL' && p.product_category !== filterCat) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchWc = p.workcenter_id.toLowerCase().includes(q);
      const matchCust = p.customer_name?.toLowerCase().includes(q);
      const matchStyle = p.style_no?.toLowerCase().includes(q);
      const matchCat = p.product_category.toLowerCase().includes(q);
      if (!matchWc && !matchCust && !matchStyle && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Workcenter Priority Mapping
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define planning allocation ranks for lines by Category, Buyer, and Style hierarchy.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isFormOpen ? 'Close Rule Form' : 'Add Priority Rule'}
        </button>
      </div>

      {/* Hierarchy Logic Explanation Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1.5">
            <span className="font-semibold text-slate-900 block">
              Automated Planning Priority Evaluation Hierarchy:
            </span>
            <p className="text-slate-600 leading-relaxed">
              When auto-scheduling an order, the system scores matching lines in descending priority:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-indigo-600 block">1. Style Level Match</span>
                <span className="text-slate-600">Category + Customer + Style No specified. Takes absolute precedence for specialized garments.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-indigo-600 block">2. Customer Level Match</span>
                <span className="text-slate-600">Category + Customer specified. Allocates dedicated lines reserved for key buyers.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-indigo-600 block">3. Category Fallback Match</span>
                <span className="text-slate-600">Category only specified. General skill & equipment compatibility across lines.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Priority Rule Drawer / Form */}
      {isFormOpen && (
        <form onSubmit={handleCreate} className="bg-white border border-indigo-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Create New Priority Mapping
            </span>
            <span className="text-[11px] text-slate-500">
              Customer Name and Style No are optional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Workcenter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workcenter ID *
              </label>
              <select
                value={selectedWcId}
                onChange={(e) => setSelectedWcId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {workcenters.map((w) => (
                  <option key={w.workcenter_id} value={w.workcenter_id}>
                    {w.workcenter_id} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Category *
              </label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value as ProductCategory)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name (Optional)
              </label>
              <select
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Any Customer --</option>
                {CUSTOMERS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Style No (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Style No (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. DNM-501"
                value={styleNo}
                onChange={(e) => setStyleNo(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
              />
            </div>

            {/* Priority Rank */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Rank * (1 = Top)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rank}
                onChange={(e) => setRank(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
              />
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
              Save Rule
            </button>
          </div>
        </form>
      )}

      {/* Filter and Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter Rules:</span>

            <select
              value={filterWc}
              onChange={(e) => setFilterWc(e.target.value)}
              aria-label="Filter priorities by workcenter"
              className="border border-slate-300 rounded-md px-2 py-1 text-xs bg-white text-slate-800"
            >
              <option value="ALL">All Workcenters</option>
              {workcenters.map((w) => (
                <option key={w.workcenter_id} value={w.workcenter_id}>
                  {w.workcenter_id}
                </option>
              ))}
            </select>

            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              aria-label="Filter priorities by product category"
              className="border border-slate-300 rounded-md px-2 py-1 text-xs bg-white text-slate-800"
            >
              <option value="ALL">All Categories</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search priority rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-800 w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Priority Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Rule ID</th>
                <th className="py-2.5 px-4">Workcenter ID</th>
                <th className="py-2.5 px-4">Product Category</th>
                <th className="py-2.5 px-4">Customer Name</th>
                <th className="py-2.5 px-4">Style No</th>
                <th className="py-2.5 px-4">Specificity Level</th>
                <th className="py-2.5 px-4 text-center">Priority Rank</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPriorities.slice(0, 100).map((p) => {
                const isStyleLevel = Boolean(p.style_no);
                const isCustomerLevel = Boolean(p.customer_name && !p.style_no);
                const isCategoryLevel = !p.customer_name && !p.style_no;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">{p.id}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{p.workcenter_id}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{p.product_category}</td>
                    <td className="py-2.5 px-4">
                      {p.customer_name ? (
                        <span className="font-semibold text-slate-800">{p.customer_name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Any Customer</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {p.style_no ? (
                        <span className="font-mono font-semibold text-indigo-700">{p.style_no}</span>
                      ) : (
                        <span className="text-slate-400 italic">All Styles</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {isStyleLevel ? (
                        <span className="text-[11px] text-purple-700 font-medium">Style Specific</span>
                      ) : isCustomerLevel ? (
                        <span className="text-[11px] text-blue-700 font-medium">Buyer Specific</span>
                      ) : (
                        <span className="text-[11px] text-slate-600">Category General</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs tabular-nums ${
                        p.rank === 1 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => deletePriority(p.id)}
                        title="Delete Rule"
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
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

        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center bg-slate-50">
          <span>Showing {filteredPriorities.length} configured priority rules</span>
          <span>Rank 1 is given top priority during scheduling</span>
        </div>
      </div>
    </div>
  );
};
