import React, { useState, useMemo } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { CUSTOMERS, PRODUCT_CATEGORIES } from '../utils/seeder';
import {
  Sparkles,
  Play,
  CheckCircle,
  RotateCcw,
  Calendar,
  Layers,
  Clock,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  Info,
  Check,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

interface AIPlanScreenProps {
  onNavigateToBoard: () => void;
}

export const AIPlanScreen: React.FC<AIPlanScreenProps> = ({ onNavigateToBoard }) => {
  const {
    salesOrders,
    rawMaterialPOs,
    productionRecords,
    workcenters,
    activePlan,
    tempPlan,
    planMode,
    isSimulating,
    isAIPlanDraft,
    historicalPerformanceMatrix,
    runAIPlan,
    confirmTempPlan,
    discardTempPlan,
    currentKPIs
  } = usePlanning();

  const [customerFilter, setCustomerFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [planScope, setPlanScope] = useState<'all' | 'new'>('all');

  // Filter historical matrix
  const filteredMatrix = useMemo(() => {
    return historicalPerformanceMatrix.filter((item) => {
      if (customerFilter !== 'ALL' && item.customer_name !== customerFilter) return false;
      if (categoryFilter !== 'ALL' && item.product_category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.customer_name.toLowerCase().includes(q) ||
          item.product_category.toLowerCase().includes(q) ||
          item.workcenter_id.toLowerCase().includes(q) ||
          item.workcenter_name.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [historicalPerformanceMatrix, customerFilter, categoryFilter, searchQuery]);

  // Open eligible orders count and volume
  const eligibleOrders = useMemo(() => {
    const prodMap = new Map<string, number>();
    productionRecords.forEach((pr) => {
      const prev = prodMap.get(pr.sales_order_no) || 0;
      prodMap.set(pr.sales_order_no, prev + pr.produced_qty);
    });

    return salesOrders.filter((so) => {
      if (so.order_status === 'Shipped' || so.order_status === 'Closed') return false;
      const produced = prodMap.get(so.sales_order_no) ?? so.already_produced_qty ?? 0;
      return so.order_quantity - produced > 0;
    });
  }, [salesOrders, productionRecords]);

  const totalEligiblePieces = useMemo(() => {
    const prodMap = new Map<string, number>();
    productionRecords.forEach((pr) => {
      const prev = prodMap.get(pr.sales_order_no) || 0;
      prodMap.set(pr.sales_order_no, prev + pr.produced_qty);
    });

    return eligibleOrders.reduce((sum, so) => {
      const produced = prodMap.get(so.sales_order_no) ?? so.already_produced_qty ?? 0;
      return sum + Math.max(0, so.order_quantity - produced);
    }, 0);
  }, [eligibleOrders, productionRecords]);

  // Group top historical performers by Customer & Category
  const topPicks = useMemo(() => {
    const map = new Map<string, typeof historicalPerformanceMatrix[0]>();
    historicalPerformanceMatrix.forEach((item) => {
      const key = `${item.customer_name}__${item.product_category}`;
      const existing = map.get(key);
      if (!existing || item.rank < existing.rank || (item.rank === existing.rank && item.composite_score > existing.composite_score)) {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  }, [historicalPerformanceMatrix]);

  const handleRunAIPlan = () => {
    runAIPlan({ onlyNewOrders: planScope === 'new' });
  };

  const handlePublishPlan = () => {
    confirmTempPlan();
  };

  return (
    <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Garment Planning Engine</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Priority Table: Bypassed
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Availability Table: Bypassed
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Historical Closed Orders Learning: Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Empirical Historical AI Scheduler
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Unlike static scheduling, the AI Plan bypasses manual workcenter priority and availability tables. It analyzes closed sales orders and historical sewing floor actuals to identify which line achieved peak efficiency % and output for each customer and product category.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-4 h-4 text-indigo-300" />
                <span>Auto Start: <strong>Ship Date - 32 Days</strong> (Ship - 35 + 3)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>Target Finish: <strong>Ship Date - 5 Days</strong> (Ex-Factory QA buffer)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <TrendingUp className="w-4 h-4 text-amber-300" />
                <span>Parameters: <strong>Empirical Line Efficiency %</strong></span>
              </div>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/15 w-full lg:w-80 shrink-0 space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                Orders Waiting for AI Plan
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {eligibleOrders.length.toLocaleString()}{' '}
                <span className="text-xs font-medium text-slate-300">
                  orders ({totalEligiblePieces.toLocaleString()} pcs)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Planning Scope
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPlanScope('all')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors cursor-pointer text-center ${
                    planScope === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  All Orders ({eligibleOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPlanScope('new')}
                  className={`py-1.5 px-2 rounded-lg font-semibold transition-colors cursor-pointer text-center ${
                    planScope === 'new'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  New Orders Only
                </button>
              </div>
            </div>

            <button
              onClick={handleRunAIPlan}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Computing AI Allocations...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute AI Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Temporary Draft Banner (If AI plan generated) */}
      {planMode === 'temp' && tempPlan && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                {isAIPlanDraft ? 'AI Draft Plan Ready' : 'Temporary Simulation Plan'}
              </span>
              <span className="text-xs font-bold">
                {tempPlan.length} blocks planned ({currentKPIs.totalPieces.toLocaleString()} pieces)
              </span>
            </div>
            <p className="text-xs text-amber-50">
              The AI plan is currently staged in the <strong>Temporary Planning Board</strong>. You can review, drag bars left/right to ripple adjacent blocks, fine-tune lines, and then publish to make it the factory's actual plan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={onNavigateToBoard}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open Temporary Board</span>
            </button>
            <button
              onClick={discardTempPlan}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
            <button
              onClick={handlePublishPlan}
              className="px-4 py-1.5 bg-white text-amber-900 hover:bg-amber-50 active:bg-amber-100 rounded-lg text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Publish to Actual Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Garment Industry Architecture & Logic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Empirical Closed-Order Matching
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The AI engine queries past closed and shipped sales orders where garments were produced on factory sewing lines. It scores lines based on <strong>actual efficiency % achieved</strong> and <strong>daily piece output rate</strong> for that customer and category.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Garment Lead Time Scheduling
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Start date defaults to <strong>Ship Date - 35 + 3 Days (Ship - 32 Days)</strong>. End date targets <strong>Ship Date - 5 Days</strong>, leaving a mandatory 5-day ex-factory buffer for garment washing, needle inspection, packing &amp; customs port delivery.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Interactive Sandbox to Publish
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The AI schedule is loaded into the temporary planning board first. Planners can drag and ripple orders left or right, adjust shift hours, split lines, and then click <strong>Publish to Actual Plan</strong> to deploy to the factory floor.
          </p>
        </div>
      </div>

      {/* Historical Intelligence Matrix Explorer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Historical Line Intelligence Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical output and efficiency % learned from closed orders &amp; shop-floor logs. Highest scored line is assigned by AI Plan.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search line, buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 placeholder-slate-400"
              />
            </div>

            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              aria-label="Filter by customer"
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="ALL">All Buyers</option>
              {CUSTOMERS.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by product category"
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Product Category</th>
                <th className="py-2.5 px-4">Rank #1 Best Line</th>
                <th className="py-2.5 px-4 text-right">Historical Eff %</th>
                <th className="py-2.5 px-4 text-right">Daily Output (pcs/day)</th>
                <th className="py-2.5 px-4 text-center">Cadre</th>
                <th className="py-2.5 px-4 text-right">Closed Orders</th>
                <th className="py-2.5 px-4 text-center">AI Selection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMatrix.slice(0, 30).map((perf, idx) => {
                const isRank1 = perf.rank === 1;
                return (
                  <tr
                    key={`${perf.customer_name}-${perf.product_category}-${perf.workcenter_id}-${idx}`}
                    className={`hover:bg-slate-50/80 transition-colors ${isRank1 ? 'bg-indigo-50/20 font-medium' : ''}`}
                  >
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {perf.customer_name}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                        {perf.product_category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          isRank1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          #{perf.rank}
                        </span>
                        <span className="font-bold text-slate-900">{perf.workcenter_name}</span>
                        <span className="text-[10px] text-slate-400">({perf.workcenter_id})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-700">
                      {perf.efficiency_pct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800">
                      {perf.avg_daily_output.toLocaleString()} pcs
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-600">
                      {perf.cadre} ops
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-600">
                      {perf.completed_orders_count} orders
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {isRank1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Primary AI Line</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span>Backup #{perf.rank}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMatrix.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No historical performance records match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
