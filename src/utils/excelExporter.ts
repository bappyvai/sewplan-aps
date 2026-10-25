import * as XLSX from 'xlsx';
import { PlannedBlock, Workcenter } from '../types';

export interface ExportOptions {
  fileName?: string;
  departmentName?: string;
  includeDailyMatrix?: boolean;
  includeLineSummary?: boolean;
  includeDistributionSignoff?: boolean;
  activeFilterSummary?: string;
}

export function exportProductionPlanToExcel(
  blocks: PlannedBlock[],
  workcenters: Workcenter[],
  reportDates: string[],
  options: ExportOptions = {}
) {
  const wb = XLSX.utils.book_new();
  const currentDateStr = new Date().toISOString().split('T')[0];
  const targetDept = options.departmentName || 'All Production Departments';

  // ---------------------------------------------------------
  // SHEET 1: Production Schedule Matrix
  // ---------------------------------------------------------
  if (options.includeDailyMatrix !== false) {
    const matrixRows: (string | number)[][] = [];

    // Header Title Rows
    matrixRows.push(['GARMENT PRODUCTION PLANNING SCHEDULE (APS) - DEPARTMENT CIRCULATION']);
    matrixRows.push([`Target Distribution: ${targetDept}`]);
    matrixRows.push([
      `Generated On: ${currentDateStr}`,
      `Total Scheduled Orders: ${blocks.length}`,
      `Total Planned Volume: ${blocks.reduce((sum, b) => sum + b.planned_qty, 0).toLocaleString()} pcs`,
      `Filters Applied: ${options.activeFilterSummary || 'None (Full View)'}`
    ]);
    matrixRows.push([
      'CIRCULATION ROUTING CHECKLIST: [ ] CUTTING DEPT  [ ] SEWING FLOOR  [ ] QA/QC LAB  [ ] MERCHANDISING  [ ] FABRIC STORE  [ ] IE'
    ]);
    matrixRows.push([]); // blank separator

    // Table Column Headers
    const baseHeaders = [
      'Sales Order No',
      'Buyer PO',
      'Customer',
      'Product Category',
      'Style No',
      'Style Description',
      'Color',
      'Workcenter Line',
      'Planned Qty (Pcs)',
      'SMV (Min)',
      'Total SAH (Min)',
      'Planned Start Date',
      'Planned Start Time',
      'Planned End Date',
      'Planned End Time',
      'Buyer Ship Date',
      'RM Inhouse Date',
      'Lead Margin (Days)',
      'Schedule Status',
      'Delay Reason / Notes'
    ];

    // Append dynamic date headers
    const fullHeaders = [...baseHeaders, ...reportDates.map((d) => `Daily Out: ${d.slice(5)}`)];
    matrixRows.push(fullHeaders);

    // Data Rows
    let totalPcs = 0;
    let totalSahMin = 0;

    blocks.forEach((b) => {
      totalPcs += b.planned_qty;
      const sah = Math.round(b.planned_qty * b.smv);
      totalSahMin += sah;

      // Calculate days margin between planned end date and ship date
      const endD = new Date(b.end_date + 'T00:00:00').getTime();
      const shipD = new Date(b.ship_date + 'T00:00:00').getTime();
      const marginDays = Math.round((shipD - endD) / 86400000);

      const statusLabel =
        b.status === 'material_delay'
          ? 'RM Delayed'
          : b.status === 'ship_date_risk'
          ? 'Ship Date Risk'
          : 'On-Time';

      const row: (string | number)[] = [
        b.sales_order_no,
        b.buyer_po,
        b.customer_name,
        b.product_category,
        b.style_no,
        b.style_desc,
        b.color,
        b.workcenter_id,
        b.planned_qty,
        b.smv,
        sah,
        b.start_date,
        b.start_time || '08:00',
        b.end_date,
        b.end_time || '18:50',
        b.ship_date,
        b.rm_inhouse_date || '-',
        marginDays,
        statusLabel,
        b.status_reason || 'Normal allocation'
      ];

      // Add day-by-day allocation output
      reportDates.forEach((dStr) => {
        const qty = b.daily_allocations?.[dStr] || 0;
        row.push(qty > 0 ? qty : 0);
      });

      matrixRows.push(row);
    });

    // Grand Total Row
    const grandTotalRow: (string | number)[] = [
      'GRAND TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      `${blocks.length} Orders`,
      totalPcs,
      '',
      totalSahMin,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ];
    // Fill 0s or sums for daily dates in total row
    reportDates.forEach((dStr) => {
      const daySum = blocks.reduce((sum, b) => sum + (b.daily_allocations?.[dStr] || 0), 0);
      grandTotalRow.push(daySum);
    });
    matrixRows.push([]);
    matrixRows.push(grandTotalRow);

    const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows);

    // Set Column Widths for professional readability
    const colWidths = [
      { wch: 15 }, // Sales Order No
      { wch: 16 }, // Buyer PO
      { wch: 14 }, // Customer
      { wch: 15 }, // Category
      { wch: 12 }, // Style No
      { wch: 28 }, // Style Desc
      { wch: 14 }, // Color
      { wch: 15 }, // Workcenter Line
      { wch: 16 }, // Planned Qty
      { wch: 11 }, // SMV
      { wch: 15 }, // Total SAH
      { wch: 14 }, // Start Date
      { wch: 14 }, // End Date
      { wch: 14 }, // Ship Date
      { wch: 15 }, // RM Inhouse Date
      { wch: 16 }, // Lead Margin
      { wch: 16 }, // Schedule Status
      { wch: 35 }  // Delay Reason
    ];
    reportDates.forEach(() => colWidths.push({ wch: 14 }));
    wsMatrix['!cols'] = colWidths;

    // Merge title cells
    wsMatrix['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } }
    ];

    XLSX.utils.book_append_sheet(wb, wsMatrix, 'Production Matrix');
  }

  // ---------------------------------------------------------
  // SHEET 2: Workcenter Line Summary
  // ---------------------------------------------------------
  if (options.includeLineSummary !== false) {
    const summaryRows: (string | number)[][] = [];

    summaryRows.push(['WORKCENTER & SEWING LINE CAPACITY UTILIZATION SUMMARY']);
    summaryRows.push([`Factory Status as of: ${currentDateStr} | Total Lines Monitored: ${workcenters.length}`]);
    summaryRows.push([]); // blank separator

    summaryRows.push([
      'Line ID',
      'Workcenter Name',
      'Building / Unit',
      'Assigned Category',
      'Standard Cadre (Ops)',
      'Shift Working Hours',
      'Target Efficiency %',
      'Daily SAH Capacity (Min)',
      'Total Orders Scheduled',
      'Total Planned Pcs',
      'First Planned Start',
      'Final Planned End',
      'On-Time Compliance %'
    ]);

    let totalLinePcs = 0;
    let totalLineOrders = 0;
    let totalLineSahMin = 0;

    workcenters.forEach((wc) => {
      const lineBlocks = blocks.filter((b) => b.workcenter_id === wc.workcenter_id);
      const linePcs = lineBlocks.reduce((sum, b) => sum + b.planned_qty, 0);
      const delayedCount = lineBlocks.filter((b) => b.status !== 'on_time').length;
      const onTimeRate = lineBlocks.length > 0
        ? Math.round(((lineBlocks.length - delayedCount) / lineBlocks.length) * 100)
        : 100;

      const dailyMinutes = Math.round(wc.standard_cadre * 9.83 * 60 * 0.80);
      const firstStart = lineBlocks.length > 0 ? lineBlocks[0].start_date : '-';
      const lastEnd = lineBlocks.length > 0 ? lineBlocks[lineBlocks.length - 1].end_date : '-';

      totalLinePcs += linePcs;
      totalLineOrders += lineBlocks.length;
      totalLineSahMin += dailyMinutes;

      summaryRows.push([
        wc.workcenter_id,
        wc.name,
        wc.floor,
        wc.current_category,
        wc.standard_cadre,
        9.83,
        80,
        dailyMinutes,
        lineBlocks.length,
        linePcs,
        firstStart,
        lastEnd,
        `${onTimeRate}%`
      ]);
    });

    summaryRows.push([]);
    summaryRows.push([
      'TOTAL FACTORY',
      `${workcenters.length} Lines`,
      '',
      '',
      '',
      '',
      '',
      totalLineSahMin,
      totalLineOrders,
      totalLinePcs,
      '',
      '',
      ''
    ]);

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary['!cols'] = [
      { wch: 10 }, // Line ID
      { wch: 16 }, // Name
      { wch: 22 }, // Building
      { wch: 16 }, // Category
      { wch: 18 }, // Cadre
      { wch: 16 }, // Shift hours
      { wch: 16 }, // Efficiency
      { wch: 20 }, // Daily SAH
      { wch: 18 }, // Total orders
      { wch: 18 }, // Total pcs
      { wch: 16 }, // Start
      { wch: 16 }, // End
      { wch: 18 }  // On-time
    ];

    wsSummary['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
    ];

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Line Capacity Summary');
  }

  // ---------------------------------------------------------
  // SHEET 3: Department Distribution & Sign-Off Routing
  // ---------------------------------------------------------
  if (options.includeDistributionSignoff !== false) {
    const deptRows: (string | number)[][] = [
      ['PRODUCTION DEPARTMENT DISTRIBUTION & OPERATIONAL HANDOVER'],
      [`Circulation Document Reference: APS-PLAN-${currentDateStr.replace(/-/g, '')}-REV1`],
      [],
      ['DEPARTMENT OPERATIONAL MANDATES & LEAD TIME PROTOCOLS:'],
      ['1. CUTTING DEPARTMENT:', 'Issue fabric lots 3 days prior to planned sewing line load date. Verify shrinkage and shade segregation.'],
      ['2. SEWING PRODUCTION:', 'Adhere strictly to line standard cadre (43 operators) and allocated split lines. Record hourly output against SAH target.'],
      ['3. QUALITY ASSURANCE:', 'Conduct inline QC and 100% pilot check minimum 2 working days before style transition.'],
      ['4. RAW MATERIAL / STORE:', 'Cross-check vendor RM inhouse delivery dates against planned start dates. Flag any delayed shipment immediately.'],
      ['5. INDUSTRIAL ENGINEERING:', 'Set line balancing, workstation SMV benchmarks, and method study for new styles.'],
      ['6. MERCHANDISING:', 'Maintain customer ship-date buffer of >= 5 working days for finishing, inspection, and port clearance.'],
      [],
      ['DEPARTMENTAL ACKNOWLEDGMENT & SIGN-OFF TABLE:'],
      ['Department', 'Designated Head / In-Charge', 'Action / Acceptance Status', 'Date Received', 'Sign-Off Signature', 'Department Notes / Blockers'],
      ['Cutting Department', 'Head of Cutting', 'Acknowledged', '', '', 'Fabric relaxation verified'],
      ['Sewing Unit A (Denim)', 'Floor Manager A', 'Acknowledged', '', '', 'Lines 01 to 20 ready'],
      ['Sewing Unit B (Knit/Polo)', 'Floor Manager B', 'Acknowledged', '', '', 'Lines 21 to 40 ready'],
      ['Sewing Unit C (Shorts/Jogger)', 'Floor Manager C', 'Acknowledged', '', '', 'Lines 41 to 60 ready'],
      ['Quality Assurance (QA)', 'QA Manager', 'Acknowledged', '', '', 'Inline audit roster aligned'],
      ['Raw Material Stores', 'Store Manager', 'Acknowledged', '', '', 'Yarn & trims inventory synced'],
      ['Industrial Engineering (IE)', 'Chief IE Officer', 'Acknowledged', '', '', 'Standard Minute Values verified'],
      ['Central Merchandising', 'VP Merchandising', 'Approved for Floor', '', '', 'Buyer export windows locked']
    ];

    const wsDept = XLSX.utils.aoa_to_sheet(deptRows);
    wsDept['!cols'] = [
      { wch: 25 }, // Department
      { wch: 22 }, // Head
      { wch: 22 }, // Acceptance
      { wch: 16 }, // Date
      { wch: 22 }, // Signature
      { wch: 35 }  // Notes
    ];

    wsDept['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }
    ];

    XLSX.utils.book_append_sheet(wb, wsDept, 'Dept Sign-off Routing');
  }

  // Trigger Excel file download
  const downloadFileName = options.fileName || `SewPlan_Production_Schedule_${currentDateStr}.xlsx`;
  XLSX.writeFile(wb, downloadFileName);
}

