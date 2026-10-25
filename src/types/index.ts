export type ProductCategory = 
  | 'Denim Pant'
  | 'Shorts'
  | 'Polo T-Shirt'
  | 'Joggers'
  | 'Cargo Pants'
  | 'Hoodie';

export type OrderStatus = 'Open' | 'In_Production' | 'Shipped' | 'Closed';

export interface SalesOrder {
  sales_order_no: string;      // System generated sequence number (e.g. SO-2027-0001)
  buyer_po: string;
  style_no: string;
  style_desc: string;
  customer_name: string;
  color: string;
  size: string;
  product_category: ProductCategory;
  order_quantity: number;
  rate: number;
  destination: string;
  smv: number;                 // Standard Minute Value (e.g. 18.5)
  ship_date: string;           // YYYY-MM-DD
  order_status: OrderStatus;   // 'Open' | 'In_Production' | 'Shipped' | 'Closed'
  already_produced_qty?: number;
  balance_qty?: number;
}

export interface ProductionRecord {
  production_id: string;       // e.g. PRD-2027-0001
  production_date: string;     // YYYY-MM-DD
  sales_order_no: string;
  workcenter_id: string;
  produced_qty: number;
  shift?: string;
  operator_count?: number;
  remarks?: string;
}

export interface RawMaterialPO {
  po_no: string;
  vendor_name: string;
  material_type: string;
  material_specification: string;
  quantity: number;
  uom: string;
  rate: number;
  inhouse_date: string;        // YYYY-MM-DD
  is_inhoused?: boolean;       // true if already in warehouse; false if delivery pending
  sales_order_no?: string;     // Link to sales order
  style_no?: string;
}

export interface Workcenter {
  workcenter_id: string;       // e.g. WC-01, WC-02 ... WC-60
  name: string;                // e.g. Line 01 (Denim Unit)
  floor: string;
  standard_cadre: number;      // e.g. 43 operators
  current_category: ProductCategory;
  is_split_enabled: boolean;
}

export interface WorkcenterPriority {
  id: string;
  workcenter_id: string;
  product_category: ProductCategory;
  customer_name?: string;      // Optional
  style_no?: string;           // Optional
  rank: number;                // 1 = Highest priority
}

export interface WorkcenterAvailability {
  id: string;                  // System generated ID
  workcenter_id: string;
  product_category: ProductCategory;
  start_date: string;          // YYYY-MM-DD
  end_date?: string;           // Optional YYYY-MM-DD
  efficiency_pct: number;      // e.g. 80 means 80% (0.80)
  is_splitting_active?: boolean;
  allocated_cadre?: number;    // e.g. standard 43 or divided 25
}

export interface WorkcenterShift {
  id: string;
  workcenter_id: string;
  from_date: string;
  to_date: string;
  working_hours: number;       // e.g. 9.83
  break_time_minutes: number;  // e.g. 60
  shift_start_time: string;    // e.g. 08:00
  shift_end_time: string;      // e.g. 18:50
  cadre?: number;              // Number of carder/operators from Shift master
}

export interface HolidayEntry {
  id: string;
  name: string;
  date: string;                // YYYY-MM-DD
  type: 'National' | 'Festival' | 'Company';
}

export interface HolidayMaster {
  weekly_offs: number[];       // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  holidays: HolidayEntry[];
}

export type BlockStatus = 'on_time' | 'material_delay' | 'ship_date_risk';

export interface PlannedBlock {
  block_id: string;            // Auto-generated plan ID for Sales Order + Color
  parent_block_id?: string;    // If split from another block
  sales_order_no: string;
  buyer_po: string;
  customer_name: string;
  style_no: string;
  style_desc: string;
  color: string;
  size: string;
  product_category: ProductCategory;
  order_qty: number;           // Original sales order quantity
  already_produced_qty: number;// Pieces already completed from sewing floor
  planned_qty: number;         // Balance quantity to plan
  smv: number;
  workcenter_id: string;
  start_date: string;          // YYYY-MM-DD
  start_time: string;          // HH:MM e.g. "08:00"
  end_date: string;            // YYYY-MM-DD
  end_time: string;            // HH:MM e.g. "13:30"
  start_datetime?: string;     // YYYY-MM-DD HH:MM
  end_datetime?: string;       // YYYY-MM-DD HH:MM
  working_days_needed: number;
  ship_date: string;
  rm_inhouse_date?: string;
  status: BlockStatus;
  status_reason?: string;
  daily_allocations: Record<string, number>; // date YYYY-MM-DD -> pcs allocated
  color_index?: number;
  total_colors?: number;
  produce_minutes?: number;    // Block Qty * SMV
  is_auto_split?: boolean;
  split_sibling_line?: string;
  split_sibling_block_id?: string;
  is_ai_planned?: boolean;
  ai_efficiency_pct?: number;
  ai_line_match_reason?: string;
  plan_reason?: string;        // Explicit logic explanation for Plan Explanation Report
  is_manually_updated?: boolean; // Set true when dragged/nudged/forced by planner
}

export type AppUserRole = 'admin' | 'viewer';

export interface AuthUser {
  role: AppUserRole;
  username: string;
  loggedInAt: string;
}

export interface HistoricalLinePerformance {
  customer_name: string;
  product_category: ProductCategory;
  workcenter_id: string;
  workcenter_name: string;
  total_produced_pieces: number;
  total_working_days: number;
  avg_daily_output: number;
  efficiency_pct: number;
  cadre: number;
  completed_orders_count: number;
  composite_score: number;
  rank: number;
}

export interface TempPlanningOrder {
  sales_order_no: string;
  buyer_po: string;
  style_no: string;
  customer_name: string;
  product_category: ProductCategory;
  order_quantity: number;
  planned_qty: number;
  workcenter_ids: string[];
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  planned_at: string;
  status: BlockStatus;
}

export interface PlannedOrderRecord {
  sales_order_no: string;
  planned_at: string;
  planned_qty: number;
  workcenter_ids: string[];
}

export interface PlanKPIs {
  totalOrders: number;
  totalPieces: number;
  totalBlocks: number;
  onTimeBlocks: number;
  materialDelayedBlocks: number;
  shipRiskBlocks: number;
  averageUtilizationPct: number;
  openOrdersCount: number;
  totalOrderPieces?: number;
  alreadyProducedPieces: number;
  netBalancePiecesToPlan: number;
}
