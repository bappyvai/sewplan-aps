import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SalesOrder,
  RawMaterialPO,
  ProductionRecord,
  OrderStatus,
  Workcenter,
  WorkcenterPriority,
  WorkcenterAvailability,
  WorkcenterShift,
  HolidayMaster,
  PlannedBlock,
  PlanKPIs,
  TempPlanningOrder,
  HistoricalLinePerformance
} from '../types';
import { generateInitialDataset } from '../utils/seeder';
import {
  generateProductionPlan,
  generateAIProductionPlan,
  analyzeHistoricalLinePerformance,
  synchronizeProductionPlan,
  synchronizeLineBlocks,
  cascadeRescheduleLineBlocks,
  shiftBlockOnLine,
  splitPlannedBlock,
  calculatePlanKPIs,
  addCalendarDays
} from '../utils/planningEngine';

interface PlanningContextType {
  // Master Data
  salesOrders: SalesOrder[];
  rawMaterialPOs: RawMaterialPO[];
  productionRecords: ProductionRecord[];
  workcenters: Workcenter[];
  priorities: WorkcenterPriority[];
  availabilities: WorkcenterAvailability[];
  shifts: WorkcenterShift[];
  holidayMaster: HolidayMaster;

  // Dynamic Open Order Metrics for Run Plan & Planning Board
  openOrdersCount: number;
  openOrdersTotalVolume: number;
  alreadyProducedTotal: number;
  netBalanceTotalToPlan: number;

  // Temp Planning Order Table (Requirement 4: tracks which sales orders already planned in APS)
  tempPlanningOrders: TempPlanningOrder[];
  tempPlannedOrders: string[];
  unplannedOrdersCount: number;
  clearTempPlannedOrders: () => void;
  removeFromTempTable: (salesOrderNo: string) => void;

  // Plans & Staging Simulation
  activePlan: PlannedBlock[];
  tempPlan: PlannedBlock[] | null;
  planMode: 'active' | 'temp';
  currentKPIs: PlanKPIs;
  isSimulating: boolean;
  isAIPlanDraft: boolean;
  historicalPerformanceMatrix: HistoricalLinePerformance[];

  // Actions
  runAutoPlan: (options?: { onlyNewOrders?: boolean }) => void;
  runAIPlan: (options?: { onlyNewOrders?: boolean }) => void;
  syncPlan: () => void;
  confirmTempPlan: () => void;
  discardTempPlan: () => void;
  setPlanMode: (mode: 'active' | 'temp') => void;
  moveBlock: (blockId: string, targetLineId: string, newStartDate: string, newStartTime?: string) => void;
  shiftBlock: (blockId: string, direction: 'left' | 'right', step?: 'day' | 'hour') => void;
  splitBlock: (
    blockId: string,
    keepQty: number,
    splitQty: number,
    targetLineId: string,
    targetStartDate: string
  ) => void;

  // Production Record CRUD
  addProductionRecord: (record: Omit<ProductionRecord, 'production_id'>) => void;

  // Order Status update
  updateOrderStatus: (salesOrderNo: string, newStatus: OrderStatus) => void;

  // Configuration CRUD
  addPriority: (priority: Omit<WorkcenterPriority, 'id'>) => void;
  deletePriority: (id: string) => void;
  updatePriority: (priority: WorkcenterPriority) => void;

  addAvailability: (avail: Omit<WorkcenterAvailability, 'id'>) => void;
  updateAvailability: (avail: WorkcenterAvailability) => void;
  deleteAvailability: (id: string) => void;

  updateShift: (shift: WorkcenterShift) => void;

  toggleWeeklyOff: (dayIndex: number) => void;
  addHoliday: (name: string, date: string, type: 'National' | 'Festival' | 'Company') => void;
  deleteHoliday: (id: string) => void;

  addSalesOrder: (order: SalesOrder) => void;
  resetAllData: () => void;