// ---------------------------------------------------------
// Export Plan Explanation Report to Excel (.xlsx)
// ---------------------------------------------------------
export function exportPlanExplanationToExcel(
  blocks: PlannedBlock[],
  workcenters: Workcenter[],
  fileName?: string
) {
  const wb = XLSX.utils.book_new();
  const currentDateStr = new Date().toISOString().split('T')[0];

  const rows: (string | number)[][] = [];

  // Title rows
  rows.push(['SEWPLAN APS - PLAN EXPLANATION REPORT']);
  rows.push([`Generated On: ${currentDateStr}`, `Total Blocks: ${blocks.length}`, `Total Volume: ${blocks.reduce((s, b) => s + b.planned_qty, 0).toLocaleString()} pcs`]);
  rows.push(['Industrial Engineering & Production Planning Decision Traceability Audit']);
  rows.push([]);

  // Table headers
  rows.push([
    'Line No',
    'Sales Order',
    'Buyer PO',
    'Customer',
    'Style No',
    'Style Description',
    'Color',
    'SMV (Min)',
    'Qty (Pcs)',
    'Plan Start Date',
    'Plan End Date',
    'Reason of Plan'
  ]);

  blocks.forEach((b) => {
    const wc = workcenters.find((w) => w.workcenter_id === b.workcenter_id);
    const lineLabel = wc ? `${wc.name} (${wc.workcenter_id})` : b.workcenter_id;
    const startStr = `${b.start_date} ${b.start_time || '08:00'}`;
    const endStr = `${b.end_date} ${b.end_time || '18:50'}`;
    const reason = b.plan_reason || (b.is_manually_updated ? 'Manual update' : (b.is_ai_planned ? 'Planned AI based based on Historical data' : 'Standard Engine Plan'));

    rows.push([
      lineLabel,
      b.sales_order_no,
      b.buyer_po || 'N/A',
      b.customer_name,
      b.style_no,
      b.style_desc || '',
      b.color,
      b.smv,
      b.planned_qty,
      startStr,
      endStr,
      reason
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 18 }, // Line No
    { wch: 15 }, // Sales Order
    { wch: 15 }, // Buyer PO
    { wch: 16 }, // Customer
    { wch: 14 }, // Style No
    { wch: 22 }, // Style Desc
    { wch: 16 }, // Color
    { wch: 10 }, // SMV
    { wch: 12 }, // Qty
    { wch: 18 }, // Plan Start Date
    { wch: 18 }, // Plan End Date
    { wch: 60 }  // Reason of Plan
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Plan Explanation Report');

  const name = fileName || `SewPlan_Plan_Explanation_Report_${currentDateStr}.xlsx`;
  XLSX.writeFile(wb, name);
}
