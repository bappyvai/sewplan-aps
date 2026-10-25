import dotenv from 'dotenv';
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
} from '../src/server/models';
import { generateInitialDataset } from '../src/utils/seeder';
import { generateProductionPlan } from '../src/utils/planningEngine';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://bappy679681_db_user:J77LYmOhVY6kEvFu@kamrul.cjohtec.mongodb.net/sewplan_aps?retryWrites=true&w=majority';

async function seed() {
  console.log('====================================================');
  console.log('SewPlan APS: MongoDB Seeder Script');
  console.log('Connecting to:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));
  console.log('====================================================');

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000
    });
    console.log('Connected to MongoDB successfully!');

    console.log('Generating initial factory dataset...');
    const dataset = generateInitialDataset();

    console.log('Clearing old collections (if any)...');
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

    console.log(`Inserting ${dataset.workcenters.length} Workcenters...`);
    await WorkcenterModel.insertMany(dataset.workcenters);

    console.log(`Inserting ${dataset.shifts.length} Workcenter Shifts...`);
    await WorkcenterShiftModel.insertMany(dataset.shifts);

    console.log(`Inserting ${dataset.priorities.length} Workcenter Priorities...`);
    await WorkcenterPriorityModel.insertMany(dataset.priorities);

    console.log(`Inserting ${dataset.availabilities.length} Workcenter Availabilities...`);
    await WorkcenterAvailabilityModel.insertMany(dataset.availabilities);

    console.log('Inserting Holiday Master...');
    await HolidayMasterModel.findOneAndUpdate(
      { master_key: 'default' },
      {
        master_key: 'default',
        weekly_offs: dataset.holidayMaster.weekly_offs,
        holidays: dataset.holidayMaster.holidays
      },
      { upsert: true }
    );

    console.log(`Inserting ${dataset.salesOrders.length} Sales Orders (5,000,000 garments)...`);
    await SalesOrderModel.insertMany(dataset.salesOrders, { ordered: false });

    console.log(`Inserting ${dataset.rawMaterialPOs.length} Raw Material Purchase Orders...`);
    await RawMaterialPOModel.insertMany(dataset.rawMaterialPOs, { ordered: false });

    console.log(`Inserting ${dataset.productionRecords.length} Floor Production Records...`);
    await ProductionRecordModel.insertMany(dataset.productionRecords, { ordered: false });

    console.log('Generating initial factory schedule plan...');
    const plan = generateProductionPlan(
      dataset.salesOrders,
      dataset.rawMaterialPOs,
      dataset.workcenters,
      dataset.priorities,
      dataset.availabilities,
      dataset.shifts,
      dataset.holidayMaster,
      dataset.productionRecords
    );

    if (plan.length > 0) {
      console.log(`Inserting ${plan.length} Authoritative Planned Blocks...`);
      await PlannedBlockModel.insertMany(plan, { ordered: false });
    }

    await DbMetadataModel.findOneAndUpdate(
      { key: 'seeding_metadata' },
      {
        key: 'seeding_metadata',
        value: {
          version: '4.0.0',
          total_orders: dataset.salesOrders.length,
          total_pieces: 5000000,
          total_workcenters: dataset.workcenters.length,
          planned_blocks: plan.length
        },
        seeded_at: new Date()
      },
      { upsert: true }
    );

    console.log('====================================================');
    console.log('MongoDB Database Seed Completed Successfully!');
    console.log(`- Sales Orders: ${dataset.salesOrders.length}`);
    console.log(`- Workcenters: ${dataset.workcenters.length}`);
    console.log(`- Planned Blocks: ${plan.length}`);
    console.log(`- Production Records: ${dataset.productionRecords.length}`);
    console.log(`- Raw Material POs: ${dataset.rawMaterialPOs.length}`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('Seeding failed:', err.message);
    if (err.message.includes('whitelisted') || err.message.includes('connect to any servers')) {
      console.error('\n--> MongoDB Atlas IP Whitelist Requirement:');
      console.error('    Please log into cloud.mongodb.com -> Network Access -> Add IP Address: 0.0.0.0/0 (Allow from anywhere).');
    }
    process.exit(1);
  }
}

seed();
