import {
  SalesOrder,
  RawMaterialPO,
  ProductionRecord,
  Workcenter,
  WorkcenterPriority,
  WorkcenterAvailability,
  WorkcenterShift,
  HolidayMaster,
  ProductCategory
} from '../types';

export const CUSTOMERS = [
  { name: 'Zara', color: '#0284c7', bg: 'bg-sky-500', text: 'text-sky-700', border: 'border-sky-500' },
  { name: 'H&M', color: '#dc2626', bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-500' },
  { name: 'Levi Strauss', color: '#2563eb', bg: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-600' },
  { name: 'Nike', color: '#16a34a', bg: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-600' },
  { name: 'Uniqlo', color: '#ea580c', bg: 'bg-orange-600', text: 'text-orange-700', border: 'border-orange-600' },
  { name: 'Gap', color: '#7c3aed', bg: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-600' }
];

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Denim Pant',
  'Shorts',
  'Polo T-Shirt',
  'Joggers',
  'Cargo Pants',
  'Hoodie'
];

export const CATEGORY_SMV: Record<ProductCategory, number> = {
  'Denim Pant': 18.5,
  'Shorts': 9.5,
  'Polo T-Shirt': 12.0,
  'Joggers': 14.0,
  'Cargo Pants': 21.0,
  'Hoodie': 19.5
};

const STYLES_BY_CATEGORY: Record<ProductCategory, Array<{ style: string; desc: string; smv: number }>> = {
  'Denim Pant': [
    { style: 'DNM-501', desc: '5-Pocket Slim Fit Stretch Denim', smv: 18.5 },
    { style: 'DNM-511', desc: 'Straight Fit Vintage Wash Jean', smv: 19.2 },
    { style: 'DNM-514', desc: 'Relaxed Tapered Indigo Denim', smv: 17.8 },
    { style: 'DNM-527', desc: 'Bootcut Heavy enzyme Wash', smv: 20.0 }
  ],
  'Shorts': [
    { style: 'SHT-101', desc: 'Cargo Chino Casual Shorts', smv: 9.2 },
    { style: 'SHT-204', desc: 'French Terry Athleisure Shorts', smv: 8.8 },
    { style: 'SHT-310', desc: 'Flex Utility Active Shorts', smv: 10.4 }
  ],
  'Polo T-Shirt': [
    { style: 'POLO-01', desc: 'Classic Pique 100% Cotton Polo', smv: 11.5 },
    { style: 'POLO-08', desc: 'Performance Moisture-Wicking Polo', smv: 12.8 },
    { style: 'POLO-15', desc: 'Striped Jacquard Rib Collar Polo', smv: 13.2 }
  ],
  'Joggers': [
    { style: 'JOG-301', desc: 'Fleece Cuffed Gym Jogger', smv: 13.8 },
    { style: 'JOG-405', desc: 'Tapered Utility Cargo Jogger', smv: 15.2 },
    { style: 'JOG-510', desc: 'Brushed Cotton Lounge Jogger', smv: 12.9 }
  ],
  'Cargo Pants': [
    { style: 'CRG-701', desc: 'Multi-Pocket Heavy Twill Cargo', smv: 21.5 },
    { style: 'CRG-709', desc: 'Ripstop Outdoor Tactical Pant', smv: 22.0 },
    { style: 'CRG-815', desc: 'Relaxed Streetwear Baggy Cargo', smv: 20.8 }
  ],
  'Hoodie': [
    { style: 'HOD-901', desc: 'Overhead Fleece Kangaroo Hoodie', smv: 19.2 },
    { style: 'HOD-920', desc: 'Zip-Up Heavyweight French Terry', smv: 20.5 },
    { style: 'HOD-945', desc: 'Drop-Shoulder Streetwear Hoodie', smv: 18.6 }
  ]
};

const COLORS = [
  'Vintage Indigo',
  'Deep Navy',
  'Washed Black',
  'Olive Drab',
  'Heather Grey',
  'Pure White',
  'Burgundy',
  'Camel Khaki',
  'Charcoal'
];

const DESTINATIONS = [
  'Rotterdam, NL',
  'Hamburg, DE',
  'New York (JFK), US',
  'Los Angeles (LAX), US',
  'Tokyo (NRT), JP',
  'Felixstowe, UK',
  'Sydney, AU'
];

const VENDORS = [
  'Pacific Denim Mills Ltd.',
  'Toray Textile Global',
  'YKK Fastening Corp.',
  'Coats Industrial Thread',
  'Avery Dennison Label Systems',
  'Kipas Denim Fabrics',
  'Banswara Syntex Ltd.'
];

export function generateInitialDataset(): {
  salesOrders: SalesOrder[];
  rawMaterialPOs: RawMaterialPO[];
  productionRecords: ProductionRecord[];
  workcenters: Workcenter[];
  priorities: WorkcenterPriority[];
  availabilities: WorkcenterAvailability[];
  shifts: WorkcenterShift[];
  holidayMaster: HolidayMaster;
} {
  // 1. Generate 60 Workcenters
  const workcenters: Workcenter[] = [];
  for (let i = 1; i <= 60; i++) {
    const pad = i.toString().padStart(2, '0');
    const id = `WC-${pad}`;
    let floor = 'Building A - Denim Floor';
    let cat: ProductCategory = 'Denim Pant';

    if (i <= 20) {
      floor = 'Building A (Lines 01-20)';
      cat = i % 2 === 0 ? 'Denim Pant' : 'Cargo Pants';
    } else if (i <= 40) {
      floor = 'Building B (Lines 21-40)';
      cat = i % 2 === 0 ? 'Polo T-Shirt' : 'Hoodie';
    } else {
      floor = 'Building C (Lines 41-60)';
      cat = i % 2 === 0 ? 'Shorts' : 'Joggers';
    }

    // Enable splitting for select lines as an example
    const is_split_enabled = (i === 5 || i === 15 || i === 25 || i === 35 || i === 45 || i === 55);

    workcenters.push({
      workcenter_id: id,
      name: `Line ${pad}`,
      floor,
      standard_cadre: 43, // Standard 43 operators as requested
      current_category: cat,
      is_split_enabled
    });
  }

  // 2. Generate Workcenter Shift Masters (08:00 - 18:50, 9.83 hrs, 60m break)
  const shifts: WorkcenterShift[] = workcenters.map((wc, idx) => ({
    id: `SHIFT-WC-${(idx + 1).toString().padStart(2, '0')}`,
    workcenter_id: wc.workcenter_id,
    from_date: '2027-01-01',
    to_date: '2027-12-31',
    working_hours: 9.83, // As in user specification
    break_time_minutes: 60,
    shift_start_time: '08:00',
    shift_end_time: '18:50',
    cadre: 43
  }));

  // 3. Generate Workcenter Priority Table
  const priorities: WorkcenterPriority[] = [];
  let priorityIdCounter = 1;

  workcenters.forEach((wc, idx) => {
    const lineNum = idx + 1;
    // Primary Category Rank 1
    priorities.push({
      id: `PRI-${priorityIdCounter++}`,
      workcenter_id: wc.workcenter_id,
      product_category: wc.current_category,
      customer_name: CUSTOMERS[idx % CUSTOMERS.length].name,
      rank: 1
    });

    // Secondary Category Rank 2
    const secondCat = PRODUCT_CATEGORIES[(idx + 1) % PRODUCT_CATEGORIES.length];
    priorities.push({
      id: `PRI-${priorityIdCounter++}`,
      workcenter_id: wc.workcenter_id,
      product_category: secondCat,
      rank: 2
    });

    // Additional specific Style Priority for top lines
    if (lineNum <= 10) {
      priorities.push({
        id: `PRI-${priorityIdCounter++}`,
        workcenter_id: wc.workcenter_id,
        product_category: 'Denim Pant',
        customer_name: 'Levi Strauss',
        style_no: 'DNM-501',
        rank: 1
      });
    }
  });

  // 4. Generate Workcenter Availability Mapping
  const availabilities: WorkcenterAvailability[] = [];
  let availIdCounter = 1;

  workcenters.forEach((wc) => {
    if (wc.is_split_enabled) {
      // Split line into two categories running concurrently
      const primaryCat = wc.current_category;
      const secondaryCat: ProductCategory = primaryCat === 'Denim Pant' ? 'Shorts' : 'Polo T-Shirt';

      availabilities.push({
        id: `AVL-${availIdCounter++}`,
        workcenter_id: wc.workcenter_id,
        product_category: primaryCat,
        start_date: '2027-01-01',
        end_date: '2027-06-30',
        efficiency_pct: 80,
        is_splitting_active: true,
        allocated_cadre: 25 // 25 operators
      });

      availabilities.push({
        id: `AVL-${availIdCounter++}`,
        workcenter_id: wc.workcenter_id,
        product_category: secondaryCat,
        start_date: '2027-01-01',
        end_date: '2027-06-30',
        efficiency_pct: 75,
        is_splitting_active: true,
        allocated_cadre: 18 // 18 operators (25+18 = 43 standard)
      });
    } else {
      // Single continuous allocation
      availabilities.push({
        id: `AVL-${availIdCounter++}`,
        workcenter_id: wc.workcenter_id,
        product_category: wc.current_category,
        start_date: '2027-01-01',
        end_date: '2027-12-31',
        efficiency_pct: 80,
        is_splitting_active: false,
        allocated_cadre: 43
      });
    }
  });

  // 5. Holiday Master
  const holidayMaster: HolidayMaster = {
    weekly_offs: [5], // Friday weekly off (day 5)
    holidays: [
      { id: 'HOL-01', name: "New Year's Day", date: '2027-01-01', type: 'National' },
      { id: 'HOL-02', name: 'International Mother Language Day', date: '2027-02-21', type: 'National' },
      { id: 'HOL-03', name: 'Independence Day', date: '2027-03-26', type: 'National' },
      { id: 'HOL-04', name: 'Bengali New Year (Pohela Boishakh)', date: '2027-04-14', type: 'Festival' },
      { id: 'HOL-05', name: 'May Day (Labor Day)', date: '2027-05-01', type: 'National' },
      { id: 'HOL-06', name: 'Eid-ul-Fitr Day 1', date: '2027-03-10', type: 'Festival' },
      { id: 'HOL-07', name: 'Eid-ul-Fitr Day 2', date: '2027-03-11', type: 'Festival' },
      { id: 'HOL-08', name: 'Eid-ul-Fitr Day 3', date: '2027-03-12', type: 'Festival' }
    ]
  };

  // 6. Generate 1,200 Sales Orders totaling EXACTLY 5,000,000 pcs across 6 customers
  const salesOrders: SalesOrder[] = [];
  const rawMaterialPOs: RawMaterialPO[] = [];
  const productionRecords: ProductionRecord[] = [];
  const TOTAL_ORDERS = 1200;
  const TARGET_TOTAL_PIECES = 5000000;

  // Generate quantities that sum to exactly 5,000,000
  const orderQuantities: number[] = [];
  let currentSum = 0;

  for (let i = 0; i < TOTAL_ORDERS - 1; i++) {
    const base = 2500 + ((i * 137 + 73) % 45) * 75;
    orderQuantities.push(base);
    currentSum += base;
  }
  const lastQty = TARGET_TOTAL_PIECES - currentSum;
  orderQuantities.push(lastQty);

  const baseStartDate = new Date('2027-01-25T00:00:00');
  let prodRecCounter = 1;

  for (let i = 0; i < TOTAL_ORDERS; i++) {
    const seq = (i + 1).toString().padStart(4, '0');
    const soNo = `SO-2027-${seq}`;
    const custIndex = i % CUSTOMERS.length;
    const customer = CUSTOMERS[custIndex];
    const cat = PRODUCT_CATEGORIES[i % PRODUCT_CATEGORIES.length];
    const styleList = STYLES_BY_CATEGORY[cat];
    const styleObj = styleList[i % styleList.length];
    // In apparel manufacturing, buyers place orders with multi-color assortments (e.g. 5 colors, 3 colors, 2 colors)
    let color: string;
    if (i % 8 === 0) {
      // 5 colors assortment: system generates 5 distinct planning blocks!
      color = [
        COLORS[(i * 2) % COLORS.length],
        COLORS[(i * 2 + 1) % COLORS.length],
        COLORS[(i * 2 + 2) % COLORS.length],
        COLORS[(i * 2 + 3) % COLORS.length],
        COLORS[(i * 2 + 4) % COLORS.length]
      ].join(' / ');
    } else if (i % 5 === 0) {
      // 3 colors assortment
      color = [
        COLORS[(i * 3) % COLORS.length],
        COLORS[(i * 3 + 1) % COLORS.length],
        COLORS[(i * 3 + 2) % COLORS.length]
      ].join(' / ');
    } else if (i % 3 === 0) {
      // 2 colors assortment
      color = [
        COLORS[(i * 4) % COLORS.length],
        COLORS[(i * 4 + 1) % COLORS.length]
      ].join(' / ');
    } else {
      color = COLORS[(i * 3 + custIndex) % COLORS.length];
    }
    const size = ['S', 'M', 'L', 'XL', '30/32', '32/34'][i % 6];
    const qty = orderQuantities[i];
    const rate = Number((9.5 + ((i % 15) * 1.25)).toFixed(2));
    const dest = DESTINATIONS[i % DESTINATIONS.length];

    // Status logic:
    // First 40 orders: Shipped (100% completed)
    // Next 30 orders: Closed (cancelled/archived)
    // Next 150 orders: In_Production (partially produced, balance remaining)
    // Remaining 980 orders: Open (0% produced, 100% balance remaining to plan)
    let order_status: 'Open' | 'In_Production' | 'Shipped' | 'Closed' = 'Open';
    let already_produced_qty = 0;

    if (i < 40) {
      order_status = 'Shipped';
      already_produced_qty = qty;
      // Add production record
      productionRecords.push({
        production_id: `PRD-${prodRecCounter++}`,
        production_date: '2027-01-18',
        sales_order_no: soNo,
        workcenter_id: `WC-${((i % 60) + 1).toString().padStart(2, '0')}`,
        produced_qty: qty,
        shift: 'Standard Day (08:00 - 18:50)',
        operator_count: 43,
        remarks: 'Order completed and cleared for export shipment'
      });
    } else if (i >= 40 && i < 70) {
      order_status = 'Closed';
      already_produced_qty = 0;
    } else if (i >= 70 && i < 220) {
      order_status = 'In_Production';
      const partialRatio = 0.30 + ((i % 5) * 0.10);
      already_produced_qty = Math.round(qty * partialRatio);
      // Create partial daily production records
      const day1 = Math.round(already_produced_qty * 0.6);
      const day2 = already_produced_qty - day1;
      const assignedWc = `WC-${((i % 60) + 1).toString().padStart(2, '0')}`;

      productionRecords.push({
        production_id: `PRD-${prodRecCounter++}`,
        production_date: '2027-01-26',
        sales_order_no: soNo,
        workcenter_id: assignedWc,
        produced_qty: day1,
        shift: 'Standard Day (08:00 - 18:50)',
        operator_count: 43,
        remarks: 'Shift 1 production output'
      });
      productionRecords.push({
        production_id: `PRD-${prodRecCounter++}`,
        production_date: '2027-01-27',
        sales_order_no: soNo,
        workcenter_id: assignedWc,
        produced_qty: day2,
        shift: 'Standard Day (08:00 - 18:50)',
        operator_count: 43,
        remarks: 'Shift 2 production output'
      });
    } else {
      order_status = 'Open';
      already_produced_qty = 0;
    }

    const balance_qty = Math.max(0, qty - already_produced_qty);

    const shipOffsetDays = Math.floor((i / TOTAL_ORDERS) * 165) + (i % 8);
    const shipDateObj = new Date(baseStartDate.getTime() + shipOffsetDays * 86400000);
    const shipDate = shipDateObj.toISOString().split('T')[0];

    salesOrders.push({
      sales_order_no: soNo,
      buyer_po: `PO-${customer.name.slice(0, 3).toUpperCase()}-${(8000 + i)}`,
      style_no: styleObj.style,
      style_desc: styleObj.desc,
      customer_name: customer.name,
      color,
      size,
      product_category: cat,
      order_quantity: qty,
      rate,
      destination: dest,
      smv: styleObj.smv,
      ship_date: shipDate,
      order_status,
      already_produced_qty,
      balance_qty
    });

    // 7. Generate Raw Material PO
    const isMaterialDelayed = (i % 12 === 0);
    const daysBeforeShip = isMaterialDelayed ? (25 - (i % 6)) : (40 + (i % 8));
    const rmDateObj = new Date(shipDateObj.getTime() - daysBeforeShip * 86400000);
    const inhouseDate = rmDateObj.toISOString().split('T')[0];

    rawMaterialPOs.push({
      po_no: `RM-PO-${(10000 + i)}`,
      vendor_name: VENDORS[i % VENDORS.length],
      material_type: cat.includes('Denim') ? 'Denim Fabric' : cat.includes('Polo') ? 'Pique Knit' : 'Cotton Twill / Yarn',
      material_specification: `${cat} Specification - Standard Export Grade Batch #${i + 1}`,
      quantity: Math.round(qty * 1.35),
      uom: cat.includes('Knit') || cat.includes('Polo') ? 'Kgs' : 'Yards',
      rate: Number((3.2 + (i % 5) * 0.45).toFixed(2)),
      inhouse_date: inhouseDate,
      is_inhoused: inhouseDate <= '2027-01-05',
      sales_order_no: soNo,
      style_no: styleObj.style
    });
  }

  return {
    salesOrders,
    rawMaterialPOs,
    productionRecords,
    workcenters,
    priorities,
    availabilities,
    shifts,
    holidayMaster
  };
}
