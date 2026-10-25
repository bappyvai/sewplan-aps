import React, { useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { ProductionRecord } from '../types';
import {
  Factory,
  Plus,
  Search,
  Calendar,
  CheckCircle,
  TrendingUp,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageCheck
} from 'lucide-react';

export const ProductionTableScreen: React.FC = () => {
  const {
    productionRecords,
    salesOrders,
    workcenters,
    addProductionRecord
  } = usePlanning();

  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'order_progress'>('order_progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWc, setFilterWc] = useState('ALL');

  // Form State for Logging Production
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrderNo, setSelectedOrderNo] = useState(
    salesOrders.find((o) => o.order_status === 'In_Production' || o.order_status === 'Open')?.sales_order_no || 'SO-2027-0036'
  );
  const [selectedWc, setSelectedWc] = useState('WC-01');
  const [prodDate, setProdDate] = useState('2027-02-12');
  const [producedQty, setProducedQty] = useState<number>(650);
  const [shiftName, setShiftName] = useState('Standard Day (08:00 - 18:50)');
  const [remarks, setRemarks] = useState('Daily sewing floor output recorded');

  // Pagination for logs
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderNo || producedQty <= 0) return;

    addProductionRecord({
      production_date: prodDate,
      sales_order_no: selectedOrderNo,
      workcenter_id: selectedWc,
      produced_qty: Number(producedQty),
      shift: shiftName,
      operator_count: 43,
      remarks
    });

    setIsFormOpen(false);
    setRemarks('Daily sewing floor output recorded');
  };

  // Compute production map per order
  const orderProducedMap = new Map<string, number>();
  productionRecords.forEach((pr) => {
    const prev = orderProducedMap.get(pr.sales_order_no) || 0;
    orderProducedMap.set(pr.sales_order_no, prev + pr.produced_qty);
  });

  // Filtered Production Logs
  const filteredLogs = productionRecords.filter((pr) => {
    if (filterWc !== 'ALL' && pr.workcenter_id !== filterWc) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        pr.production_id.toLowerCase().includes(q) ||
        pr.sales_order_no.toLowerCase().includes(q) ||
        pr.workcenter_id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filtered Order Progress
  const filteredOrders = salesOrders.filter((so) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        so.sales_order_no.toLowerCase().includes(q) ||
        so.buyer_po.toLowerCase().includes(q) ||
        so.customer_name.toLowerCase().includes(q) ||
        so.style_no.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalLogsPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalOrdersPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalFactoryProducedPcs = productionRecords.reduce((sum, pr) => sum + pr.produced_qty, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Floor Production Table &amp; Output Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log actual sewing line output. Completed pieces automatically reduce order quantities, planning only the net balance.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Close Form' : 'Log Floor Production Output'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Total Pieces Produced
          </span>
          <p className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
            {totalFactoryProducedPcs.toLocaleString()} <span className="text-xs font-normal text-slate-500">pcs</span>
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Recorded on sewing floors</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Production Output Entries
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {productionRecords.length} <span className="text-xs font-normal text-slate-500">Logs</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Shift output records</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Orders in Production
          </span>
          <p className="text-xl font-bold text-indigo-600 mt-1 tabular-nums">
            {salesOrders.filter((o) => o.order_status === 'In_Production').length} <span className="text-xs font-normal text-slate-500">Orders</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Partial balance remaining</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Completed &amp; Shipped Orders
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {salesOrders.filter((o) => o.order_status === 'Shipped').length} <span className="text-xs font-normal text-slate-500">Orders</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">100% produced (omitted from plan)</span>
        </div>
      </div>

      {/* Production Log Entry Form Drawer */}
      {isFormOpen && (
        <form onSubmit={handleCreate} className="bg-white border border-indigo-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Record Sewing Floor Output (Reduces Plan Balance)
            </span>
            <span className="text-[11px] text-indigo-700 font-medium">
              Updating output automatically adjusts net balance quantity on the Planning Board
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
            {/* Sales Order No */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sales Order No *
              </label>
              <select
                value={selectedOrderNo}
                onChange={(e) => setSelectedOrderNo(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800"
              >
                {salesOrders
                  .filter((o) => o.order_status !== 'Shipped' && o.order_status !== 'Closed')
                  .slice(0, 50)
                  .map((so) => (
                    <option key={so.sales_order_no} value={so.sales_order_no}>
                      {so.sales_order_no} - {so.customer_name} ({so.style_no})
                    </option>
                  ))}
              </select>
            </div>

            {/* Workcenter Line */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sewing Line *
              </label>
              <select
                value={selectedWc}
                onChange={(e) => setSelectedWc(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800"
              >
                {workcenters.map((w) => (
                  <option key={w.workcenter_id} value={w.workcenter_id}>
                    {w.workcenter_id} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Production Date *
              </label>
              <input
                type="date"
                value={prodDate}
                onChange={(e) => setProdDate(e.target.value)}
                required
                className="w-full border border-slate-300 rounded px-2.5 py-1.5"
              />
            </div>

            {/* Produced Qty */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Produced Qty (Pcs) *
              </label>
              <input
                type="number"
                min="1"
                value={producedQty}
                onChange={(e) => setProducedQty(Number(e.target.value))}
                required
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 tabular-nums"
              />
            </div>

            {/* Shift */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shift
              </label>
              <select
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="Standard Day (08:00 - 18:50)">Standard Day (08:00 - 18:50)</option>
                <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 - 15:30)</option>
                <option value="Overtime Shift (19:00 - 22:00)">Overtime Shift (19:00 - 22:00)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs"
            >
              Record Output &amp; Reduce Balance
            </button>
          </div>
        </form>
      )}

      {/* Main Table Views */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Sub-tab selection */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => {
                setActiveSubTab('order_progress');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeSubTab === 'order_progress' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order Balance &amp; Produced Qty Summary
            </button>
            <button
              onClick={() => {
                setActiveSubTab('logs');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeSubTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Production Logs ({productionRecords.length})
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {activeSubTab === 'logs' && (
              <select
                value={filterWc}
                onChange={(e) => {
                  setFilterWc(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-800"
              >
                <option value="ALL">All Sewing Lines</option>
                {workcenters.map((w) => (
                  <option key={w.workcenter_id} value={w.workcenter_id}>
                    {w.workcenter_id}
                  </option>
                ))}
              </select>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 w-48"
              />
            </div>
          </div>
        </div>

        {/* View 1: Order Balance Matrix */}
        {activeSubTab === 'order_progress' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Sales Order No</th>
                  <th className="py-2.5 px-3">Buyer PO</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Style &amp; Desc</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Order Qty</th>
                  <th className="py-2.5 px-3 text-right text-emerald-700">Already Produced</th>
                  <th className="py-2.5 px-3 text-right text-indigo-700">Balance to Plan</th>
                  <th className="py-2.5 px-4 text-center min-w-[130px]">Completion Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedOrders.map((so) => {
                  const produced = orderProducedMap.get(so.sales_order_no) ?? so.already_produced_qty ?? 0;
                  const balance = Math.max(0, so.order_quantity - produced);
                  const pct = Math.min(100, Math.round((produced / so.order_quantity) * 100));

                  return (
                    <tr key={so.sales_order_no} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{so.sales_order_no}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{so.buyer_po}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{so.customer_name}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-indigo-700 block">{so.style_no}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-xs">{so.style_desc}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{so.product_category}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          so.order_status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : so.order_status === 'Closed'
                            ? 'bg-slate-100 text-slate-700'
                            : so.order_status === 'In_Production'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {so.order_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {so.order_quantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                        {produced.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-indigo-700 tabular-nums">
                        {balance.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct === 100 ? 'bg-blue-600' : pct > 0 ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums text-slate-700 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* View 2: Daily Production Logs */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">Log ID</th>
                  <th className="py-2.5 px-4">Production Date</th>
                  <th className="py-2.5 px-4">Sales Order No</th>
                  <th className="py-2.5 px-4">Sewing Line</th>
                  <th className="py-2.5 px-4 text-right">Produced Qty (Pcs)</th>
                  <th className="py-2.5 px-4">Shift Schedule</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedLogs.map((pr) => (
                  <tr key={pr.production_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{pr.production_id}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">{pr.production_date}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-indigo-700">{pr.sales_order_no}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{pr.workcenter_id}</td>
                    <td className="py-2.5 px-4 text-right font-extrabold text-emerald-700 tabular-nums">
                      +{pr.produced_qty.toLocaleString()} pcs
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{pr.shift || 'Standard Shift'}</td>
                    <td className="py-2.5 px-4 text-slate-500 truncate max-w-sm">{pr.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50">
          <span className="text-slate-500">
            Page {currentPage} of {activeSubTab === 'order_progress' ? totalOrdersPages || 1 : totalLogsPages || 1}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(activeSubTab === 'order_progress' ? totalOrdersPages : totalLogsPages, p + 1))}
              disabled={currentPage >= (activeSubTab === 'order_progress' ? totalOrdersPages : totalLogsPages)}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
