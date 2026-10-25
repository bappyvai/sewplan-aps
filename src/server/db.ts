import mongoose from 'mongoose';
import {
  SalesOrderModel,
  RawMaterialPOModel,
  ProductionRecordModel,
  WorkcenterModel,
  WorkcenterPriorityModel,
  WorkcenterAvailabilityModel,
  WorkcenterShiftModel,
  HolidayMasterModel,
  PlannedBlockModel,
  DbMetadataModel
} from './models';
import { generateInitialDataset } from '../utils/seeder';
import { generateProductionPlan } from '../utils/planningEngine';

const DEFAULT_MONGODB_URI =
  'mongodb+srv://bappy679681_db_user:J77LYmOhVY6kEvFu@kamrul.cjohtec.mongodb.net/sewplan_aps?retryWrites=true&w=majority';

export let isDbConnected = false;
export let dbConnectionError: string | null = null;
export let currentDbUri: string = DEFAULT_MONGODB_URI;

export async function connectToDatabase(customUri?: string): Promise<{ success: boolean; message: string; error?: string }> {
  const uri = customUri || process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  currentDbUri = uri;

  try {
    if (mongoose.connection.readyState === 1 && !customUri) {
      isDbConnected = true;
      dbConnectionError = null;
      return { success: true, message: `Already connected to database: ${mongoose.connection.name}` };
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log('[MongoDB] Connecting to cluster:', uri.replace(/:[^:]*@/, ':****@'));
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 12000,
      connectTimeoutMS: 12000
    });

    isDbConnected = true;
    dbConnectionError = null;
    console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.name}`);

    // Auto-seed if database is freshly created
    await seedDatabaseIfEmpty(false);
    return {
      success: true,
      message: `Successfully connected to MongoDB database: ${mongoose.connection.name}`
    };
  } catch (err: any) {
    isDbConnected = false;
    const msg = err?.message || 'Failed to connect to MongoDB';
    if (msg.includes('whitelisted') || msg.includes('Could not connect to any servers') || msg.includes('ETIMEDOUT') || msg.includes('ENOTFOUND')) {
      dbConnectionError = `${msg} (MongoDB Atlas Network Access: Please ensure IP 0.0.0.0/0 is whitelisted in cloud.mongodb.com)`;
    } else {
      dbConnectionError = msg;
    }
    console.error('[MongoDB] Connection error:', dbConnectionError);
    return {
      success: false,
      message: 'Failed to connect to MongoDB',
      error: dbConnectionError || undefined
    };
  }
}

export async function seedDatabaseIfEmpty(force = false): Promise<{
  success: boolean;
  message: string;
  counts?: Record<string, number>;
  error?: string;
}> {
  try {
    // If not connected, attempt connecting first
    if (mongoose.connection.readyState !== 1) {
      console.log('[MongoDB] Mongoose not connected, attempting connectToDatabase() before seeding...');
      const connResult = await connectToDatabase();
      if (!connResult.success) {
        return {
          success: false,
          message: 'Cannot seed: MongoDB connection could not be established.',
          error: connResult.error || dbConnectionError || 'Connection failed'
        };
      }
    }

    const existingOrdersCount = await SalesOrderModel.countDocuments();
    if (existingOrdersCount > 0 && !force) {
      console.log(`[MongoDB] Database already seeded with ${existingOrdersCount} sales orders.`);
      const counts = await getCollectionCounts();
      return { success: true, message: 'Database already seeded with production records', counts };
    }

    console.log('[MongoDB] Seeding database with initial apparel factory dataset...');
    const dataset = generateInitialDataset();

    // 1. Clear existing collections if force re-seed requested
    if (force) {
      await Promise.all([
        SalesOrderModel.deleteMany({}),
        RawMaterialPOModel.deleteMany({}),
        ProductionRecordModel.deleteMany({}),
        WorkcenterModel.deleteMany({}),
        WorkcenterPriorityModel.deleteMany({}),
        WorkcenterAvailabilityModel.deleteMany({}),
        WorkcenterShiftModel.deleteMany({}),
        HolidayMasterModel.deleteMany({}),
        PlannedBlockModel.deleteMany({})
      ]);
    }

    // 2. Insert Masters
    console.log('[MongoDB] Inserting Workcenters, Shifts, Priorities, and Holidays...');
    await WorkcenterModel.insertMany(dataset.workcenters);
    await WorkcenterShiftModel.insertMany(dataset.shifts);
    await WorkcenterPriorityModel.insertMany(dataset.priorities);
    await WorkcenterAvailabilityModel.insertMany(dataset.availabilities);
    await HolidayMasterModel.findOneAndUpdate(
      { master_key: 'default' },
      {
        master_key: 'default',
        weekly_offs: dataset.holidayMaster.weekly_offs,
        holidays: dataset.holidayMaster.holidays
      },
      { upsert: true, new: true }
    );

    // 3. Insert 1,200 Sales Orders in batches
    console.log('[MongoDB] Inserting 1,200 Sales Orders and Raw Material POs...');
    await SalesOrderModel.insertMany(dataset.salesOrders, { ordered: false });
    await RawMaterialPOModel.insertMany(dataset.rawMaterialPOs, { ordered: false });
    await ProductionRecordModel.insertMany(dataset.productionRecords, { ordered: false });

    // 4. Generate & Insert Authoritative Initial Planned Blocks
    console.log('[MongoDB] Generating baseline production plan blocks...');
    const initialPlanBlocks = generateProductionPlan(
      dataset.salesOrders,
      dataset.rawMaterialPOs,
      dataset.workcenters,
      dataset.priorities,
      dataset.availabilities,
      dataset.shifts,
      dataset.holidayMaster,
      dataset.productionRecords
    );

    if (initialPlanBlocks.length > 0) {
      await PlannedBlockModel.insertMany(initialPlanBlocks, { ordered: false });
    }

    // 5. Save metadata
    await DbMetadataModel.findOneAndUpdate(
      { key: 'seeding_metadata' },
      {
        key: 'seeding_metadata',
        value: {
          version: '4.0.0',
          total_orders: dataset.salesOrders.length,
          total_pieces: 5000000,
          total_workcenters: dataset.workcenters.length,
          planned_blocks: initialPlanBlocks.length
        },
        seeded_at: new Date()
      },
      { upsert: true }
    );

    const counts = await getCollectionCounts();
    console.log('[MongoDB] Seeding completed successfully!', counts);

    return {
      success: true,
      message: 'Database seeded successfully with enterprise apparel master dataset',
      counts
    };
  } catch (err: any) {
    console.error('[MongoDB] Seeding error:', err);
    return {
      success: false,
      message: err?.message || 'Error occurred during database seeding'
    };
  }
}

export async function getCollectionCounts(): Promise<Record<string, number>> {
  if (!isDbConnected) {
    return {
      salesOrders: 0,
      workcenters: 0,
      plannedBlocks: 0,
      productionRecords: 0,
      rawMaterialPOs: 0
    };
  }

  const [salesOrders, workcenters, plannedBlocks, productionRecords, rawMaterialPOs] = await Promise.all([
    SalesOrderModel.countDocuments(),
    WorkcenterModel.countDocuments(),
    PlannedBlockModel.countDocuments(),
    ProductionRecordModel.countDocuments(),
    RawMaterialPOModel.countDocuments()
  ]);

  return {
    salesOrders,
    workcenters,
    plannedBlocks,
    productionRecords,
    rawMaterialPOs
  };
}

export async function getDatabaseStatus() {
  const counts = await getCollectionCounts();
  return {
    connected: isDbConnected,
    database: mongoose.connection?.name || 'sewplan_aps',
    host: mongoose.connection?.host || 'kamrul.cjohtec.mongodb.net',
    error: dbConnectionError,
    counts
  };
}
