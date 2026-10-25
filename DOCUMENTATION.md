# SewPlan APS: Enterprise Garment Production Planning & Advanced Scheduling System
## Comprehensive Business & Technical Architecture Specification
**Document Version:** 3.0.0  
**Target Domain:** Apparel & Garment Manufacturing / High-Volume Export Sewing Floors  
**Target Audience:** CTOs, Factory General Managers, Industrial Engineers (IE), Planning Heads, Software Architects, Full-Stack Engineers  

---

## Table of Contents
1. [Executive Summary & System Objectives](#1-executive-summary--system-objectives)
2. [Business Logics, Algorithms & Mathematical Models](#2-business-logics-algorithms--mathematical-models)
   - 2.1 [Order Status Lifecycle & Progression Matrix](#21-order-status-lifecycle--progression-matrix)
   - 2.2 [Floor Production Deduction & Net Balance Formulation](#22-floor-production-deduction--net-balance-formulation)
   - 2.3 [SMV (Standard Minute Value) & Daily Line Capacity Model](#23-smv-standard-minute-value--daily-line-capacity-model)
   - 2.4 [Multi-Tier Workcenter Priority & Load-Balancing Algorithm](#24-multi-tier-workcenter-priority--load-balancing-algorithm)
   - 2.5 [Working Calendar, Shifts, and Non-Working Day Engine](#25-working-calendar-shifts-and-non-working-day-engine)
   - 2.6 [Line Splitting & Co-Allocation Architecture](#26-line-splitting--co-allocation-architecture)
   - 2.7 [Constraint Violations & Risk Classification System](#27-constraint-violations--risk-classification-system)
   - 2.8 [Two-Pass Plan Synchronization Logic](#28-two-pass-plan-synchronization-logic)
3. [Screen-by-Screen Functional Specifications](#3-screen-by-screen-functional-specifications)
   - 3.1 [Planning Board (Interactive Gantt Schedule)](#31-planning-board-interactive-gantt-schedule)
   - 3.2 [Production Table Screen (Shop-Floor Actuals)](#32-production-table-screen-shop-floor-actuals)
   - 3.3 [Workcenter Priority Configuration Screen](#33-workcenter-priority-configuration-screen)
   - 3.4 [Availability & Splitting Screen](#34-availability--splitting-screen)
   - 3.5 [Shift Master Screen](#35-shift-master-screen)
   - 3.6 [Holiday Master Screen](#36-holiday-master-screen)
   - 3.7 [Source Data Master Screen (Sales Orders & RM POs)](#37-source-data-master-screen-sales-orders--rm-pos)
   - 3.8 [Planning Report Screen & Excel Export Engine](#38-planning-report-screen--excel-export-engine)
   - 3.9 [Run Plan Simulation Modal](#39-run-plan-simulation-modal)
   - 3.10 [Split Block Modal & Reschedule Modal](#310-split-block-modal--reschedule-modal)
4. [Database Schemas, Data Dictionary & Connectivity](#4-database-schemas-data-dictionary--connectivity)
   - 4.1 [Entity Relationship Diagram (ERD)](#41-entity-relationship-diagram-erd)
   - 4.2 [Relational Database Tables & DDL](#42-relational-database-tables--ddl)
   - 4.3 [Local Storage & State Synchronization Protocol](#43-local-storage--state-synchronization-protocol)
   - 4.4 [Database Connectivity & ORM Layer](#44-database-connectivity--orm-layer)
5. [Frontend Architecture & Technical Implementation](#5-frontend-architecture--technical-implementation)
   - 5.1 [Component Tree & Directory Structure](#51-component-tree--directory-structure)
   - 5.2 [Reactive State Management & Context API](#52-reactive-state-management--context-api)
   - 5.3 [Gantt Virtualization & Responsive Viewport Design](#53-gantt-virtualization--responsive-viewport-design)
   - 5.4 [High-Performance Computational Caching](#54-high-performance-computational-caching)
6. [Backend Architecture, APIs & ERP/MES Integrations](#6-backend-architecture-apis--erpmes-integrations)
   - 6.1 [Service Topology](#61-service-topology)
   - 6.2 [RESTful API Specifications](#62-restful-api-specifications)
   - 6.3 [ERP & Shop-Floor MES Webhook Protocols](#63-erp--shop-floor-mes-webhook-protocols)
7. [Deployment, Security & Operational Guidelines](#7-deployment-security--operational-guidelines)
8. [AI Plan: Empirical Garment Industry Algorithm Architecture & End-User Portal](#8-ai-plan-empirical-garment-industry-algorithm-architecture--end-user-portal)
   - 8.1 [Business Rationale: Bypassing Static Priority & Availability Tables](#81-business-rationale-bypassing-static-priority--availability-tables)
   - 8.2 [Empirical Closed Sales Order Analytics & Efficiency Formulation](#82-empirical-closed-sales-order-analytics--efficiency-formulation)
   - 8.3 [Automated Garment Lead-Time Calculation Model (Ship - 32 Days & Ship - 5 Days)](#83-automated-garment-lead-time-calculation-model-ship---32-days--ship---5-days)
   - 8.4 [Two-Stage Temporary Sandbox & Actual Plan Promotion Workflow](#84-two-stage-temporary-sandbox--actual-plan-promotion-workflow)
   - 8.5 [End-User Portal (View-Only Mode) Security & UX Architecture](#85-end-user-portal-view-only-mode-security--ux-architecture)

---

## 1. Executive Summary & System Objectives

**SewPlan APS** is a high-performance Advanced Planning and Scheduling (APS) web platform engineered specifically for the garment and apparel export manufacturing industry. Modern apparel factories operate under severe margin pressures, fast turnaround times, complex multi-buyer purchase orders, fluctuating raw material in-house dates, and volatile operator efficiencies across dozens of sewing lines.

### Core Business Objectives:
1. **Dynamic Capacity Optimization**: Maximize sewing line utilization across 60 specialized production lines (spanning Buildings A, B, and C) while respecting garment Standard Minute Values (SMV), operator cadres, line efficiencies, and shift masters.
2. **Floor Actuals Reconciliation**: Dynamically subtract pieces already stitched and logged on the sewing floor from original purchase order quantities, recalculating net balances so factory lines are never over-allocated or under-allocated.
3. **Supply Chain Synchronization**: Synchronize schedule starts with Raw Material Purchase Order (PO) in-house dates. When fabric or trim arrivals are delayed, the system immediately flags material risks or automatically shifts dependent production blocks.
4. **Interactive Simulation (What-If Analysis)**: Provide a sandbox planning mode (`tempPlan`) where planners can drag, drop, split, and simulate alternative production runs with immediate KPI recalculation before committing changes to the factory floor.
5. **Standardized Industrial Reporting**: Generate C-suite and floor-ready planning spreadsheets in formatted Microsoft Excel (`.xlsx`) format with KPI headers, status visual tags, and daily production distributions.

---

## 2. Business Logics, Algorithms & Mathematical Models

### 2.1 Order Status Lifecycle & Progression Matrix

Every Sales Order in the system is governed by a strict four-stage state machine:

```
[Open] ───────────────► [In_Production] ───────────────► [Shipped]
  │                            │
  └────────────────────────────┴───────────────────────► [Closed]
```

| Order Status | Business Definition | Planning Board Inclusion | Plan Run & Synchronization Logic |
| :--- | :--- | :--- | :--- |
| **`Open`** | Confirmed buyer order with 0% sewing completion. Entire quantity remains to be planned. | **Included** | Planned for full balance ($Q_{balance} = Q_{order}$). Assigned to optimal line. |
| **`In_Production`** | Partially completed on sewing lines ($0 < Q_{produced} < Q_{order}$). Floor output actively logging. | **Included** | Net balance planned ($Q_{balance} = Q_{order} - Q_{produced}$). Current line maintained or synchronized. |
| **`Shipped`** | Completed 100% of order volume ($Q_{produced} \ge Q_{order}$) and cleared for export dispatch. | **Excluded** | Pruned from planning board. Line capacity instantly liberated for upcoming orders. |
| **`Closed`** | Cancelled by buyer, archived, or short-closed by merchant team. | **Excluded** | Pruned from planning board. Zero minutes allocated. |

*Crucial System Rule:* The automated planning engine, synchronization engine, and Run Plan KPI modal filter orders using:
$$\text{Eligible Orders} = \{ O \in \text{SalesOrders} \mid O.\text{status} \in \{\text{'Open'}, \text{'In\_Production'}\} \land (O.Q_{\text{order}} - O.Q_{\text{produced}}) > 0 \}$$

---

### 2.2 Floor Production Deduction & Net Balance Formulation

When the sewing floor logs completed garments in the Production Table, the system executes an automated two-way reconciliation:

1. **Floor Production Aggregation**:
   For any sales order $S$, the total produced pieces $P(S)$ across all dates, shifts, and workcenters is:
   $$P(S) = \sum_{r \in \text{ProductionRecords}, r.\text{so\_no} = S} r.\text{produced\_qty}$$

2. **Net Balance Calculation**:
   The remaining quantity to be scheduled on the Gantt planning board is:
   $$B(S) = \max\Big(0, \, S.\text{order\_quantity} - P(S)\Big)$$

3. **Status Transition Rule**:
   - If $P(S) == 0 \implies \text{Status} = \text{'Open'}$
   - If $0 < P(S) < S.\text{order\_quantity} \implies \text{Status} = \text{'In\_Production'}$
   - If $P(S) \ge S.\text{order\_quantity} \implies \text{Status} = \text{'Shipped'}$

---

### 2.3 SMV (Standard Minute Value) & Daily Line Capacity Model

Line scheduling is governed by rigorous industrial engineering formulas:

#### A. Produce Minutes Formula (Requirement 7)
The total time needed for producing a Sales Order on the sewing floor is directly determined by the order quantity and Standard Minute Value (SMV):
$$\text{Produce Minutes} = \text{Order Qty} \times \text{SMV}$$
For an order being planned with balance quantity after deducting already produced pieces:
$$\text{Produce Minutes Needed} = \text{Balance Qty} \times \text{SMV}$$

#### B. Line Per Day Available Minutes / Capacity Formula (Requirement 6)
Line per day available minutes or capacity is calculated using parameters taken strictly from the respective master tables:
$$\text{Line Available Minutes} = \text{Number of Carder} \times (\text{Shift Hours after reduce break time}) \times 60 \times \text{Efficiency \%}$$
Where:
- **Number of Carder / Operators**: Taken from **Workcenter Shift Master Table** (`shift.cadre`, falling back to Workcenter standard cadre).
- **Shift Hours after reduce break time**: Taken from **Workcenter Shift Master Table** (`shift.working_hours`, or total shift duration minus break minutes $/ 60$).
- **Efficiency %**: Taken from **Workcenter Availability Table** (`avail.efficiency_pct / 100`) for the matching workcenter, category, and date range.

*Example calculation for Line 01 (Denim Pant, Carder: 43, Net Working Hours: 9.83, Efficiency: 80%):*
$$\text{Daily Capacity} = 43 \times 9.83 \times 60 \times 0.80 = 20,288.98 \approx 20,289 \text{ productive minutes/day}$$

#### C. Production Start Date (PSD) Formulation (Requirement 5)
1. **Default Sewing Start Date**:
   $$\text{Default PSD} = \text{Ship Date} - 38 \text{ calendar days}$$
2. **Purchase Order (RM) In-House Constraint**:
   If any purchase order is linked to the sales order that is **not yet in-housed** (i.e. delivery pending from yarn/fabric mill):
   $$\text{PSD} = \max\Big(\text{Default PSD}, \, \text{Purchase Order Delivery Date} + 3 \text{ calendar days}\Big)$$
   The resulting date is advanced to the next working day if it falls on a weekly off (Friday) or holiday.

#### D. Multi-Line Priority Mapping & Auto-Balance Splitting (Requirement 8)
When scheduling an eligible sales order:
1. Candidate lines are identified based on mappings in the **Workcenter Priority Table** (exact style, customer affinity, or product category).
2. If Line 1 cannot finish the full quantity within the `Ship Date`:
   - If multiple lines are mapped in Workcenter Priority: the order automatically splits so that the balance quantity plans in another mapped line (co-allocating to beat the ship date).
   - If only 1 line is mapped in Workcenter Priority or alternative lines cannot be utilized: it plans on the same line and displays in **Late Color** (`ship_date_risk`, colored in red/rose).

---

### 2.4 Multi-Tier Workcenter Priority & Load-Balancing Algorithm

The factory operates 60 specialized lines divided across three buildings:
- **Building A (Lines 01–20)**: Heavy bottoms (Denim Pant, Cargo Pants)
- **Building B (Lines 21–40)**: Tops & Outerwear (Polo T-Shirt, Hoodie)
- **Building C (Lines 41–60)**: Casual & Knits (Shorts, Joggers)

When placing orders, the planning engine uses a multi-tier scoring function combined with an earliest-availability load balancer:

#### 1. Priority Rank Evaluation ($\text{pScore}$)
- **Tier 1 (Exact Style Match)**: Rank 1 ($pScore = 1$). A specific line is dedicated to a high-volume style (e.g., Line 01 dedicated to Levi's `DNM-501`).
- **Tier 2 (Customer Affinity)**: Rank 2 ($pScore = 10 + \text{rank}$). A line preferred for a specific brand (e.g., Zara or Nike).
- **Tier 3 (Category Capability)**: Rank 3 ($pScore = 100 + \text{rank}$). Line equipped for the garment category (e.g. Denim line running generic denim).
- **Tier 4 (Incompatible)**: ($pScore = 999$). Line lacks specialized machines (e.g. trying to run Denim on a Polo line).

#### 2. Earliest Availability Load-Balancing Matrix
To prevent orders from queueing up sequentially on Line 01 while Lines 02–20 sit idle, the engine balances load across all equivalent lines:
$$\text{Total Score}(W) = (\text{pScore} \times 1000) + \text{DateIndex}(\text{LineNextAvailableDate}(W))$$

- The line with the lowest $\text{Total Score}$ is selected.
- All 10 lines capable of a category are loaded in parallel, ensuring all 60 lines operate continuously without idle gaps.

---

### 2.5 Working Calendar, Shifts, and Non-Working Day Engine

Factory production cannot occur on non-working days. The system incorporates an $O(1)$ pre-computed calendar engine (`WorkingCalendar`):

1. **Weekly Offs**: Configurable day indices (e.g., Friday = 5 in Bangladesh/Middle East apparel hubs; Sunday = 0 for Western hubs).
2. **Holidays**: National, Festival, and Company holidays (e.g., Eid-ul-Fitr, Independence Day, May Day).
3. **Working Day Advancement**:
   Given a target start date $D_{start}$ and $N$ required working days:
   - The engine iterates through the pre-computed working date array, advancing only on working dates.
   - Outputs: $D_{end}$ (completion date) and `workingDatesList` (exact working dates for daily piece allocation).

---

### 2.6 Line Splitting & Co-Allocation Architecture

Certain lines (`is_split_enabled = true`) possess physical layout flexibility to run two distinct garment categories simultaneously by partitioning operator cadre:
- **Total Standard Cadre**: 43 operators
- **Partition A**: 25 operators assigned to `Denim Pant` (e.g., 75% efficiency)
- **Partition B**: 18 operators assigned to `Shorts` (e.g., 70% efficiency)
- When a planner triggers "Split Block" in the UI, the system generates a child block linked via `parent_block_id`, distributing pieces and calculating end dates independently for both workcenters.

---

### 2.7 Constraint Violations & Risk Classification System

Every scheduled block on the Gantt board is continuously evaluated against two boundary constraints:

```
[RM In-House Date] ───► [Planned Start Date] ───► [Planned End Date] ───► [Ship Date Cut-off]
       │                                                                         │
       ▼                                                                         ▼
If In-House > Start:                                                    If End > Cut-off:
[MATERIAL DELAY RISK]                                                   [SHIP DATE RISK]
```

1. **`material_delay` (Amber Flag)**:
   $$\text{RM In-House Date} > \text{Planned Start Date}$$
   *Business Impact:* Sewing cannot commence because fabric or trims are still in transit or customs.
2. **`ship_date_risk` (Red Flag)**:
   $$\text{Planned End Date} > (\text{Ship Date} - 5 \text{ days})$$
   *Business Impact:* Completion breaches the 5-day finishing, packaging, inspection, and port delivery buffer.
3. **`on_time` (Green Badge)**:
   Both constraints satisfied.

---

### 2.8 Two-Pass Plan Synchronization Logic

When planners click **"Synchronize Plan"**, the engine executes a non-destructive alignment:

```
Step 1: Ingest Floor Actuals & Prune
  ├── Query total produced pieces per Sales Order
  ├── If Order Status == 'Shipped' or 'Closed' ──► Remove block from board
  └── Update Planned Qty = Order Qty - Total Produced

Step 2: Re-Anchor RM In-House Dates
  └── If vendor updated fabric delivery date ──► Update block.rm_inhouse_date

Step 3: Ingest New Orders
  └── If new Open orders were entered in Source Data ──► Schedule and append

Step 4: Line Compaction (synchronizeLineBlocks)
  └── For each Workcenter (WC-01 to WC-60):
        ├── Sort blocks chronologically
        ├── Slide blocks forward to eliminate gaps while preventing overlaps
        └── Recalculate End Dates, Daily Piece Allocations, and Risk Flags
```

---

## 3. Screen-by-Screen Functional Specifications

### 3.1 Planning Board (Interactive Gantt Schedule)
- **Header KPI Banner**: Displays real-time metrics:
  - Total Planned Blocks, Total Scheduled Pieces, On-Time %, Material Delay Risks, Ship Date Risks, Average Line Utilization.
- **Building Filter Tabs**:
  - `All Buildings`, `Building A (Lines 01–20)`, `Building B (Lines 21–40)`, `Building C (Lines 41–60)`.
- **Timeline Navigation**:
  - Month Jump Quick Selectors: `Jan`, `Feb`, `Mar`, `Apr`, `May`.
  - Step navigation: `Previous 2 Weeks`, `Next 2 Weeks`.
  - Zoom modes: `Day View` (56px/day), `Standard View` (38px/day), `Compact Overview` (26px/day).
- **Gantt Grid**:
  - Y-Axis: Fixed left column showing Workcenter ID, Line Name, Building Floor, and Current Garment Category.
  - X-Axis: Horizontal date strip with weekend/holiday shading and today marker.
  - Interactive Blocks: Color-coded by buyer customer (Zara, H&M, Levi Strauss, Nike, Uniqlo, Gap), with icons for status risks, piece count, style number, and drag handles.
  - Drag-and-Drop: Live repositioning of blocks between dates and compatible workcenters.
  - Action Modals: Clicking any block opens options to **Split Block**, **Reschedule Block**, or inspect order details.

---

### 3.2 Production Table Screen (Shop-Floor Actuals)
- **Purpose**: Direct data-entry interface for sewing floor supervisors to log daily shift output.
- **Summary Metrics**:
  - Total Floor Output Pieces, Active Orders Tracked, Completed Orders, Overall Floor Completion %.
- **Progress Tracking Table**:
  - Grouped view by Sales Order showing: Buyer PO, Customer, Category, Style, Order Qty, Total Produced Qty, Progress Bar (%), Balance Qty, and Order Status.
- **Daily Floor Log Table**:
  - Date, Production Log ID, Sales Order No, Workcenter Line, Produced Pieces, Shift, Operator Headcount, Supervisor Remarks.
- **"Log Floor Output" Modal Form**:
  - Fields: Date, Sales Order Selector (with live remaining balance preview), Workcenter Line, Produced Pieces, Shift, Operator Count, Remarks.
  - *Automated Effect:* Submitting a record immediately updates total produced qty, adjusts order balance, and propagates to the planning board.

---

### 3.3 Workcenter Priority Configuration Screen
- **Purpose**: Configure machine and line specialization preferences.
- **Controls**: Add Priority Rule, Filter by Line, Customer, or Category.
- **Priority Matrix Table**:
  - Workcenter ID, Line Name, Garment Category, Customer Name (optional), Style No (optional), Priority Rank (1 = Highest).
  - Inline Edit & Delete actions.

---

### 3.4 Availability & Splitting Screen
- **Purpose**: Control line efficiencies and configure dual-line splitting.
- **Controls**:
  - Efficiency percentage slider/input (50% to 100%).
  - Split Line Toggle (`is_splitting_active`).
  - Cadre Allocation (e.g., dividing 43 standard operators into 25 and 18).
  - Effective Date Horizon (`start_date` to `end_date`).

---

### 3.5 Shift Master Screen
- **Purpose**: Define shift timings and working hours per workcenter.
- **Fields**: Shift Start Time (e.g., `08:00`), Shift End Time (e.g., `18:50`), Break Duration (e.g., `60 min`), Net Working Hours (`9.83 hrs`).
- **Effect**: Directly alters the denominator of the daily capacity formula.

---

### 3.6 Holiday Master Screen
- **Weekly Offs Selector**: Multi-select pills for days of the week (Default: Friday enabled).
- **Holidays Table**:
  - Holiday ID, Holiday Name, Date, Type (`National`, `Festival`, `Company`).
- **Add Holiday Modal**: Instant addition with immediate reactive recalculation of all Gantt block end dates across the platform.

---

### 3.7 Source Data Master Screen (Sales Orders & RM POs)
- **Top KPI Cards**: Total Orders, Total Pieces (5,000,000 pcs), Total Contract Revenue ($), Total RM POs.
- **Dual Tab Architecture**:
  1. **Sales Orders Tab**:
     - Columns: Sales Order No, Buyer PO, Customer, Style No & Desc, Category, Order Qty, Rate ($), Destination, SMV, Ship Date, Status Selector (`Open`, `In_Production`, `Shipped`, `Closed`).
     - Live Status Dropdown: Planners can change status directly from the table row. Changing to `Shipped` or `Closed` immediately purges the block from the planning board.
     - Pagination: 25, 50, 100 items per page with search by Order No, Style, Customer, or PO.
  2. **Raw Material PO Tab**:
     - Columns: PO Number, Linked Sales Order, Vendor Name, Material Type, Specification, Quantity, UOM, In-House Date.
     - Live edit of In-House Date triggers material risk evaluations.

---

### 3.8 Planning Report Screen & Excel Export Engine
- **Purpose**: Operational dashboard for management reviews and distribution to sewing floor managers.
- **Filters**: Line, Customer, Status, Date Range.
- **Tabular Report**:
  - Workcenter Line, Order No, Style, Buyer, Category, Order Qty, Produced Qty, Planned Balance, Planned Start, Planned End, Working Days, Ship Date, RM In-House Date, Schedule Health Status.
- **Excel Export Engine (`excelExporter.ts`)**:
  - Generates binary `.xlsx` file using `xlsx` library.
  - Formatted header block with metadata (Factory Name, Generation Timestamp, Total Pieces, Risk Counts).
  - Color-coded status column (`ON TIME`, `MATERIAL DELAY`, `SHIP DATE RISK`).

---

### 3.9 Run Plan Simulation Modal
- **Purpose**: High-level execution modal for triggering automated line scheduling.
- **Dynamic Pre-Flight Inspection**:
  - Displays dynamic metrics derived from active database:
    - **Open Orders Count**: Count of active `Open` and `In_Production` orders.
    - **Gross Order Volume**: Sum of order quantities.
    - **Already Produced Volume**: Sum of floor pieces completed.
    - **Net Balance to Plan**: Exact volume that will be distributed across the lines.
- **Execution Workflow**:
  - Clicking **"Run Automated Simulation Plan"** executes `generateProductionPlan()`.
  - Puts system into Simulation Mode (`planMode = 'temp'`).
  - Top alert banner appears: Planners can inspect, test moves, and either **Confirm Plan** (commits to active) or **Discard** (reverts).

---

### 3.10 Split Block Modal & Reschedule Modal
- **Split Block Modal**: Allows taking an oversized order (e.g. 10,000 pcs) on Line 01 and splitting 4,000 pcs onto Line 02. Calculates new completion dates for both portions.
- **Reschedule Modal**: Date picker and line selector to manually override automated assignments.

---

## 4. Database Schemas, Data Dictionary & Connectivity

### 4.1 Entity Relationship Diagram (ERD)

```
┌─────────────────────────┐              ┌──────────────────────────┐
│      sales_orders       │1            *│    production_records    │
├─────────────────────────┤──────────────├──────────────────────────┤
│ PK  sales_order_no      │              │ PK  production_id        │
│     buyer_po            │              │ FK  sales_order_no       │
│     customer_name       │              │ FK  workcenter_id        │
│     style_no            │              │     production_date      │
│     product_category    │              │     produced_qty         │
│     order_quantity      │              │     shift                │
│     rate, destination   │              │     operator_count       │
│     smv, ship_date      │              └──────────────────────────┘
│     order_status        │
└────────────┬────────────┘
             │ 1
             │
             │ *
┌────────────┴────────────┐              ┌──────────────────────────┐
│    raw_material_pos     │              │       workcenters        │
├─────────────────────────┤              ├──────────────────────────┤
│ PK  po_no               │              │ PK  workcenter_id        │
│ FK  sales_order_no      │              │     name, floor          │
│     vendor_name         │              │     standard_cadre       │
│     material_type       │              │     current_category     │
│     quantity, uom       │              │     is_split_enabled     │
│     inhouse_date        │              └────────────┬─────────────┘
└─────────────────────────┘                           │ 1
                                                      │
             ┌────────────────────────────────────────┼────────────────────────────────────────┐
             │ *                                      │ *                                      │ *
┌────────────┴────────────┐              ┌────────────┴─────────────┐             ┌────────────┴────────────┐
│  workcenter_priorities  │              │ workcenter_availabilities│             │    workcenter_shifts    │
├─────────────────────────┤              ├──────────────────────────┤             ├─────────────────────────┤
│ PK  id                  │              │ PK  id                   │             │ PK  id                  │
│ FK  workcenter_id       │              │ FK  workcenter_id        │             │ FK  workcenter_id       │
│     product_category    │              │     product_category     │             │     from_date, to_date  │
│     customer_name       │              │     start_date, end_date │             │     working_hours       │
│     rank                │              │     efficiency_pct       │             │     break_time_minutes  │
└─────────────────────────┘              │     allocated_cadre      │             │     shift_start/end     │
                                         └──────────────────────────┘             └─────────────────────────┘
```

---

### 4.2 Relational Database Tables & DDL (PostgreSQL / Cloud SQL)

For production deployment with a relational database backend, the following SQL schemas define the persistence tier:

```sql
-- 1. Garment Categories & Order Status Enums
CREATE TYPE product_category_enum AS ENUM (
  'Denim Pant', 'Shorts', 'Polo T-Shirt', 'Joggers', 'Cargo Pants', 'Hoodie'
);

CREATE TYPE order_status_enum AS ENUM (
  'Open', 'In_Production', 'Shipped', 'Closed'
);

CREATE TYPE block_status_enum AS ENUM (
  'on_time', 'material_delay', 'ship_date_risk'
);

-- 2. Workcenters Master Table
CREATE TABLE workcenters (
  workcenter_id VARCHAR(32) PRIMARY KEY, -- e.g. 'WC-01'
  name VARCHAR(128) NOT NULL,
  floor VARCHAR(128) NOT NULL,
  standard_cadre INT NOT NULL DEFAULT 43,
  current_category product_category_enum NOT NULL,
  is_split_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Sales Orders Table
CREATE TABLE sales_orders (
  sales_order_no VARCHAR(64) PRIMARY KEY, -- e.g. 'SO-2027-0001'
  buyer_po VARCHAR(64) NOT NULL,
  style_no VARCHAR(64) NOT NULL,
  style_desc VARCHAR(255) NOT NULL,
  customer_name VARCHAR(128) NOT NULL,
  color VARCHAR(64) NOT NULL,
  size VARCHAR(32) NOT NULL,
  product_category product_category_enum NOT NULL,
  order_quantity INT NOT NULL CHECK (order_quantity > 0),
  rate NUMERIC(10, 2) NOT NULL,
  destination VARCHAR(128) NOT NULL,
  smv NUMERIC(6, 2) NOT NULL,
  ship_date DATE NOT NULL,
  order_status order_status_enum NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_orders_status ON sales_orders(order_status);
CREATE INDEX idx_sales_orders_ship_date ON sales_orders(ship_date);

-- 4. Sewing Floor Production Execution Table
CREATE TABLE production_records (
  production_id VARCHAR(64) PRIMARY KEY, -- e.g. 'PRD-0001'
  production_date DATE NOT NULL,
  sales_order_no VARCHAR(64) NOT NULL REFERENCES sales_orders(sales_order_no) ON DELETE CASCADE,
  workcenter_id VARCHAR(32) NOT NULL REFERENCES workcenters(workcenter_id),
  produced_qty INT NOT NULL CHECK (produced_qty > 0),
  shift VARCHAR(64),
  operator_count INT DEFAULT 43,
  remarks TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prod_so ON production_records(sales_order_no);
CREATE INDEX idx_prod_date ON production_records(production_date);

-- 5. Raw Material Purchase Orders Table
CREATE TABLE raw_material_pos (
  po_no VARCHAR(64) PRIMARY KEY,
  sales_order_no VARCHAR(64) REFERENCES sales_orders(sales_order_no) ON DELETE SET NULL,
  vendor_name VARCHAR(128) NOT NULL,
  material_type VARCHAR(128) NOT NULL,
  material_specification VARCHAR(255),
  quantity INT NOT NULL,
  uom VARCHAR(32) NOT NULL,
  rate NUMERIC(10, 2) NOT NULL,
  inhouse_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rm_so ON raw_material_pos(sales_order_no);

-- 6. Workcenter Priority Master Table
CREATE TABLE workcenter_priorities (
  id VARCHAR(64) PRIMARY KEY,
  workcenter_id VARCHAR(32) NOT NULL REFERENCES workcenters(workcenter_id),
  product_category product_category_enum NOT NULL,
  customer_name VARCHAR(128),
  style_no VARCHAR(64),
  rank INT NOT NULL DEFAULT 1,
  UNIQUE(workcenter_id, product_category, customer_name, style_no)
);

-- 7. Workcenter Availability & Efficiency Table
CREATE TABLE workcenter_availabilities (
  id VARCHAR(64) PRIMARY KEY,
  workcenter_id VARCHAR(32) NOT NULL REFERENCES workcenters(workcenter_id),
  product_category product_category_enum NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  efficiency_pct NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
  is_splitting_active BOOLEAN DEFAULT FALSE,
  allocated_cadre INT DEFAULT 43
);

-- 8. Shift Master Table
CREATE TABLE workcenter_shifts (
  id VARCHAR(64) PRIMARY KEY,
  workcenter_id VARCHAR(32) NOT NULL REFERENCES workcenters(workcenter_id),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  working_hours NUMERIC(4, 2) NOT NULL DEFAULT 9.83,
  break_time_minutes INT NOT NULL DEFAULT 60,
  shift_start_time TIME NOT NULL DEFAULT '08:00',
  shift_end_time TIME NOT NULL DEFAULT '18:50'
);

-- 9. Planned Blocks (Gantt Schedule State)
CREATE TABLE planned_blocks (
  block_id VARCHAR(64) PRIMARY KEY,
  parent_block_id VARCHAR(64) REFERENCES planned_blocks(block_id) ON DELETE SET NULL,
  sales_order_no VARCHAR(64) NOT NULL REFERENCES sales_orders(sales_order_no) ON DELETE CASCADE,
  workcenter_id VARCHAR(32) NOT NULL REFERENCES workcenters(workcenter_id),
  order_qty INT NOT NULL,
  already_produced_qty INT NOT NULL DEFAULT 0,
  planned_qty INT NOT NULL,
  smv NUMERIC(6, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  working_days_needed INT NOT NULL,
  ship_date DATE NOT NULL,
  rm_inhouse_date DATE,
  status block_status_enum NOT NULL DEFAULT 'on_time',
  status_reason TEXT,
  daily_allocations JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blocks_wc ON planned_blocks(workcenter_id);
CREATE INDEX idx_blocks_dates ON planned_blocks(start_date, end_date);
```

---

### 4.3 Local Storage & State Synchronization Protocol

For offline-resilient and instant client-side operation, the application implements a versioned LocalStorage protocol:
- **Storage Key**: `sewplan_aps_data_v3`
- **Serialization**: Atomic JSON payload containing all tables: `salesOrders`, `rawMaterialPOs`, `productionRecords`, `workcenters`, `priorities`, `availabilities`, `shifts`, `holidayMaster`, and `activePlan`.
- **Debounced Commit**: Writes to persistent storage are debounced by 1,500ms to avoid blocking high-frequency UI interactions during drag-and-drop operations.
- **Quota Protection**: Wrapped in try/catch to gracefully handle browser storage limits.

---

## 5. Frontend Architecture & Technical Implementation

### 5.1 Component Tree & Directory Structure

```
src/
├── App.tsx                        # Root application container & tab router
├── main.tsx                       # Entrypoint mounting DOM
├── index.css                      # Tailwind v4 theme & global typography
├── context/
│   └── PlanningContext.tsx        # Unified reactive state container
├── types/
│   └── index.ts                   # Domain types, interfaces, enums
├── utils/
│   ├── planningEngine.ts          # Core scheduling, calendar, sync logic
│   ├── seeder.ts                  # Factory dataset generator (1,200 orders)
│   └── excelExporter.ts           # Formatted XLSX production schedule generator
└── components/
    ├── Header.tsx                 # Top navigation & simulation banner
    ├── PlanningBoard.tsx          # Interactive Gantt schedule matrix
    ├── ProductionTableScreen.tsx  # Floor execution logging & progress tracking
    ├── WorkcenterPriorityScreen.tsx # Machine ranking matrix
    ├── WorkcenterAvailabilityScreen.tsx # Line efficiency & splitting setup
    ├── WorkcenterShiftScreen.tsx  # Shift timings & working hours
    ├── HolidayMasterScreen.tsx    # Working calendar & holiday rules
    ├── SourceDataScreen.tsx       # Sales orders & RM PO master tables
    ├── PlanningReportScreen.tsx   # Tabular distribution & Excel export
    ├── RunPlanModal.tsx           # Automated simulation modal with dynamic KPIs
    ├── SplitModal.tsx             # Mid-order line splitting dialog
    └── RescheduleModal.tsx        # Manual date/line override modal
```

---

### 5.2 Reactive State Management & Context API

State is centralized inside `PlanningContext.tsx` exposing atomic actions:
- `runAutoPlan()`: Executes fresh automated allocation of all open orders.
- `syncPlan()`: Runs incremental synchronization reconciling floor actuals and RM dates.
- `confirmTempPlan()`: Promotes draft simulation to production schedule.
- `discardTempPlan()`: Discards draft simulation.
- `moveBlock(blockId, targetLineId, targetStartDate)`: Re-anchors block on Gantt chart with line capacity re-evaluation.
- `addProductionRecord(record)`: Ingests sewing output and cascades deductions.
- `updateOrderStatus(orderNo, status)`: Sets order state and triggers board pruning if shipped/closed.

---

### 5.3 Gantt Virtualization & Responsive Viewport Design

- **Dynamic Layout**: The Gantt container utilizes `flex flex-col flex-1 min-h-0 w-full overflow-hidden`.
- **Coordinate Computation**:
  $$\text{Pixel Left} = \text{diffDays}(D_{start}, D_{viewport\_start}) \times \text{CellWidth}$$
  $$\text{Pixel Width} = (\text{diffDays}(D_{end}, D_{start}) + 1) \times \text{CellWidth} - 4$$
- **Cross-Device Responsiveness**:
  - Desktop (>1280px): Full horizontal navigation, 30-day timeline view.
  - Laptop / Tablet (768px–1024px): Scrollable building tabs, compact Gantt cells.
  - Mobile (<768px): Stacked KPI summaries, horizontally scrollable data tables.

---

## 6. Backend Architecture, APIs & ERP/MES Integrations

### 6.1 Service Topology

In an enterprise factory environment, the APS system communicates between the central ERP (e.g., SAP Fashion / Infor M3 / FastReact) and Shop-Floor MES barcode terminals:

```
┌─────────────────────────────────┐
│     Enterprise ERP (SAP/Infor)  │
└────────────────┬────────────────┘
                 │ Webhook: New Sales Orders / RM In-House Dates
                 ▼
┌─────────────────────────────────────────────────────────┐
│             SewPlan APS Service (Node.js/Go)            │
│  ┌───────────────────────┐   ┌───────────────────────┐  │
│  │   Planning Engine     │   │ Synchronization Engine│  │
│  └───────────────────────┘   └───────────────────────┘  │
└───────▲─────────────────────────────────────────▲───────┘
        │ REST / WebSocket                        │ Real-Time Floor Output
        ▼                                         │
┌─────────────────────────┐             ┌─────────┴───────────────┐
│ Planner Web UI (React)  │             │ Shop-Floor Barcode/RFID │
└─────────────────────────┘             └─────────────────────────┘
```

---

### 6.2 RESTful API Specifications

| Method | Endpoint | Description | Payload / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/orders` | Query sales orders with status and balance filters | `?status=Open,In_Production&page=1&limit=50` |
| `POST` | `/api/v1/orders` | Create or import sales order from ERP | `{ sales_order_no, buyer_po, style_no, qty, smv, ship_date }` |
| `PATCH` | `/api/v1/orders/:id/status` | Update order status | `{ order_status: "Shipped" }` |
| `GET` | `/api/v1/production` | Get floor output records | `?sales_order_no=SO-2027-0001` |
| `POST` | `/api/v1/production` | Post floor output from MES terminal | `{ sales_order_no, workcenter_id, produced_qty, date, shift }` |
| `POST` | `/api/v1/plan/run` | Execute automated scheduling algorithm | `{ apply_simulation: true }` |
| `POST` | `/api/v1/plan/sync` | Execute two-pass synchronization | `{ line_compaction: true }` |
| `POST` | `/api/v1/plan/confirm` | Promote simulation to active floor plan | `{}` |
| `GET` | `/api/v1/reports/excel` | Stream formatted binary `.xlsx` plan | `?building=A&status=all` |

---

### 6.3 ERP & Shop-Floor MES Webhook Protocols

#### 1. Inbound ERP Webhook: `sales_order.created_or_updated`
```json
{
  "event": "sales_order.updated",
  "timestamp": "2027-02-10T08:30:00Z",
  "data": {
    "sales_order_no": "SO-2027-0104",
    "buyer_po": "PO-ZAR-8104",
    "order_quantity": 4500,
    "ship_date": "2027-03-25",
    "order_status": "Open",
    "rm_pos": [
      {
        "po_no": "RM-PO-10104",
        "inhouse_date": "2027-02-28"
      }
    ]
  }
}
```
*APS System Action:* Triggers `syncPlan()`, adjusting block start dates if RM in-house date is postponed.

#### 2. Inbound Shop-Floor MES Webhook: `floor_piece.scanned`
```json
{
  "event": "floor_production.logged",
  "timestamp": "2027-02-10T17:45:00Z",
  "data": {
    "sales_order_no": "SO-2027-0104",
    "workcenter_id": "WC-04",
    "produced_qty": 650,
    "shift": "Standard Day",
    "operator_count": 43
  }
}
```
*APS System Action:* Deducts 650 pcs from `SO-2027-0104`, updates remaining balance, and shortens required working days on Line 04.

---

## 7. Deployment, Security & Operational Guidelines

1. **Production Build**:
   ```bash
   npm run build
   # Outputs optimized SPA to dist/
   ```
2. **Environment Configuration**:
   - `VITE_API_BASE_URL`: Pointer to Node.js / Go backend API gateway.
   - `PORT`: Set to 3000 for standard container environments.
3. **Role-Based Access Control (RBAC)**:
   - `Planner / Industrial Engineer`: Full write access (Run Plan, Sync, Drag-and-Drop, Split, Config).
   - `Floor Supervisor`: Restricted write access (Production Table logging only).
   - `Merchant / Buyer Liaison`: Read-only access to Source Data and Planning Reports.
   - `Factory General Manager`: Read-only executive dashboard and Excel exports.
4. **Disaster Recovery & Audit Trail**:
   - Every confirmed plan transition creates a snapshot in the plan version archive table (`plan_versions`).
   - Planners can revert to any prior plan version within 30 days.

---

## 8. AI Plan: Empirical Garment Industry Algorithm Architecture & End-User Portal

### 8.1 Business Rationale: Bypassing Static Priority & Availability Tables

Traditional apparel Advanced Planning and Scheduling (APS) engines rely heavily on two manually maintained master configuration tables:
1. **Workcenter Priority**: Planners manually assign integer ranks (1, 2, 3...) to pairs of `(Line, Category, Buyer)`. In practice, as styles shift, operators rotate, and machine lines are tuned, these manual rankings quickly grow obsolete, leading to suboptimal line allocations.
2. **Workcenter Availability**: Planners enter static date windows and fixed target efficiencies (e.g., 80%).

The **AI Plan Algorithm** introduces a paradigm shift engineered specifically for modern garment export manufacturers:
- **Zero Reliance on Static Priority & Availability Tables**: The system does NOT check `workcenter_priorities` or `workcenter_availabilities`.
- **Closed Sales Order & Actual Production Learning**: The algorithm mines past historical production executions (`order_status IN ('Closed', 'Shipped')`) and actual shop-floor production logs to determine empirical machine competence.
- **Empirical Parameter Extraction**: The target line's working efficiency, effective daily piece output, and operator cadre are extracted directly from empirical historical data rather than subjective manual guesses.

---

### 8.2 Empirical Closed Sales Order Analytics & Efficiency Formulation

For every historical closed or shipped sales order $S_{\text{closed}}$ and associated shop-floor production records $R$, the system evaluates the real-world manufacturing performance on each sewing line $L$:

1. **Standard Output Minutes Produced**:
   $$M_{\text{std}}(C, P, L) = \sum_{r \in R, r.\text{line}=L, r.\text{cust}=C, r.\text{cat}=P} \Big(r.\text{produced\_qty} \times S.\text{smv}\Big)$$

2. **Total Actual Operator Minutes Invested**:
   $$M_{\text{clock}}(C, P, L) = D(L) \times H_{\text{shift}} \times 60 \times K_{\text{cadre}}(L)$$
   where:
   - $D(L)$ is the number of distinct working calendar days logged by line $L$ on this customer and category.
   - $H_{\text{shift}}$ is the daily net working shift duration (e.g., 9.83 hours = 590 net working minutes).
   - $K_{\text{cadre}}(L)$ is the average operator staffing count (standard 43 operators).

3. **Empirical Historical Efficiency Percentage**:
   $$\text{Efficiency}_{\text{hist}}\%(C, P, L) = \frac{M_{\text{std}}(C, P, L)}{M_{\text{clock}}(C, P, L)} \times 100\%$$

4. **Average Daily Piece Output**:
   $$\bar{Q}_{\text{daily}}(C, P, L) = \frac{\sum r.\text{produced\_qty}}{D(L)}$$

5. **Composite Historical Competency Metric**:
   $$\text{Score}(L) = 0.65 \times \text{Efficiency}_{\text{hist}}\%(C, P, L) + 0.35 \times \left(\frac{\bar{Q}_{\text{daily}}(C, P, L)}{30}\right)$$

For each open sales order of buyer $C$ and product category $P$, the sewing line with the **highest historical output rate and efficiency %** ($\text{Rank} = 1$) is selected as the primary manufacturing line.

---

### 8.3 Automated Garment Lead-Time Calculation Model (Ship - 32 Days & Ship - 5 Days)

Apparel supply chains follow rigorous time-and-action (T&A) milestones to ensure on-time export delivery to global ports (Rotterdam, New York, Hamburg, Tokyo). The AI Plan enforces automated industrial lead-time calculations:

#### 1. Production Start Date (PSD) Formulation:
$$\text{PSD}_{\text{target}} = \text{CalendarAdd}\Big(S.\text{ship\_date}, \, -35 + 3\Big) = \text{CalendarAdd}\Big(S.\text{ship\_date}, \, -32\Big)$$
$$\text{PSD} = \text{NextWorkingDay}(\text{PSD}_{\text{target}})$$

- **Physical Raw Material Constraint**: If raw material PO delivery is pending and in-house delivery date $T_{\text{RM}} + 3 \text{ days} > \text{PSD}_{\text{target}}$, sewing cannot commence before fabric relaxation and cutting. Thus:
  $$\text{PSD}_{\text{actual}} = \max\Big(\text{PSD}, \, \text{NextWorkingDay}(T_{\text{RM}} + 3)\Big)$$

#### 2. Target Finish Date Formulation:
$$\text{FinishDate}_{\text{target}} = \text{PreviousWorkingDay}\Big(\text{CalendarAdd}(S.\text{ship\_date}, \, -5)\Big)$$
- **The 5-Day Ex-Factory Buffer**:
  In export garment manufacturing, completing sewing 5 days before the buyer ship date is a mandatory factory buffer for:
  - Garment washing, enzyme curing, and tumble drying.
  - Needle detection and metal-free safety screening.
  - Final buyer QA audit and AQL 1.5/2.5 inspection.
  - Carton packaging, barcode polybag labeling, and palletizing.
  - Inland container haulage to port customs bonded warehouses.

#### 3. Hour & Minute Continuous Flow Scheduling:
Using the selected line's empirical efficiency $\eta_{\text{hist}}$ and cadre $K_{\text{cadre}}$, the line rate is:
$$\text{LineRate} = \frac{K_{\text{cadre}} \times \eta_{\text{hist}}}{S.\text{smv}} \quad (\text{pieces per minute})$$
The schedule calculates exact working days needed, shift start minutes ($08:00$), meal breaks ($13:00-14:00$), and finish minutes ($HH:MM$). Subsequent lots on the same line sequence contiguously without idle gaps or interleaving conflicts.

---

### 8.4 Two-Stage Temporary Sandbox & Actual Plan Promotion Workflow

To protect shop-floor operations from inadvertent schedule disruption, the AI Plan operates via a strict two-stage promotion workflow:

```
[User triggers AI Plan]
          │
          ▼
[AI Algorithm Generates Plan Blocks]
          │
          ▼
[Staged in Temporary Planning Board (`planMode: 'temp'`)]
  ├── Amber AI Draft Banner Active
  ├── Interactive Visual Review on Gantt Board
  ├── Drag Bars Left/Right with Cascade Ripple of Adjacent Orders
  ├── Quick Shift ◀ / ▶ and Split Block Adjustments
  │
  ├──► [Discard Draft] ──► Reverts immediately to Authoritative Plan
  │
  └──► [Publish to Actual Plan]
          │
          ▼
  [Saved to `activePlan` & Committed to Factory Floor]
```

- When the AI Plan runs, the schedule is staged into `tempPlan` (`planMode = 'temp'`).
- Planners can interactively drag blocks left or right on the same line; adjacent and subsequent blocks ripple and cascade automatically, recalculating all start and end times.
- Clicking **"Publish to Actual Plan"** promotes the simulation to `activePlan`, commits it to `localStorage`, and updates the tracking table.

---

### 8.5 End-User Portal (View-Only Mode) Security & UX Architecture

Factory General Managers, buyer representatives, merchandising teams, and QA auditors require real-time visibility into production schedules without permission to modify line allocations.

#### Role Separation & Access Control:
- **Planner Mode**: Full APS controller access (Run Plan, AI Plan, Synchronize Plan, Drag-and-Drop Gantt, Line Transfers, Shift/Split, Priority & Master Data Configuration).
- **End-User Portal (View-Only)**:
  - **Restricted Navigation**: Menu options are strictly limited to two choices:
    1. `Planning Board (View Only)`
    2. `Planning Report (View Only)`
  - **Locked Interactivity**:
    - Block dragging (`draggable={false}`) and cell drop handlers are completely disabled.
    - Quick-shift buttons (◀ / ▶) and Split block buttons (`✂`) are removed from block hover states.
    - Clicking any order block opens a **Read-Only Inspection Dialog** detailing Buyer PO, Style, SMV, Total Balance, and Start/End times without rescheduling inputs.
    - Admin action buttons (`Run Plan`, `AI Plan`, `Sync Plan`) are hidden.
  - **Planning Report**: End users can filter by customer, category, and status, review the daily allocation matrix, and download formatted binary Microsoft Excel (`.xlsx`) schedules.
  - **One-Click Switch**: Authorized planners can toggle back to Planner Mode using the top header controller.

---

## 9. Local System Step-by-Step Installation & Implementation Guideline

This section provides a complete, foolproof engineer's setup guide to run the **SewPlan APS Full-Stack Application** on any local Windows, macOS, or Linux development workstation.

### 9.1 Required Prerequisites & Tooling
Before starting, ensure the following core tools are installed on your workstation:
1. **Node.js**: Version **v18.0.0 or higher** (Recommended: Node.js **v20 LTS** or **v22 LTS**).
   - Check version: `node -v`
   - Download: [nodejs.org](https://nodejs.org/)
2. **NPM**: Version **v9+** or **v10+** (bundled with Node.js) or Bun/Yarn.
   - Check version: `npm -v`
3. **Git**: Version control system to clone the repository.
   - Check version: `git --version`
4. **Code Editor**: Visual Studio Code (VS Code) or WebStorm.
5. **Modern Web Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari.
6. **MongoDB Compass (Optional)**: Free GUI client for visual database management.
   - Download: [mongodb.com/products/compass](https://www.mongodb.com/products/compass)

---

### 9.2 Step-by-Step Installation Procedure

#### Step 1: Clone or Download the Project Repository
```bash
# Clone the repository
git clone <your-repository-url> sewplan-aps

# Change into the project directory
cd sewplan-aps
```

#### Step 2: Install All Project Dependencies
Run `npm install` to download and install all runtime and development packages (Express, Mongoose, Vite, React 19, Tailwind CSS v4, TSX, Lucide React, XLSX):
```bash
npm install
```

#### Step 3: Configure Environment Variables (`.env`)
Create a `.env` file in the project root directory:
```bash
cp .env.example .env
```
Ensure your `.env` contains the MongoDB Atlas connection string and port:
```env
# MongoDB Atlas Database Connection String
MONGODB_URI="mongodb+srv://bappy679681_db_user:J77LYmOhVY6kEvFu@kamrul.cjohtec.mongodb.net/sewplan_aps?retryWrites=true&w=majority"

# Express Backend Server Port
PORT=3000
```

#### Step 4: Configure MongoDB Atlas IP Access (Mandatory)
MongoDB Atlas clusters enforce strict firewall security. To permit your local system (and cloud containers) to connect:
1. Log into your MongoDB Atlas Console: [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. In the left navigation bar under **Security**, click **Network Access**.
3. Click the green **+ Add IP Address** button.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`) or enter your current public IP address.
5. Click **Confirm** and wait ~30 seconds for the firewall status to change to **Active**.
6. Under **Database Access**, verify that the user `bappy679681_db_user` has read/write privileges (`readWriteAnyDatabase`).

#### Step 5: Execute Database Seeding Script
To seed your MongoDB Atlas database with the complete garment factory dataset (1,200 Sales Orders, 60 Sewing Lines, 150 Production Records, Priorities, Shifts, and Baseline Schedule):
```bash
# Run the automated TSX seeding script
npx tsx scripts/seed.ts
```
Expected output:
```text
====================================================
SewPlan APS: MongoDB Seeder Script
Connecting to: mongodb+srv://bappy679681_db_user:****@kamrul.cjohtec.mongodb.net/sewplan_aps?retryWrites=true&w=majority
====================================================
Connected to MongoDB successfully!
Inserting 60 Workcenters...
Inserting 60 Workcenter Shifts...
Inserting 180 Workcenter Priorities...
Inserting 60 Workcenter Availabilities...
Inserting Holiday Master...
Inserting 1,200 Sales Orders (5,000,000 garments)...
Inserting 1,200 Raw Material Purchase Orders...
Inserting 150 Floor Production Records...
Generating initial factory schedule plan...
Inserting 350+ Authoritative Planned Blocks...
====================================================
MongoDB Database Seed Completed Successfully!
====================================================
```

#### Step 6: Start the Development Server
Run the unified full-stack development server. This starts the Express backend API and mounts Vite middleware:
```bash
npm run dev
```
The terminal will display:
```text
[SewPlan APS] Full-stack Express API Server running on port 3000
[SewPlan APS] Dev environment available at http://localhost:3000
```

#### Step 7: Access the Application
Open your web browser and navigate to:
```text
http://localhost:3000
```
- In the top header bar, verify the **MongoDB Active** status indicator (green badge).
- In the **Source Data** screen, inspect the live database connection and record count summary.

---

### 9.3 Production Build & Deployment Procedure
For production hosting (Docker, AWS ECS, GCP Cloud Run, Heroku, or Render):
```bash
# 1. Build the frontend client bundle into /dist
npm run build

# 2. Run in production mode (Express serves static /dist and handles /api)
NODE_ENV=production npm start
```

---

## 10. High-Speed Internal Storage & Architecture Specification

### 10.1 System Topology & Architecture
The application runs as a high-performance React SPA with an autonomous, zero-latency in-memory and local storage architecture:
1. **In-Memory APS Scheduling Engine**:
   - Sub-millisecond planning calculations across 1,200 orders, 60 sewing lines, and 1,262 scheduled blocks.
   - Real-time drag & drop timeline recalculations, splitting, and learning curve capacity simulations.
2. **Persistent Internal Storage Cache (`localStorage`)**:
   - Automatically stores all master orders, workcenters, priority allocations, shifts, and plan blocks under key `sewplan_aps_data_v4`.
   - Debounced saves prevent any UI blocking.
3. **Deterministic Dataset Seeder**:
   - Instantly initializes or resets to the standard factory benchmark dataset: 1,200 orders, 60 lines, 1,200 raw material POs, 340 production output logs, and realistic factory holidays.
4. **JSON Backup & Portability**:
   - One-click full database export directly from the Source Data Master screen.

### 10.3 MongoDB Collections & Mongoose Schemas

1. **`sales_orders`**:
   - `sales_order_no` (String, Primary Key, Indexed)
   - `buyer_po`, `customer_name`, `product_category`, `style_no`, `color`, `size`
   - `order_quantity` (Number), `rate` (Number), `smv` (Number)
   - `already_produced_qty` (Number), `balance_qty` (Number)
   - `ship_date` (String YYYY-MM-DD), `order_status` (String enum)
2. **`planned_blocks`**:
   - `block_id` (String, Primary Key)
   - `sales_order_no`, `workcenter_id`
   - `start_date`, `end_date`, `start_time`, `end_time`
   - `total_pieces`, `daily_allocations` (Array of Date, Pieces, Hours, Rate)
   - `is_ai_planned` (Boolean), `ai_efficiency_pct` (Number)
3. **`production_records`**:
   - `production_id` (String, Primary Key)
   - `sales_order_no`, `workcenter_id`, `production_date`, `produced_qty`, `efficiency_pct`
4. **`workcenters` & Configuration Masters**:
   - `workcenters` (60 Lines with cadre 43, building assignments)
   - `workcenter_shifts` (Day shift 08:00 - 18:50, meal break 13:00 - 14:00)
   - `workcenter_priorities` (Category/Customer rank rankings)
   - `workcenter_availabilities` (Static date windows and planned efficiency)
   - `holiday_master` (Friday weekly off and factory holiday calendars)

---

## 11. Production Planning Engine: Step-by-Step Logic & Architectural Flowchart

### 11.1 Executive Overview

The SewPlan APS Automated Production Planning Engine is engineered to replicate and elevate the decision-making process of senior garment production planners and industrial engineers (IE). The engine schedules complex multi-color, multi-style apparel manufacturing orders across up to 60 specialized sewing lines while respecting finite machine capacities, operator cadres, category efficiencies, material procurement in-house dates, and hard shipping commitments.

The engine executes in **6 deterministic sequential phases**:

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                   SEWPLAN APS: AUTOMATED PLANNING ENGINE FLOWCHART                     │
 └────────────────────────────────────────────────────────────────────────────────────────┘

                                    [ START PLANNING RUN ]
                                              │
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 1: Arrange Sales Orders by Ship Date                                              │
 │ - Filter eligible orders: Order Status is 'Open' or 'In_Production' (Shipped/Closed = 0│
 │ - Deduct already produced sewing floor pieces: Balance Qty = Order Qty - Produced      │
 │ - Sort ascending: Orders with earliest Ship Date evaluated FIRST                       │
 └────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 2: Line Priority Index Lookup                                                     │
 │ - Query Workcenter Priority Master for (Product Category, Customer, Style)             │
 │   * Level 1: Exact Match (Workcenter + Category + Customer + Style)                    │
 │   * Level 2: Customer Match (Workcenter + Category + Customer)                         │
 │   * Level 3: Category Match (Workcenter + Category)                                    │
 │ - Rank Candidate Lines: Best prioritized lines (Rank 1, Rank 2...) identified          │
 └────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 3: Check Line Availability & Raw Material In-House Date                           │
 │ - Check Line Timeline Cursor: When does the prioritized line become free?              │
 │ - Check Raw Material Purchase Information:                                             │
 │   * Material PO exists with in-house date?                                             │
 │     YES ──► PSD = In-House Date + 3 Calendar Days (Relaxation, Inspection, Cutting)    │
 │     NO  ──► PSD = Ship Date - 35 + 3 Days (= Ship Date - 32 Days)                      │
 │ - Adjust PSD to Next Factory Working Day (skip Friday off and national holidays)       │
 │ - Earliest Line Start Candidate Date = MAX( Line Free Cursor Date, PSD Date )          │
 └────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 4: Calculate Line Available Minutes & Daily Capacity                              │
 │ - Cadre (Number of operators) from Shift Master (Standard = 43 operators)              │
 │ - Net Shift Working Hours = Total Shift Span - Meal Break Time (10.83 - 1.0 = 9.83 h)  │
 │ - Efficiency % from Workcenter Availability Master (e.g. Denim Pants = 85%)            │
 │ - Formula: Daily Capacity Mins = Cadre * (Net Shift Hours * 60) * Efficiency %         │
 │ - Daily Garment Output Rate = Daily Capacity Mins / SMV                                │
 └────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 5: Order Placed Duration Modeling based on (Block Qty * SMV)                      │
 │ - Total Work Content = Block Quantity * SMV (Standard Minute Value)                    │
 │ - Production Clock Minutes = (Block Quantity * SMV) / (Cadre * Efficiency %)           │
 │ - Working Days Needed = CEIL( (Block Quantity * SMV) / Daily Available Capacity Mins ) │
 │ - Hour/Minute Schedule: Distribute pieces across working calendar with 60-min lunch    │
 └────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 6: Color Grouping & System-Generated Block IDs                                    │
 │ - Group order quantity by Colorway (e.g., 5 colors = 5 discrete planned blocks)        │
 │ - Base Block ID Format: BLK-{Sales_Order_No}-C{Color_Index} (e.g., BLK-SO-1001-C1..C5) │
 └────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                       [ Can Priority 1 Line Finish on or before Ship Date? ]
                                   │                              │
                                 [YES]                           [NO]
                                   │                              │
                                   ▼                              ▼
                 ┌────────────────────────────────┐ ┌────────────────────────────────────┐
                 │ ALLOCATE TO PRIORITY 1 LINE    │ │ Check Alternative Prioritized Lines│
                 │ - Place Color Blocks on Line 1 │ └────────────────────────────────────┘
                 │ - Update Line 1 Busy Cursor    │                       │
                 └────────────────────────────────┘                       ▼
                                                [ Can Any Alternative Line Finish On Time? ]
                                                              │                  │
                                                            [YES]               [NO]
                                                              │                  │
                                                              ▼                  ▼
                                        ┌─────────────────────────┐  ┌────────────────────────────────────┐
                                        │ ALLOCATE TO ALT LINE    │  │ AUTO-SPLIT ACROSS 2 LINES          │
                                        │ - Place on Alt Line     │  │ - Line 1: BLK-{SO}-C{idx} (Qty 1)  │
                                        │ - Update Alt Busy Cursor│  │ - Line 2: BLK-{SO}-C{idx}-S1 (Qty2)│
                                        └─────────────────────────┘  │   (NEW Block ID Introduced!)       │
                                                                     │ - Both lines work concurrently     │
                                                                     └────────────────────────────────────┘
                                              │
                                              ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ FINAL OUTPUT: Planning Board Gantt Updated, Daily Allocation Matrix Saved, KPIs Recalced│
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 11.2 Step-by-Step Logic Breakdown

#### Step 1: Sales Order Arrangement based on Ship Date
- **Input**: Raw sales order list from ERP / database.
- **Filtering**:
  - Exclude orders with status `Shipped` or `Closed`.
  - Include only `Open` and `In_Production`.
  - Check sewing floor completed production records:
    $$\text{Balance Quantity} = \text{Order Quantity} - \sum \text{Produced Quantity}$$
  - Exclude orders where $\text{Balance Quantity} \le 0$.
- **Sorting Rule**: Orders are sorted ascending by `ship_date`:
  $$\text{Order}_A < \text{Order}_B \iff \text{ShipDate}_A < \text{ShipDate}_B$$
  *The order whose ship date is earliest is evaluated first by the planning engine.* This ensures factory capacity is reserved first for urgent customer deadlines.

#### Step 2: Line Priority Index Lookup (Category, Style, Customer)
- For the selected order, the engine queries the `Workcenter Priority Master` table:
  1. **Level 1 (Highest Priority - Rank 1..5)**: Exact Match on `(Workcenter, Category, Customer, Style)`.
  2. **Level 2 (High Priority)**: Customer Match on `(Workcenter, Category, Customer)`.
  3. **Level 3 (Standard Priority)**: Category Match on `(Workcenter, Category)`.
  4. **Level 4 (Default Fallback)**: General line match.
- Candidate lines are arranged in order of preference. The highest-ranked line (e.g. Line 1) is selected as the primary target.

#### Step 3: Line Availability & Raw Material In-House Date (PSD Calculation)
The engine cross-references two physical constraints:
1. **Line Availability**: When does the prioritized line become vacant from previously scheduled orders?
   - The engine tracks a timeline cursor for each line: $(\text{Date}, \text{Minute})$.
2. **Material In-House Date & Planned Start Date (PSD)**:
   - **Case A (Purchase Order Exists)**: If the raw material purchase order has an `inhouse_date`:
     $$\text{Target PSD} = \text{inhouse\_date} + 3 \text{ Calendar Days}$$
     *Garment Rationale*: 3-day buffer is required for laboratory dip testing, fabric relaxation (preventing post-cut shrinkage), and spreading/cutting floor approval.
   - **Case B (No Purchase Order Information)**: If no PO exists in the system:
     $$\text{Target PSD} = \text{Ship Date} - 35 \text{ Days} + 3 \text{ Days} = \text{Ship Date} - 32 \text{ Days}$$
     *Garment Rationale*: Standard 35-day lead time benchmark prior to ship date, adjusted with the 3-day buffer.
3. **Calendar Synchronization**:
   - $\text{PSD} = \text{getNextWorkingDay}(\text{Target PSD})$ (skipping Fridays and national factory holidays).
4. **Earliest Line Start**:
   $$\text{Candidate Start Date} = \max(\text{Line Cursor Date}, \text{PSD})$$

#### Step 4: Line Available Minutes / Hours & Efficiency %
The capacity of a sewing line is determined by combining the `Workcenter Shift Master` and `Workcenter Availability Master`:
- **Cadre ($C$)**: Number of operators and helpers assigned to the line (from Shift Master, e.g. 43 operators).
- **Net Working Hours ($H$)**: Total shift duration minus unpaid lunch/meal break:
  $$H = 10.833\text{ hrs} - 1.0\text{ hr break} = 9.833\text{ net hours} = 590\text{ net working minutes}$$
- **Efficiency % ($E$)**: Effective performance percentage for the specific line and product category (from Workcenter Availability Master, e.g. $85\% = 0.85$).
- **Daily Available Line Minutes ($M_{\text{daily}}$)**:
  $$M_{\text{daily}} = C \times (H \times 60) \times E = 43 \times 590 \times 0.85 = 21,564.5\text{ standard minutes/day}$$
- **Daily Garment Output Rate ($R_{\text{daily}}$)**:
  $$R_{\text{daily}} = \frac{M_{\text{daily}}}{\text{SMV}} = \frac{21,564.5}{16.0} \approx 1,348\text{ pieces/day}$$

#### Step 5: Order Placed Duration based on (Block Qty * SMV)
- **Work Content**:
  $$\text{Standard Production Minutes} = \text{Block Quantity} \times \text{SMV}$$
- **Line Clock Minutes Required ($T_{\text{clock}}$)**:
  $$T_{\text{clock}} = \frac{\text{Block Quantity} \times \text{SMV}}{C \times E}$$
- **Working Days Needed ($D$)**:
  $$D = \left\lceil \frac{\text{Block Quantity} \times \text{SMV}}{M_{\text{daily}}} \right\rceil$$
- **Minute-by-Minute Timeline Allocation**:
  - Production begins at shift start ($08:00$).
  - If production spans across $13:00$, a $60$-minute meal break is automatically factored into the clock time.
  - End time is rounded to exact clock minutes (e.g. $14:32$).

#### Step 6: Color Grouping & System-Generated Block IDs
- **Colorway Grouping**:
  - In garment manufacturing, cutting and sewing lots are grouped by garment colorway for shade lot integrity, thread matching, and dye batch control.
  - If an order specifies **5 colors** (e.g. `Black, White, Navy, Red, Heather Grey`), the system breaks the order into **5 discrete planned blocks**.
  - Example: Order Qty $= 5,000$ pcs with $5$ colors $\implies 1,000$ pcs per color block.
- **System-Generated Block ID Formula**:
  $$\text{Block ID} = \text{BLK}-\{\text{Sales\_Order\_No}\}-\text{C}\{\text{Color\_Index}\}$$
  *Example*:
  - Block 1: `BLK-SO-1001-C1` (Color: Black, 1000 pcs)
  - Block 2: `BLK-SO-1001-C2` (Color: White, 1000 pcs)
  - Block 3: `BLK-SO-1001-C3` (Color: Navy, 1000 pcs)
  - Block 4: `BLK-SO-1001-C4` (Color: Red, 1000 pcs)
  - Block 5: `BLK-SO-1001-C5` (Color: Heather Grey, 1000 pcs)
- **Split Handling & New Block ID Introduction**:
  - If a block cannot finish before ship date on Line 1, or is manually split across lines:
    - Line 1 retains: `BLK-SO-1001-C1`
    - Line 2 introduces a **new system-generated block ID**:
      $$\text{New Split Block ID} = \text{BLK}-\{\text{Sales\_Order\_No}\}-\text{C}\{\text{Color\_Index}\}-\text{S}\{\text{Split\_Count}\}$$
      *Example*: `BLK-SO-1001-C1-S1`
  - The parent-child lineage is maintained in `parent_block_id` for end-to-end traceability.

---

### 11.3 Comprehensive Numerical Example

| Parameter | Value | Reference Rule |
| :--- | :--- | :--- |
| **Sales Order No** | `SO-1042` | Step 1 |
| **Customer / Category** | `Zara / Polo T-Shirt` | Step 2 |
| **Ship Date** | `2027-03-25` | Step 1 |
| **Order Quantity** | `5,000 pcs` | Step 1 |
| **Already Produced** | `0 pcs` (Balance: 5,000 pcs) | Step 1 |
| **Colors** | `Black, White, Navy, Red, Charcoal` (5 colors) | Step 6 |
| **SMV** | `15.0 minutes` | Step 5 |
| **PO In-House Date** | `2027-02-10` | Step 3 |
| **Calculated PSD** | `2027-02-10 + 3 days = 2027-02-13` (Sat -> Mon 2027-02-15) | Step 3 |
| **Target Sewing Line** | `WC-01` (Priority Rank 1 for Zara Polo) | Step 2 |
| **Line Operators (Cadre)** | `43 operators` | Step 4 |
| **Net Working Hours** | `9.833 hours/day` (590 minutes) | Step 4 |
| **Line Efficiency %** | `85%` ($0.85$) | Step 4 |
| **Daily Line Capacity** | $43 \times 590 \times 0.85 = 21,564.5\text{ std mins}$ | Step 4 |
| **Daily Output Rate** | $21,564.5 / 15.0 = 1,437.6\text{ pcs/day}$ | Step 4 |
| **Total Order Work Content** | $5,000 \times 15.0 = 75,000\text{ standard minutes}$ | Step 5 |
| **Days Needed** | $\lceil 75,000 / 21,564.5 \rceil = 4\text{ working days}$ | Step 5 |
| **Generated Blocks** | 5 blocks: `BLK-SO-1042-C1` to `BLK-SO-1042-C5` ($1,000$ pcs each) | Step 6 |
| **Completion Date** | `2027-02-18 16:40` (Well before Ship Date `2027-03-25`) | On-Time Confirmation |

---

## 12. Authentication Criteria & Plan Explanation Report Architecture

### 12.1 Authentication System & Role Permissions (Admin vs. Viewer)

SewPlan APS implements an enterprise two-tier authentication architecture separating operational planners from read-only shop-floor stakeholders.

| Role | Initial Password | Permitted Screens | Operational Capabilities |
| :--- | :--- | :--- | :--- |
| **1. Admin** | `123` | • Planning Board (Gantt)<br>• Plan Explanation Report<br>• Planning Report (Matrix)<br>• AI Plan Studio<br>• Production Floor Table<br>• Workcenter Priority Master<br>• Workcenter Availability & Split Master<br>• Workcenter Shift & Cadre Master<br>• Factory Holiday Master<br>• Source Data & MongoDB Cluster<br>• System Documentation | **Full Controller & Editable Access**:<br>• Drag-and-drop block rescheduling<br>• Color block splitting & ripple cascading<br>• Interactive AI generation & publishing<br>• Run Automated Planning Engine<br>• MongoDB database synchronization & seeding<br>• Shift & calendar configuration overrides |
| **2. Viewer** | `123` | • Planning Board (Gantt)<br>• Plan Explanation Report<br>• Planning Report (Matrix & Summary) | **View Mode Only (Read-Only)**:<br>• Non-editable Gantt schedule inspection<br>• Drag-and-drop actions completely disabled<br>• Order splitting, rescheduling, and deletion blocked<br>• Run Plan & Sync Plan controls omitted<br>• Filter, inspect, and download Excel (.xlsx) / CSV reports |

#### Session Persistence & Security Flow
1. **Login Portal**: Unauthenticated visitors are presented with the SewPlan Enterprise Login Screen (`LoginScreen.tsx`).
2. **Credential Validation**: Passwords are verified against the initial system key `123`.
3. **Session Storage**: Validated sessions are stored in `localStorage` (`sewplan_auth_session`: `{ role, username, loggedInAt }`).
4. **Header Profile**: Displays the active role pill (`Admin (Editable)` vs `Viewer (Read-Only)`), a quick 1-click preview switcher, and a `Logout` action that terminates the session and returns to the login screen.

---

### 12.2 Plan Explanation Report Specification

The **Plan Explanation Report** (`PlanExplanationReportScreen.tsx`) provides complete auditability and algorithmic transparency for every planned block on the board.

#### 10-Column Audit Schema:
1. **`Line No`**: Workcenter code (e.g. `WC-01`, `WC-14`) with zone and building assignment.
2. **`Sales Order`**: Authoritative Sales Order Number (e.g. `SO-1001`) with Buyer PO.
3. **`Customer`**: Brand account (e.g. Zara, H&M, Levi Strauss, Nike, Uniqlo).
4. **`Style`**: Garment style code and description (e.g. `LS-501` - Straight Denim Fit).
5. **`Color`**: Dye shade / colorway with block index (e.g. `Dark Wash (C1)`).
6. **`SMV`**: Standard Minute Value in decimal minutes (e.g. `16.5`).
7. **`Qty`**: Planned pieces in this discrete block lot (e.g. `1,250 pcs`).
8. **`Plan Start Date`**: Precise scheduled start date and time (`YYYY-MM-DD HH:MM`).
9. **`Plan End Date`**: Precise scheduled completion date and time (`YYYY-MM-DD HH:MM`).
10. **`Reason of Plan`**: Explicit algorithmic or operational explanation answering **why this order is on this line** and **why it starts at this exact time**.

#### Reason of Plan Taxonomy:

1. **Manual Update (`Manual update`)**:
   - **Trigger**: When a planner drags and drops an order block across timeline cells, nudges time, or manually splits an order block from the UI.
   - **Explanation Stored**: `Manual update` (with `is_manually_updated: true` flag).

2. **Planned AI Based (`Planned AI based based on Historical data`)**:
   - **Trigger**: When the block was planned via the empirical historical machine learning engine (`generateAIProductionPlan`).
   - **Explanation Stored**: `Planned AI based based on Historical data` (including empirical efficiency percentage and historical pieces/day benchmark).

3. **Standard Planning Engine (`Standard Engine Priority & PSD`)**:
   - **Trigger**: When generated by the primary 6-step planning engine (`generateProductionPlan`).
   - **Explanation Stored**: Detailed multi-rule rationale:
     - `Rule 1 & 2`: Line Priority rank for `(Product Category, Customer, Style)`.
     - `Rule 3`: Start date aligned with Raw Material PSD (`In-House Date + 3 days relaxation` or `Ship Date - 35 + 3 days lead time`) and line vacancy.
     - `Rule 4 & 5`: Duration calculated from `Block Qty * SMV` on the line's operator cadre and category efficiency percentage.

4. **Auto-Split Logic (`Auto-split to meet Ship Date`)**:
   - **Trigger**: When an order cannot finish before ship date on Line 1, and the engine automatically splits the lot across Line 1 and Line 2.
   - **Explanation Stored**: Details the auto-split sibling line, the concurrent run, and the newly introduced Block ID (`BLK-...-S1`).

---

*End of Technical & Business Architecture Specification.*

