// Database Fix Script - Run once to fix index issues
// Usage: node src/scripts/fix-indexes.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    const db = mongoose.connection.db;
    const proposals = db.collection('proposals');
    
    // Get current indexes
    const indexes = await proposals.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Drop problematic old index
    for (const idx of indexes) {
      if (idx.name === 'rfp_1_vendor_1') {
        console.log('Dropping old index: rfp_1_vendor_1');
        await proposals.dropIndex('rfp_1_vendor_1');
        console.log('✓ Old index dropped');
      }
    }
    
    // Optionally clear all proposals to start fresh
    // const count = await proposals.countDocuments();
    // if (count > 0) {
    //   console.log(`Deleting ${count} old proposals...`);
    //   await proposals.deleteMany({});
    //   console.log('✓ Proposals cleared');
    // }
    
    // Create correct index
    console.log('Creating correct index: rfp_1_vendorEmail_1');
    await proposals.createIndex(
      { rfp: 1, vendorEmail: 1 }, 
      { unique: true, name: 'rfp_1_vendorEmail_1' }
    );
    console.log('✓ Correct index created');
    
    // Verify
    const newIndexes = await proposals.indexes();
    console.log('Updated indexes:', newIndexes.map(i => i.name));
    
    console.log('\n✅ Database fix complete!');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixIndexes();