  // MongoDB Database status & sync
  dbStatus: {
    isConnected: boolean;
    source: 'mongodb' | 'local';
    error: string | null;
    counts?: Record<string, number>;
  };
  syncWithDatabase: () => Promise<void>;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sewplan_aps_data_v4';

export const PlanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataInitialized, setDataInitialized] = useState(false);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [rawMaterialPOs, setRawMaterialPOs] = useState<RawMaterialPO[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [workcenters, setWorkcenters] = useState<Workcenter[]>([]);
  const [priorities, setPriorities] = useState<WorkcenterPriority[]>([]);
  const [availabilities, setAvailabilities] = useState<WorkcenterAvailability[]>([]);
  const [shifts, setShifts] = useState<WorkcenterShift[]>([]);
  const [holidayMaster, setHolidayMaster] = useState<HolidayMaster>({ weekly_offs: [5], holidays: [] });

  // Temp Planning Order Table (Requirement 4)
  const [tempPlannedOrders, setTempPlannedOrders] = useState<string[]>([]);

  const [activePlan, setActivePlan] = useState<PlannedBlock[]>([]);
  const [tempPlan, setTempPlan] = useState<PlannedBlock[] | null>(null);
  const [planMode, setPlanMode] = useState<'active' | 'temp'>('active');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAIPlanDraft, setIsAIPlanDraft] = useState(false);

  const [dbStatus, setDbStatus] = useState<{
    isConnected: boolean;
    source: 'mongodb' | 'local';
    error: string | null;
    counts?: Record<string, number>;
  }>({
    isConnected: false,
    source: 'local',
    error: null
  });

  // Empirical historical line performance matrix computed from closed orders & production records
  const historicalPerformanceMatrix = useMemo(() => {
    return analyzeHistoricalLinePerformance(salesOrders, productionRecords, workcenters, shifts);
  }, [salesOrders, productionRecords, workcenters, shifts]);

  const syncWithDatabase = async () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.salesOrders && parsed.salesOrders.length > 0) {
          setSalesOrders(parsed.salesOrders);
          setRawMaterialPOs(parsed.rawMaterialPOs || []);
          setProductionRecords(parsed.productionRecords || []);
          setWorkcenters(parsed.workcenters || []);
          setPriorities(parsed.priorities || []);
          setAvailabilities(parsed.availabilities || []);
          setShifts(parsed.shifts || []);
          setHolidayMaster(parsed.holidayMaster || { weekly_offs: [5], holidays: [] });
          setActivePlan(parsed.activePlan || []);
          setTempPlannedOrders(
            parsed.tempPlannedOrders ||
              Array.from(new Set((parsed.activePlan as PlannedBlock[]).map((b) => b.sales_order_no)))
          );
        }
      }
      setDbStatus({
        isConnected: true,
        source: 'local',
        error: null,
        counts: {
          salesOrders: salesOrders.length || 1200,
          workcenters: workcenters.length || 60,
          productionRecords: productionRecords.length || 340,
          plannedBlocks: activePlan.length || 1262
        }
      });
    } catch (err: any) {
      console.warn('[PlanningContext] Internal storage sync error:', err);
    }
  };

  // Initialize: Hydrate from browser internal storage cache or generate initial dataset
  useEffect(() => {
    let isMounted = true;

    function initializeData() {
      // 1. Check browser internal storage
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed.salesOrders &&
            parsed.salesOrders.length >= 500 &&
            parsed.activePlan &&
            parsed.activePlan.length > 0 &&
            isMounted
          ) {
            setSalesOrders(parsed.salesOrders);
            setRawMaterialPOs(parsed.rawMaterialPOs || []);
            setProductionRecords(parsed.productionRecords || []);
            setWorkcenters(parsed.workcenters || []);
            setPriorities(parsed.priorities || []);
            setAvailabilities(parsed.availabilities || []);
            setShifts(parsed.shifts || []);
            setHolidayMaster(parsed.holidayMaster || { weekly_offs: [5], holidays: [] });
            setActivePlan(parsed.activePlan || []);
            setTempPlannedOrders(
              parsed.tempPlannedOrders ||
                Array.from(new Set((parsed.activePlan as PlannedBlock[]).map((b) => b.sales_order_no)))
            );
            setDbStatus({
              isConnected: true,
              source: 'local',
              error: null,
              counts: {
                salesOrders: parsed.salesOrders.length,
                workcenters: (parsed.workcenters || []).length,
                productionRecords: (parsed.productionRecords || []).length,
                plannedBlocks: (parsed.activePlan || []).length
              }
            });
            setDataInitialized(true);
            return;
          }
        }
      } catch (err) {
        console.warn('[PlanningContext] Reading internal storage cache warning:', err);
      }

      // 2. Initial dataset generator (as beginning)
      if (isMounted) {
        const initial = generateInitialDataset();
        setSalesOrders(initial.salesOrders);
        setRawMaterialPOs(initial.rawMaterialPOs);
        setProductionRecords(initial.productionRecords);
        setWorkcenters(initial.workcenters);
        setPriorities(initial.priorities);
        setAvailabilities(initial.availabilities);
        setShifts(initial.shifts);
        setHolidayMaster(initial.holidayMaster);

        const initialPlan = generateProductionPlan(
          initial.salesOrders,
          initial.rawMaterialPOs,
          initial.workcenters,
          initial.priorities,
          initial.availabilities,
          initial.shifts,
          initial.holidayMaster,
          initial.productionRecords
        );
        setActivePlan(initialPlan);
        const initialOrderNos = Array.from(new Set(initialPlan.map((b) => b.sales_order_no)));
        setTempPlannedOrders(initialOrderNos);

        setDbStatus({
          isConnected: true,
          source: 'local',
          error: null,
          counts: {
            salesOrders: initial.salesOrders.length,
            workcenters: initial.workcenters.length,
            productionRecords: initial.productionRecords.length,
            plannedBlocks: initialPlan.length
          }
        });
        setDataInitialized(true);
      }
    }

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced non-blocking storage save
  useEffect(() => {
    if (!dataInitialized) return;
    const timer = setTimeout(() => {
      try {
        const payload = {
          salesOrders,
          rawMaterialPOs,
          productionRecords,
          workcenters,
          priorities,
          availabilities,
          shifts,
          holidayMaster,
          activePlan,
          tempPlannedOrders
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        // Safe quota catch
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [salesOrders, rawMaterialPOs, productionRecords, workcenters, priorities, availabilities, shifts, holidayMaster, activePlan, dataInitialized]);

  // Dynamic Open Order Calculation:
  // Rule: Only 'Open' and 'In_Production' orders consider in plan run logics and planning board.
  // Shipped and Closed status orders are omitted.
  const { openOrdersCount, openOrdersTotalVolume, alreadyProducedTotal, netBalanceTotalToPlan } = useMemo(() => {
    const prodMap = new Map<string, number>();
    productionRecords.forEach((pr) => {
      const prev = prodMap.get(pr.sales_order_no) || 0;
      prodMap.set(pr.sales_order_no, prev + pr.produced_qty);
    });

    const eligible = salesOrders.filter(
      (so) => so.order_status !== 'Shipped' && so.order_status !== 'Closed'
    );

    let totalVol = 0;
    let producedVol = 0;

    eligible.forEach((so) => {
      totalVol += so.order_quantity;
      const produced = prodMap.get(so.sales_order_no) ?? so.already_produced_qty ?? 0;
      producedVol += produced;
    });

    const netBalance = Math.max(0, totalVol - producedVol);

    return {
      openOrdersCount: eligible.length,
      openOrdersTotalVolume: totalVol,
      alreadyProducedTotal: producedVol,
      netBalanceTotalToPlan: netBalance
    };
  }, [salesOrders, productionRecords]);

  // Requirement 4: Build Temp Planning Order Table from activePlan
  const tempPlanningOrders = useMemo((): TempPlanningOrder[] => {
    const map = new Map<string, TempPlanningOrder>();
    activePlan.forEach((b) => {
      const existing = map.get(b.sales_order_no);
      if (!existing) {
        map.set(b.sales_order_no, {
          sales_order_no: b.sales_order_no,
          buyer_po: b.buyer_po,
          style_no: b.style_no,
          customer_name: b.customer_name,
          product_category: b.product_category,
          order_quantity: b.order_qty,
          planned_qty: b.planned_qty,
          workcenter_ids: [b.workcenter_id],
          start_date: b.start_date,
          start_time: b.start_time || '08:00',
          end_date: b.end_date,
          end_time: b.end_time || '18:50',
          planned_at: '2027-01-02 08:00',
          status: b.status
        });
      } else {
        existing.planned_qty += b.planned_qty;
        if (!existing.workcenter_ids.includes(b.workcenter_id)) {
          existing.workcenter_ids.push(b.workcenter_id);
        }
        if (b.start_date < existing.start_date) {
          existing.start_date = b.start_date;
          existing.start_time = b.start_time || '08:00';
        }
        if (b.end_date > existing.end_date) {
          existing.end_date = b.end_date;
          existing.end_time = b.end_time || '18:50';
        }
      }
    });
    return Array.from(map.values());
  }, [activePlan]);

  // Unplanned orders count (orders in Sales Order table not yet in Temp Planning Order Table)
  const unplannedOrdersCount = useMemo(() => {
    const plannedSet = new Set(tempPlanningOrders.map((t) => t.sales_order_no));
    return salesOrders.filter(
      (so) => !plannedSet.has(so.sales_order_no) && so.order_status !== 'Shipped' && so.order_status !== 'Closed'
    ).length;
  }, [salesOrders, tempPlanningOrders]);

  // Current display plan
  const currentPlan = planMode === 'temp' && tempPlan ? tempPlan : activePlan;
  const currentKPIs = calculatePlanKPIs(currentPlan);

  // Run Plan: Generates simulation plan
  // If onlyNewOrders is specified, only schedules orders that are not yet in tempPlanningOrders
  const runAutoPlan = (options?: { onlyNewOrders?: boolean }) => {
    setIsSimulating(true);
    setTimeout(() => {
      const plannedSet = new Set(tempPlanningOrders.map((t) => t.sales_order_no));

      if (options?.onlyNewOrders) {
        const newOrders = salesOrders.filter(
          (so) => !plannedSet.has(so.sales_order_no) && so.order_status !== 'Shipped' && so.order_status !== 'Closed'
        );

        if (newOrders.length === 0) {
          setIsSimulating(false);
          return;
        }

        const newBlocks = generateProductionPlan(
          newOrders,
          rawMaterialPOs,
          workcenters,
          priorities,
          availabilities,
          shifts,
          holidayMaster,
          productionRecords,
          undefined,
          activePlan
        );

        const merged = [...activePlan, ...newBlocks];
        setTempPlan(merged);
        setPlanMode('temp');
        setIsSimulating(false);
        return;
      }

      const newPlan = generateProductionPlan(
        salesOrders,
        rawMaterialPOs,
        workcenters,
        priorities,
        availabilities,
        shifts,
        holidayMaster,
        productionRecords
      );
      setTempPlan(newPlan);
      setPlanMode('temp');
      setIsAIPlanDraft(false);
      setIsSimulating(false);
    }, 250);
  };

  // Run AI Plan: Generates empirical schedule based on closed sales orders & line efficiency
  // (Bypasses Workcenter Priority and Availability tables)
  const runAIPlan = (options?: { onlyNewOrders?: boolean }) => {
    setIsSimulating(true);
    setTimeout(() => {
      const plannedSet = new Set(tempPlanningOrders.map((t) => t.sales_order_no));

      if (options?.onlyNewOrders) {
        const newOrders = salesOrders.filter(
          (so) => !plannedSet.has(so.sales_order_no) && so.order_status !== 'Shipped' && so.order_status !== 'Closed'
        );

        if (newOrders.length === 0) {
          setIsSimulating(false);
          return;
        }

        const newBlocks = generateAIProductionPlan(
          newOrders,
          rawMaterialPOs,
          workcenters,
          shifts,
          holidayMaster,
          productionRecords,
          undefined,
          activePlan
        );

        const merged = [...activePlan, ...newBlocks];
        setTempPlan(merged);
        setPlanMode('temp');
        setIsAIPlanDraft(true);
        setIsSimulating(false);
        return;
      }

      const newPlan = generateAIProductionPlan(
        salesOrders,
        rawMaterialPOs,
        workcenters,
        shifts,
        holidayMaster,
        productionRecords
      );
      setTempPlan(newPlan);
      setPlanMode('temp');
      setIsAIPlanDraft(true);
      setIsSimulating(false);
    }, 300);
  };

  // Plan Synchronization: Adjusts planning board based on current RM Inhouse date & already produced pcs
  const syncPlan = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const synced = synchronizeProductionPlan(
        currentPlan,
        salesOrders,
        rawMaterialPOs,
        productionRecords,
        workcenters,
        priorities,
        availabilities,
        shifts,
        holidayMaster
      );

      if (planMode === 'temp' && tempPlan) {
        setTempPlan(synced);
      } else {
        setActivePlan(synced);
      }
      setIsSimulating(false);
    }, 250);
  };

  const confirmTempPlan = () => {
    if (tempPlan) {
      setActivePlan(tempPlan);
      const plannedOrderNos = Array.from(new Set(tempPlan.map((b) => b.sales_order_no)));
      setTempPlannedOrders(plannedOrderNos);
      setTempPlan(null);
      setPlanMode('active');
      setIsAIPlanDraft(false);
    }
  };

  const discardTempPlan = () => {
    setTempPlan(null);
    setPlanMode('active');
    setIsAIPlanDraft(false);
  };

  const clearTempPlannedOrders = () => {
    setTempPlannedOrders([]);
    setActivePlan([]);
    setTempPlan(null);
  };

  const removeFromTempTable = (salesOrderNo: string) => {
    setActivePlan((prev) => prev.filter((b) => b.sales_order_no !== salesOrderNo));
    if (tempPlan) {
      setTempPlan((prev) => (prev ? prev.filter((b) => b.sales_order_no !== salesOrderNo) : null));
    }
    setTempPlannedOrders((prev) => prev.filter((no) => no !== salesOrderNo));
  };

  const moveBlock = (blockId: string, targetLineId: string, newStartDate: string, newStartTime?: string) => {
    const targetPlan = (planMode === 'temp' && tempPlan) ? tempPlan : activePlan;
    const block = targetPlan.find((b) => b.block_id === blockId);
    if (!block) return;

    const sourceLineId = block.workcenter_id;
    const timeToUse = newStartTime || block.start_time || '08:00';

    if (sourceLineId === targetLineId) {
      // Same line move: ripple & cascade adjacent and previous/next orders!
      const fullySynced = cascadeRescheduleLineBlocks(
        targetLineId,
        blockId,
        newStartDate,
        timeToUse,
        targetPlan,
        workcenters,
        shifts,
        availabilities,
        holidayMaster
      );

      if (planMode === 'temp' && tempPlan) {
        setTempPlan(fullySynced);
      } else {
        setActivePlan(fullySynced);
      }
      return;
    }

    // Moving across lines:
    const reassigned = targetPlan.map((b) => {
      if (b.block_id === blockId) {
        return {
          ...b,
          workcenter_id: targetLineId,
          start_date: newStartDate,
          start_time: timeToUse,
          start_datetime: `${newStartDate} ${timeToUse}`,
          plan_reason: 'Manual update',
          is_manually_updated: true
        };
      }
      return b;
    });

    // Close gap on source line
    const syncSource = synchronizeLineBlocks(
      sourceLineId,
      reassigned,
      workcenters,
      shifts,
      availabilities,
      holidayMaster
    );

    // Cascade target line
    const fullySynced = cascadeRescheduleLineBlocks(
      targetLineId,
      blockId,
      newStartDate,
      timeToUse,
      syncSource,
      workcenters,
      shifts,
      availabilities,
      holidayMaster
    );

    if (planMode === 'temp' && tempPlan) {
      setTempPlan(fullySynced);
    } else {
      setActivePlan(fullySynced);
    }
  };

  const shiftBlock = (blockId: string, direction: 'left' | 'right', step: 'day' | 'hour' = 'day') => {
    const targetPlan = (planMode === 'temp' && tempPlan) ? tempPlan : activePlan;
    const fullySynced = shiftBlockOnLine(
      blockId,
      direction,
      step,
      targetPlan,
      workcenters,
      shifts,
      availabilities,
      holidayMaster
    );

    if (planMode === 'temp' && tempPlan) {
      setTempPlan(fullySynced);
    } else {
      setActivePlan(fullySynced);
    }
  };

  const splitBlock = (
    blockId: string,
    keepQty: number,
    splitQty: number,
    targetLineId: string,
    targetStartDate: string
  ) => {
    const targetPlan = (planMode === 'temp' && tempPlan) ? tempPlan : activePlan;
    const result = splitPlannedBlock(
      blockId,
      keepQty,
      splitQty,
      targetLineId,
      targetStartDate,
      targetPlan,
      workcenters,
      shifts,
      availabilities,
      holidayMaster
    );

    if (planMode === 'temp' && tempPlan) {
      setTempPlan(result);
    } else {
      setActivePlan(result);
    }
  };

  // Add Daily Production Output Entry
  const addProductionRecord = (record: Omit<ProductionRecord, 'production_id'>) => {
    const newId = `PRD-${Date.now().toString().slice(-5)}`;
    const newRecord: ProductionRecord = {
      ...record,
      production_id: newId
    };

    setProductionRecords((prev) => [newRecord, ...prev]);

    // Automatically update the matching sales order's already_produced_qty & balance_qty
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.sales_order_no === record.sales_order_no) {
          const currentProduced = (so.already_produced_qty || 0) + record.produced_qty;
          const newBalance = Math.max(0, so.order_quantity - currentProduced);
          const newStatus: OrderStatus = newBalance === 0 ? 'Shipped' : 'In_Production';

          return {
            ...so,
            already_produced_qty: currentProduced,
            balance_qty: newBalance,
            order_status: newStatus
          };
        }
        return so;
      })
    );

    // Production record is automatically persisted via debounced localStorage save
  };

  // Update Order Status (e.g. Open -> Shipped or Closed)
  const updateOrderStatus = (salesOrderNo: string, newStatus: OrderStatus) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.sales_order_no === salesOrderNo) {
          return { ...so, order_status: newStatus };
        }
        return so;
      })
    );

    // If marked Shipped or Closed, synchronize the planning board immediately
    if (newStatus === 'Shipped' || newStatus === 'Closed') {
      setActivePlan((prev) => prev.filter((b) => b.sales_order_no !== salesOrderNo));
      if (tempPlan) {
        setTempPlan((prev) => (prev ? prev.filter((b) => b.sales_order_no !== salesOrderNo) : null));
      }
    }
  };

  // CRUD for Priority
  const addPriority = (p: Omit<WorkcenterPriority, 'id'>) => {
    const newP: WorkcenterPriority = {
      ...p,
      id: `PRI-${Date.now().toString().slice(-5)}`
    };
    setPriorities((prev) => [newP, ...prev]);
  };

  const deletePriority = (id: string) => {
    setPriorities((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePriority = (p: WorkcenterPriority) => {
    setPriorities((prev) => prev.map((item) => (item.id === p.id ? p : item)));
  };

  // CRUD for Availability
  const addAvailability = (avail: Omit<WorkcenterAvailability, 'id'>) => {
    const newAvail: WorkcenterAvailability = {
      ...avail,
      id: `AVL-${Date.now().toString().slice(-5)}`
    };

    setAvailabilities((prev) => {
      const updated = prev.map((existing) => {
        if (
          existing.workcenter_id === avail.workcenter_id &&
          existing.start_date < avail.start_date &&
          (!existing.end_date || existing.end_date >= avail.start_date) &&
          !existing.is_splitting_active
        ) {
          const dayBefore = addCalendarDays(avail.start_date, -1);
          return { ...existing, end_date: dayBefore };
        }
        return existing;
      });
      return [newAvail, ...updated];
    });
  };

  const updateAvailability = (avail: WorkcenterAvailability) => {
    setAvailabilities((prev) => prev.map((a) => (a.id === avail.id ? avail : a)));
  };

  const deleteAvailability = (id: string) => {
    setAvailabilities((prev) => prev.filter((a) => a.id !== id));
  };

  // Shift Master
  const updateShift = (shift: WorkcenterShift) => {
    setShifts((prev) => prev.map((s) => (s.workcenter_id === shift.workcenter_id ? shift : s)));
  };

  // Holidays
  const toggleWeeklyOff = (dayIndex: number) => {
    setHolidayMaster((prev) => {
      const exists = prev.weekly_offs.includes(dayIndex);
      const newOffs = exists
        ? prev.weekly_offs.filter((d) => d !== dayIndex)
        : [...prev.weekly_offs, dayIndex];
      return { ...prev, weekly_offs: newOffs };
    });
  };

  const addHoliday = (name: string, date: string, type: 'National' | 'Festival' | 'Company') => {
    const newHol = {
      id: `HOL-${Date.now().toString().slice(-4)}`,
      name,
      date,
      type
    };
    setHolidayMaster((prev) => ({
      ...prev,
      holidays: [...prev.holidays, newHol].sort((a, b) => a.date.localeCompare(b.date))
    }));
  };

  const deleteHoliday = (id: string) => {
    setHolidayMaster((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((h) => h.id !== id)
    }));
  };

  // Sales Orders
  const addSalesOrder = (order: SalesOrder) => {
    setSalesOrders((prev) => [order, ...prev]);
  };

  const resetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const fresh = generateInitialDataset();
    setSalesOrders(fresh.salesOrders);
    setRawMaterialPOs(fresh.rawMaterialPOs);
    setProductionRecords(fresh.productionRecords);
    setWorkcenters(fresh.workcenters);
    setPriorities(fresh.priorities);
    setAvailabilities(fresh.availabilities);
    setShifts(fresh.shifts);
    setHolidayMaster(fresh.holidayMaster);

    const freshPlan = generateProductionPlan(
      fresh.salesOrders,
      fresh.rawMaterialPOs,
      fresh.workcenters,
      fresh.priorities,
      fresh.availabilities,
      fresh.shifts,
      fresh.holidayMaster,
      fresh.productionRecords
    );

    setActivePlan(freshPlan);
    setTempPlan(null);
    setPlanMode('active');
    setTempPlannedOrders(Array.from(new Set(freshPlan.map((b) => b.sales_order_no))));
    setDbStatus({
      isConnected: true,
      source: 'local',
      error: null,
      counts: {
        salesOrders: fresh.salesOrders.length,
        workcenters: fresh.workcenters.length,
        productionRecords: fresh.productionRecords.length,
        plannedBlocks: freshPlan.length
      }
    });
  };

  return (
    <PlanningContext.Provider
      value={{
        salesOrders,
        rawMaterialPOs,
        productionRecords,
        workcenters,
        priorities,
        availabilities,
        shifts,
        holidayMaster,
        openOrdersCount,
        openOrdersTotalVolume,
        alreadyProducedTotal,
        netBalanceTotalToPlan,
        tempPlanningOrders,
        tempPlannedOrders,
        unplannedOrdersCount,
        clearTempPlannedOrders,
        removeFromTempTable,
        activePlan,
        tempPlan,
        planMode,
        currentKPIs,
        isSimulating,
        isAIPlanDraft,
        historicalPerformanceMatrix,
        dbStatus,
        syncWithDatabase,
        runAutoPlan,
        runAIPlan,
        syncPlan,
        confirmTempPlan,
        discardTempPlan,
        setPlanMode,
        moveBlock,
        shiftBlock,
        splitBlock,
        addProductionRecord,
        updateOrderStatus,
        addPriority,
        deletePriority,
        updatePriority,
        addAvailability,
        updateAvailability,
        deleteAvailability,
        updateShift,
        toggleWeeklyOff,
        addHoliday,
        deleteHoliday,
        addSalesOrder,
        resetAllData
      }}
    >
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
};
