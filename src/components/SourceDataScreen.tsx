import React, { useState, useMemo } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { SalesOrder, RawMaterialPO, ProductCategory, OrderStatus } from '../types';
import { CUSTOMERS, PRODUCT_CATEGORIES, CATEGORY_SMV } from '../utils/seeder';
import {
  Database,
  Search,
  Plus,
  RotateCcw,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  Truck,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const SourceDataScreen: React.FC = () => {
  const {
    salesOrders,
    rawMaterialPOs,
    tempPlanningOrders,
    unplannedOrdersCount,
    removeFromTempTable,
    addSalesOrder,
    updateOrderStatus,
    resetAllData,
    dbStatus,
    syncWithDatabase
  } = usePlanning();

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleExportJSON = () => {
    try {
      const exportData = {
        salesOrders,
        rawMaterialPOs,
        productionRecords: usePlanning().productionRecords,
        workcenters: usePlanning().workcenters,
        priorities: usePlanning().priorities,
        availabilities: usePlanning().availabilities,
        shifts: usePlanning().shifts,
        holidayMaster: usePlanning().holidayMaster,
        activePlan: usePlanning().activePlan,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sewplan_aps_dataset_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedback('Internal storage dataset exported successfully as JSON file!');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(`Export error: ${err.message}`);
    }
  };

  const handleReloadDataset = () => {
    if (confirm('Reload the full benchmark dataset (1,200 sales orders, 60 sewing lines, master tables) into internal storage?')) {
      resetAllData();
      setFeedback('Internal storage reloaded with fresh benchmark dataset!');
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const [activeTab, setActiveTab] = useState<'sales' | 'temp_planning' | 'raw_materials'>('sales');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Add Sales Order Form Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBuyerPo, setNewBuyerPo] = useState('PO-ZARA-9921');
  const [newCustomer, setNewCustomer] = useState(CUSTOMERS[0].name);
  const [newCategory, setNewCategory] = useState<ProductCategory>('Denim Pant');
  const [newStyleNo, setNewStyleNo] = useState('DNM-501');
  const [newStyleDesc, setNewStyleDesc] = useState('Slim Fit Stretch Denim Pant');
  const [newColor, setNewColor] = useState('Indigo Dark Wash');
  const [newSize, setNewSize] = useState('32/34');
  const [newQty, setNewQty] = useState<number>(5000);
  const [newRate, setNewRate] = useState<number>(14.50);
  const [newDestination, setNewDestination] = useState('Rotterdam, NL');
  const [newSmv, setNewSmv] = useState<number>(18.5);
  const [newShipDate, setNewShipDate] = useState('2027-04-15');
  const [newStatus, setNewStatus] = useState<OrderStatus>('Open');

  // Set of sales order nos currently in temp planning table
  const plannedSet = useMemo(
    () => new Set(tempPlanningOrders.map((t) => t.sales_order_no)),
    [tempPlanningOrders]
  );

  // Filter Sales Orders
  const filteredOrders = salesOrders.filter((so) => {
    if (customerFilter !== 'ALL' && so.customer_name !== customerFilter) return false;
    if (categoryFilter !== 'ALL' && so.product_category !== categoryFilter) return false;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'Unplanned') {
        if (plannedSet.has(so.sales_order_no) || so.order_status === 'Shipped' || so.order_status === 'Closed') {
          return false;
        }
      } else if (statusFilter === 'PlannedInTemp') {
        if (!plannedSet.has(so.sales_order_no)) return false;
      } else if (so.order_status !== statusFilter) {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        so.sales_order_no.toLowerCase().includes(q) ||
        so.buyer_po.toLowerCase().includes(q) ||
        so.style_no.toLowerCase().includes(q) ||
        so.customer_name.toLowerCase().includes(q) ||
        so.destination.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filter Temp Planning Orders (Requirement 4)
  const filteredTempOrders = tempPlanningOrders.filter((t) => {
    if (customerFilter !== 'ALL' && t.customer_name !== customerFilter) return false;
    if (categoryFilter !== 'ALL' && t.product_category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.sales_order_no.toLowerCase().includes(q) ||
        t.buyer_po.toLowerCase().includes(q) ||
        t.style_no.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.workcenter_ids.some((wc) => wc.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filter RM POs
  const filteredRMs = rawMaterialPOs.filter((rm) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        rm.po_no.toLowerCase().includes(q) ||
        rm.vendor_name.toLowerCase().includes(q) ||
        rm.material_type.toLowerCase().includes(q) ||
        (rm.sales_order_no && rm.sales_order_no.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(
    (activeTab === 'sales'
      ? filteredOrders.length
      : activeTab === 'temp_planning'
      ? filteredTempOrders.length
      : filteredRMs.length) / pageSize
  );

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedTempOrders = filteredTempOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedRMs = filteredRMs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPieces = salesOrders.reduce((sum, so) => sum + so.order_quantity, 0);
  const totalRevenue = salesOrders.reduce((sum, so) => sum + so.order_quantity * so.rate, 0);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newSeq = (salesOrders.length + 1).toString().padStart(4, '0');
    const orderNo = `SO-2027-${newSeq}`;

    addSalesOrder({
      sales_order_no: orderNo,
      buyer_po: newBuyerPo,
      customer_name: newCustomer,
      product_category: newCategory,
      style_no: newStyleNo,
      style_desc: newStyleDesc,
      color: newColor,
      size: newSize,
      order_quantity: Number(newQty),
      rate: Number(newRate),
      destination: newDestination,
      smv: Number(newSmv),
      ship_date: newShipDate,
      order_status: newStatus
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Source Data Master Tables
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {salesOrders.length.toLocaleString()} sales orders totaling {totalPieces.toLocaleString()} pcs across 6 global retail buyers and raw material procurement tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (confirm(`Reset entire system dataset to initial demo data (${salesOrders.length.toLocaleString()} orders, ${totalPieces.toLocaleString()} pcs)?`)) {
                resetAllData();
              }
            }}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Demo Data
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Sales Order
          </button>
        </div>
      </div>

      {/* High-Performance Internal Storage Data Architecture Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  High-Performance Internal Storage (APS Engine)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active &amp; Persisted (Zero DB Latency)</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Storage: <span className="text-slate-200">Browser Internal Storage (localStorage)</span> · Engine: <span className="text-indigo-300">Deterministic APS Seeder &amp; Scheduler</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => syncWithDatabase()}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Refresh internal storage state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Refresh State</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Export complete internal database state to JSON file"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-200" />
              <span>Export JSON Backup</span>
            </button>
            <button
              onClick={handleReloadDataset}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Reload initial dataset (1,200 orders, 60 lines, and apparel master tables)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Reload Benchmark Dataset</span>
            </button>
          </div>
        </div>

        {/* Collection stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sales Orders</span>
            <span className="font-bold text-slate-100 font-mono text-sm">
              {salesOrders.length.toLocaleString()} Orders
            </span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sewing Workcenters</span>
            <span className="font-bold text-slate-100 font-mono text-sm">60 Active Lines</span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Raw Material POs</span>
            <span className="font-bold text-slate-100 font-mono text-sm">
              {rawMaterialPOs.length.toLocaleString()} POs
            </span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Planned Blocks</span>
            <span className="font-bold text-indigo-300 font-mono text-sm">
              {(usePlanning().activePlan.length || 1262).toLocaleString()} Blocks
            </span>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-2.5 rounded-lg text-xs flex items-center gap-2 border bg-emerald-950/60 border-emerald-500/40 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Total Sales Orders
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {salesOrders.length} <span className="text-xs font-normal text-slate-500">Orders</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">6 Buyers: Zara, H&amp;M, Levi&apos;s, Nike, Uniqlo, Gap</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Total Order Volume
          </span>
          <p className="text-xl font-bold text-indigo-600 mt-1 tabular-nums">
            {totalPieces.toLocaleString()} <span className="text-xs font-normal text-slate-500">Pcs</span>
          </p>
          <span className="text-[11px] text-indigo-700 font-medium mt-1 block">Exact benchmark: 2,500,000 pcs</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Total Order Value
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            ${(totalRevenue / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-500">USD</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">FOB Export Valuation</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Raw Material POs
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {rawMaterialPOs.length} <span className="text-xs font-normal text-slate-500">Purchases</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Fabric, Thread, Trim &amp; Zipper POs</span>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Tab Toggle & Search */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => {
                setActiveTab('sales');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'sales' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales Order Table ({salesOrders.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('temp_planning');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'temp_planning' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Temp Planning Order Table ({tempPlanningOrders.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('raw_materials');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'raw_materials' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Material Purchase Table ({rawMaterialPOs.length})
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(activeTab === 'sales' || activeTab === 'temp_planning') && (
              <>
                <select
                  value={customerFilter}
                  onChange={(e) => {
                    setCustomerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by customer"
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
                  aria-label="Filter by product category"
                  className="border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white text-slate-800"
                >
                  <option value="ALL">All Categories</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </>
            )}

            {activeTab === 'sales' && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by order status"
                className="border border-slate-300 rounded-md px-2 py-1.5 text-xs bg-white text-slate-800 font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In_Production">In_Production</option>
                <option value="Shipped">Shipped (Omitted)</option>
                <option value="Closed">Closed (Omitted)</option>
                <option value="PlannedInTemp">Planned in Temp Table</option>
                <option value="Unplanned">★ Unplanned / New Orders</option>
              </select>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search records..."
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

        {/* Tab 1: Sales Orders Table (Main Sales Table) */}
        {activeTab === 'sales' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Sales Order No</th>
                  <th className="py-2.5 px-3">Buyer PO</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Style &amp; Desc</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Color / Size</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">APS Plan Status</th>
                  <th className="py-2.5 px-3 text-right">Order Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate ($)</th>
                  <th className="py-2.5 px-3 text-center">SMV</th>
                  <th className="py-2.5 px-3 text-center">Ship Date</th>
                  <th className="py-2.5 px-3">Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedOrders.map((so) => {
                  const isPlannedInTemp = plannedSet.has(so.sales_order_no);
                  const isExcluded = so.order_status === 'Shipped' || so.order_status === 'Closed';

                  return (
                    <tr key={so.sales_order_no} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{so.sales_order_no}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{so.buyer_po}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{so.customer_name}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-indigo-700 block">{so.style_no}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">{so.style_desc}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{so.product_category}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {so.color} · <span className="font-semibold">{so.size}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <select
                          value={so.order_status}
                          onChange={(e) => updateOrderStatus(so.sales_order_no, e.target.value as OrderStatus)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                            so.order_status === 'Open'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : so.order_status === 'In_Production'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : so.order_status === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="In_Production">In_Production</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isExcluded ? (
                          <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                            Excluded
                          </span>
                        ) : isPlannedInTemp ? (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                            In Temp Table
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            New / Unplanned
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {so.order_quantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                        ${so.rate.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800 tabular-nums">
                        {so.smv}m
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800 tabular-nums">
                        {so.ship_date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[120px]">
                        {so.destination}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'temp_planning' ? (
          /* Tab 2: Temp Planning Order Table (Requirement 4) */
          <div>
            <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Temp Planning Order Table:</strong> Stores records of sales orders already scheduled and placed on the planning board ({tempPlanningOrders.length} orders). When <strong>Run Plan</strong> is executed for New Orders, only orders in the main Sales Order table not present in this table are picked by the algorithm.
                </span>
              </div>
              <span className="font-bold text-[11px] bg-white text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded shadow-xs shrink-0">
                {unplannedOrdersCount} Unplanned in Sales Table
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Order No · PO</th>
                    <th className="py-2.5 px-3">Buyer</th>
                    <th className="py-2.5 px-3">Style &amp; Category</th>
                    <th className="py-2.5 px-3 text-right">Order Qty</th>
                    <th className="py-2.5 px-3 text-right">Planned Qty</th>
                    <th className="py-2.5 px-3">Assigned Line(s)</th>
                    <th className="py-2.5 px-3 text-center">Planned Start</th>
                    <th className="py-2.5 px-3 text-center">Planned End</th>
                    <th className="py-2.5 px-3 text-center">Board Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedTempOrders.map((t) => (
                    <tr key={t.sales_order_no} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        <div>{t.sales_order_no}</div>
                        <div className="text-[10px] font-normal text-slate-500">{t.buyer_po}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{t.customer_name}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-indigo-700 block">{t.style_no}</span>
                        <span className="text-[10px] text-slate-500">{t.product_category}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {t.order_quantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-700 tabular-nums">
                        {t.planned_qty.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                        {t.workcenter_ids.join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-800">
                        <div>{t.start_date}</div>
                        <div className="text-[10px] text-indigo-600 font-bold">{t.start_time || '08:00'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-800">
                        <div>{t.end_date}</div>
                        <div className="text-[10px] text-indigo-600 font-bold">{t.end_time || '18:50'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {t.status === 'material_delay' ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            RM Delay
                          </span>
                        ) : t.status === 'ship_date_risk' ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            Ship Risk
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            On-Time
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove ${t.sales_order_no} from Temp Planning Table? This resets it to Unplanned so it can be re-scheduled.`)) {
                              removeFromTempTable(t.sales_order_no);
                            }
                          }}
                          title="Remove from Temp Table to re-plan"
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[10px] font-semibold transition-colors cursor-pointer border border-slate-200 hover:border-rose-200 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3 text-slate-400 group-hover:text-rose-600" />
                          <span>Reset</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Tab 2: Raw Material Purchase Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">PO No</th>
                  <th className="py-2.5 px-3">Vendor Name</th>
                  <th className="py-2.5 px-3">Material Type</th>
                  <th className="py-2.5 px-3">Material Specification</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-center">UOM</th>
                  <th className="py-2.5 px-3 text-right">Rate ($)</th>
                  <th className="py-2.5 px-3 text-center">Inhouse Date</th>
                  <th className="py-2.5 px-3">Linked Sales Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedRMs.map((rm) => (
                  <tr key={rm.po_no} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rm.po_no}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{rm.vendor_name}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{rm.material_type}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-sm">{rm.material_specification}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                      {rm.quantity.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-600">{rm.uom}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      ${rm.rate.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700 tabular-nums">
                      {rm.inhouse_date}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{rm.sales_order_no || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50">
          <span className="text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, activeTab === 'sales' ? filteredOrders.length : filteredRMs.length)} of{' '}
            {activeTab === 'sales' ? filteredOrders.length : filteredRMs.length} items
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

      {/* Add Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateOrder} className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">
                Create New Sales Order
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer PO *</label>
                <input
                  type="text"
                  value={newBuyerPo}
                  onChange={(e) => setNewBuyerPo(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer *</label>
                <select
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  {CUSTOMERS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => {
                    const cat = e.target.value as ProductCategory;
                    setNewCategory(cat);
                    setNewSmv(CATEGORY_SMV[cat] || 15.0);
                  }}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Style No *</label>
                <input
                  type="text"
                  value={newStyleNo}
                  onChange={(e) => setNewStyleNo(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Style Description</label>
                <input
                  type="text"
                  value={newStyleDesc}
                  onChange={(e) => setNewStyleDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Color *</label>
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Size *</label>
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Quantity (Pcs) *</label>
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">FOB Rate ($/pc) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SMV (Standard Minutes) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={newSmv}
                  onChange={(e) => setNewSmv(Number(e.target.value))}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ship Date *</label>
                <input
                  type="date"
                  value={newShipDate}
                  onChange={(e) => setNewShipDate(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800"
                >
                  <option value="Open">Open</option>
                  <option value="In_Production">In_Production</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Destination Port</label>
                <input
                  type="text"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs"
              >
                Save &amp; Generate Sales Order No
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
