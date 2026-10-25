import mongoose, { Schema } from 'mongoose';

// 1. Sales Order
const SalesOrderSchema = new Schema(
  {
    sales_order_no: { type: String, required: true, unique: true, index: true },
    buyer_po: { type: String, required: true },
    style_no: { type: String, required: true },
    style_desc: { type: String, default: '' },
    customer_name: { type: String, required: true, index: true },
    color: { type: String, required: true },
    size: { type: String, default: '' },
    product_category: { type: String, required: true, index: true },
    order_quantity: { type: Number, required: true },
    rate: { type: Number, default: 0 },
    destination: { type: String, default: '' },
    smv: { type: Number, required: true },
    ship_date: { type: String, required: true, index: true },
    order_status: {
      type: String,
      enum: ['Open', 'In_Production', 'Shipped', 'Closed'],
      default: 'Open',
      index: true
    },
    already_produced_qty: { type: Number, default: 0 },
    balance_qty: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 2. Raw Material PO
const RawMaterialPOSchema = new Schema(
  {
    po_no: { type: String, required: true, unique: true, index: true },
    vendor_name: { type: String, required: true },
    material_type: { type: String, required: true },
    material_specification: { type: String, default: '' },
    quantity: { type: Number, required: true },
    uom: { type: String, default: 'Yards' },
    rate: { type: Number, default: 0 },
    inhouse_date: { type: String, required: true, index: true },
    is_inhoused: { type: Boolean, default: false },
    sales_order_no: { type: String, index: true },
    style_no: { type: String }
  },
  { timestamps: true }
);

// 3. Production Record
const ProductionRecordSchema = new Schema(
  {
    production_id: { type: String, required: true, unique: true, index: true },
    production_date: { type: String, required: true, index: true },
    sales_order_no: { type: String, required: true, index: true },
    workcenter_id: { type: String, required: true, index: true },
    produced_qty: { type: Number, required: true },
    shift: { type: String, default: 'Standard Day (08:00 - 18:50)' },
    operator_count: { type: Number, default: 43 },
    remarks: { type: String, default: '' }
  },
  { timestamps: true }
);

// 4. Workcenter
const WorkcenterSchema = new Schema(
  {
    workcenter_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    floor: { type: String, required: true },
    standard_cadre: { type: Number, default: 43 },
    current_category: { type: String, required: true },
    is_split_enabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// 5. Workcenter Priority
const WorkcenterPrioritySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    workcenter_id: { type: String, required: true, index: true },
    product_category: { type: String, required: true, index: true },
    customer_name: { type: String },
    style_no: { type: String },
    rank: { type: Number, required: true }
  },
  { timestamps: true }
);

// 6. Workcenter Availability
const WorkcenterAvailabilitySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    workcenter_id: { type: String, required: true, index: true },
    product_category: { type: String, required: true, index: true },
    start_date: { type: String, required: true },
    end_date: { type: String },
    efficiency_pct: { type: Number, default: 80 },
    is_splitting_active: { type: Boolean, default: false },
    allocated_cadre: { type: Number, default: 43 }
  },
  { timestamps: true }
);

// 7. Workcenter Shift
const WorkcenterShiftSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    workcenter_id: { type: String, required: true, index: true },
    from_date: { type: String, required: true },
    to_date: { type: String, required: true },
    working_hours: { type: Number, default: 9.83 },
    break_time_minutes: { type: Number, default: 60 },
    shift_start_time: { type: String, default: '08:00' },
    shift_end_time: { type: String, default: '18:50' },
    cadre: { type: Number, default: 43 }
  },
  { timestamps: true }
);

// 8. Holiday Master
const HolidayMasterSchema = new Schema(
  {
    master_key: { type: String, default: 'default', unique: true },
    weekly_offs: { type: [Number], default: [5] }, // 5 = Friday
    holidays: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        date: { type: String, required: true },
        type: { type: String, enum: ['National', 'Festival', 'Company'], default: 'National' }
      }
    ]
  },
  { timestamps: true }
);

// 9. Planned Block (Authoritative Factory Schedule)
const PlannedBlockSchema = new Schema(
  {
    block_id: { type: String, required: true, unique: true, index: true },
    parent_block_id: { type: String },
    sales_order_no: { type: String, required: true, index: true },
    buyer_po: { type: String, required: true },
    customer_name: { type: String, required: true, index: true },
    style_no: { type: String, required: true },
    style_desc: { type: String, default: '' },
    color: { type: String, required: true },
    size: { type: String, default: '' },
    product_category: { type: String, required: true, index: true },
    order_qty: { type: Number, required: true },
    already_produced_qty: { type: Number, default: 0 },
    planned_qty: { type: Number, required: true },
    smv: { type: Number, required: true },
    workcenter_id: { type: String, required: true, index: true },
    start_date: { type: String, required: true, index: true },
    start_time: { type: String, default: '08:00' },
    end_date: { type: String, required: true, index: true },
    end_time: { type: String, default: '18:50' },
    start_datetime: { type: String },
    end_datetime: { type: String },
    working_days_needed: { type: Number, default: 1 },
    ship_date: { type: String, required: true },
    rm_inhouse_date: { type: String },
    status: {
      type: String,
      enum: ['on_time', 'material_delay', 'ship_date_risk'],
      default: 'on_time'
    },
    status_reason: { type: String },
    daily_allocations: { type: Schema.Types.Mixed, default: {} },
    is_auto_split: { type: Boolean, default: false },
    split_sibling_line: { type: String },
    split_sibling_block_id: { type: String },
    is_ai_planned: { type: Boolean, default: false },
    ai_efficiency_pct: { type: Number },
    ai_line_match_reason: { type: String }
  },
  { timestamps: true }
);

// 10. Database Metadata & Seeding Log
const DbMetadataSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
    seeded_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const SalesOrderModel = mongoose.models.SalesOrder || mongoose.model('SalesOrder', SalesOrderSchema);
export const RawMaterialPOModel = mongoose.models.RawMaterialPO || mongoose.model('RawMaterialPO', RawMaterialPOSchema);
export const ProductionRecordModel = mongoose.models.ProductionRecord || mongoose.model('ProductionRecord', ProductionRecordSchema);
export const WorkcenterModel = mongoose.models.Workcenter || mongoose.model('Workcenter', WorkcenterSchema);
export const WorkcenterPriorityModel = mongoose.models.WorkcenterPriority || mongoose.model('WorkcenterPriority', WorkcenterPrioritySchema);
export const WorkcenterAvailabilityModel = mongoose.models.WorkcenterAvailability || mongoose.model('WorkcenterAvailability', WorkcenterAvailabilitySchema);
export const WorkcenterShiftModel = mongoose.models.WorkcenterShift || mongoose.model('WorkcenterShift', WorkcenterShiftSchema);
export const HolidayMasterModel = mongoose.models.HolidayMaster || mongoose.model('HolidayMaster', HolidayMasterSchema);
export const PlannedBlockModel = mongoose.models.PlannedBlock || mongoose.model('PlannedBlock', PlannedBlockSchema);
export const DbMetadataModel = mongoose.models.DbMetadata || mongoose.model('DbMetadata', DbMetadataSchema);
