import { Router } from 'express';
import {
  SalesOrderModel,
  RawMaterialPOModel,
  ProductionRecordModel,
  WorkcenterModel,
  WorkcenterPriorityModel,
  WorkcenterAvailabilityModel,
  WorkcenterShiftModel,
  HolidayMasterModel,
  PlannedBlockModel
} from './models';
import { getDatabaseStatus, seedDatabaseIfEmpty, connectToDatabase } from './db';

export const apiRouter = Router();

// 1. Health & Database Status
apiRouter.get('/health', async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    res.json({
      status: 'ok',
      service: 'SewPlan APS Express API Server',
      timestamp: new Date().toISOString(),
      database: status
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err?.message });
  }
});

// 1b. Test & Reconnect to MongoDB
apiRouter.post('/connect', async (req, res) => {
  try {
    const { uri } = req.body || {};
    const result = await connectToDatabase(uri);
    const status = await getDatabaseStatus();
    res.json({
      ...result,
      database: status
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 2. Trigger Database Seeding
apiRouter.post('/seed', async (req, res) => {
  try {
    const force = Boolean(req.body?.force);
    const result = await seedDatabaseIfEmpty(force);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 3. Complete Bootstrap: Loads all collections for initial application hydration
apiRouter.get('/bootstrap', async (req, res) => {
  try {
    const [
      salesOrders,
      rawMaterialPOs,
      productionRecords,
      workcenters,
      priorities,
      availabilities,
      shifts,
      holidayMasterDoc,
      activePlan
    ] = await Promise.all([
      SalesOrderModel.find({}).lean(),
      RawMaterialPOModel.find({}).lean(),
      ProductionRecordModel.find({}).lean(),
      WorkcenterModel.find({}).lean(),
      WorkcenterPriorityModel.find({}).lean(),
      WorkcenterAvailabilityModel.find({}).lean(),
      WorkcenterShiftModel.find({}).lean(),
      HolidayMasterModel.findOne({ master_key: 'default' }).lean(),
      PlannedBlockModel.find({}).lean()
    ]);

    const holidayMaster = holidayMasterDoc
      ? {
          weekly_offs: holidayMasterDoc.weekly_offs || [5],
          holidays: holidayMasterDoc.holidays || []
        }
      : { weekly_offs: [5], holidays: [] };

    res.json({
      success: true,
      source: 'mongodb',
      counts: {
        salesOrders: salesOrders.length,
        rawMaterialPOs: rawMaterialPOs.length,
        productionRecords: productionRecords.length,
        workcenters: workcenters.length,
        priorities: priorities.length,
        availabilities: availabilities.length,
        shifts: shifts.length,
        activePlan: activePlan.length
      },
      data: {
        salesOrders,
        rawMaterialPOs,
        productionRecords,
        workcenters,
        priorities,
        availabilities,
        shifts,
        holidayMaster,
        activePlan
      }
    });
  } catch (err: any) {
    console.error('[API /bootstrap] Error:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 4. Sales Orders Endpoints
apiRouter.get('/sales-orders', async (req, res) => {
  try {
    const orders = await SalesOrderModel.find({}).lean();
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/sales-orders', async (req, res) => {
  try {
    const orderData = req.body;
    const created = await SalesOrderModel.create(orderData);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

apiRouter.patch('/sales-orders/:salesOrderNo/status', async (req, res) => {
  try {
    const { salesOrderNo } = req.params;
    const { status } = req.body;
    const updated = await SalesOrderModel.findOneAndUpdate(
      { sales_order_no: salesOrderNo },
      { order_status: status },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 5. Production Records Endpoints
apiRouter.get('/production-records', async (req, res) => {
  try {
    const records = await ProductionRecordModel.find({}).lean();
    res.json({ success: true, count: records.length, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/production-records', async (req, res) => {
  try {
    const recordData = req.body;
    if (!recordData.production_id) {
      const count = await ProductionRecordModel.countDocuments();
      recordData.production_id = `PRD-API-${count + 1}`;
    }
    const created = await ProductionRecordModel.create(recordData);

    // Increment already_produced_qty on sales order
    await SalesOrderModel.updateOne(
      { sales_order_no: recordData.sales_order_no },
      {
        $inc: { already_produced_qty: recordData.produced_qty },
        $set: { order_status: 'In_Production' }
      }
    );

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message });
  }
});

// 6. Planned Blocks (Publish Authoritative Plan)
apiRouter.get('/plan', async (req, res) => {
  try {
    const plan = await PlannedBlockModel.find({}).lean();
    res.json({ success: true, count: plan.length, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/plan', async (req, res) => {
  try {
    const { blocks } = req.body;
    if (!Array.isArray(blocks)) {
      return res.status(400).json({ success: false, error: 'Expected { blocks: PlannedBlock[] }' });
    }

    // Replace current authoritative plan in MongoDB
    await PlannedBlockModel.deleteMany({});
    if (blocks.length > 0) {
      await PlannedBlockModel.insertMany(blocks, { ordered: false });
    }

    res.json({
      success: true,
      message: `Persisted ${blocks.length} authoritative planned blocks to MongoDB`,
      count: blocks.length
    });
  } catch (err: any) {
    console.error('[API /plan] Error:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 7. Workcenter Masters
apiRouter.get('/workcenters', async (req, res) => {
  try {
    const list = await WorkcenterModel.find({}).lean();
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 8. Configuration Masters Updates (Priorities, Availabilities, Shifts, Holidays)
apiRouter.put('/priorities', async (req, res) => {
  try {
    const { priorities } = req.body;
    if (Array.isArray(priorities)) {
      await WorkcenterPriorityModel.deleteMany({});
      await WorkcenterPriorityModel.insertMany(priorities);
    }
    res.json({ success: true, message: 'Priorities updated in MongoDB' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/availabilities', async (req, res) => {
  try {
    const { availabilities } = req.body;
    if (Array.isArray(availabilities)) {
      await WorkcenterAvailabilityModel.deleteMany({});
      await WorkcenterAvailabilityModel.insertMany(availabilities);
    }
    res.json({ success: true, message: 'Availabilities updated in MongoDB' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/shifts', async (req, res) => {
  try {
    const { shifts } = req.body;
    if (Array.isArray(shifts)) {
      await WorkcenterShiftModel.deleteMany({});
      await WorkcenterShiftModel.insertMany(shifts);
    }
    res.json({ success: true, message: 'Shifts updated in MongoDB' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/holidays', async (req, res) => {
  try {
    const { holidayMaster } = req.body;
    if (holidayMaster) {
      await HolidayMasterModel.findOneAndUpdate(
        { master_key: 'default' },
        {
          master_key: 'default',
          weekly_offs: holidayMaster.weekly_offs,
          holidays: holidayMaster.holidays
        },
        { upsert: true }
      );
    }
    res.json({ success: true, message: 'Holiday Master updated in MongoDB' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 9. Reset All Factory Data to Seeder Baseline
apiRouter.post('/reset', async (req, res) => {
  try {
    const result = await seedDatabaseIfEmpty(true);
    res.json({
      success: true,
      message: 'Factory data reset to pristine seed in MongoDB',
      details: result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
