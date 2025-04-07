/**
 * Script to fix WorkingHours collection by removing duplicate entries and fixing indexes
 * 
 * Run with: node scripts/fix-working-hours.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection string from env
const DB_CONNECTION = process.env.DB_CONNECTION_STR;

if (!DB_CONNECTION) {
  console.error('DB_CONNECTION_STR not found in .env file');
  process.exit(1);
}

async function fixWorkingHours() {
  console.log('Starting working hours fix script...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(DB_CONNECTION, {
      useNewUrlParser: true,
    });
    console.log('Connected to MongoDB');

    // Get direct collection reference (without schemas/models)
    const workingHoursCollection = mongoose.connection.db.collection('workinghours');
    
    // 1. Find and log duplicate entries
    console.log('Checking for duplicates...');
    const duplicates = await workingHoursCollection.aggregate([
      {
        $group: {
          _id: { 
            date: "$date", 
            staff: "$staff" 
          },
          count: { $sum: 1 },
          docs: { $push: "$_id" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();

    console.log(`Found ${duplicates.length} duplicate groups`);
    
    // 2. Remove duplicate entries (keep the most recent one in each group)
    let removedCount = 0;
    
    for (const group of duplicates) {
      console.log(`Processing group: ${JSON.stringify(group._id)}`);
      
      // Keep the most recent document (assumed to be the last one)
      const docsToRemove = group.docs.slice(0, -1);
      
      for (const docId of docsToRemove) {
        await workingHoursCollection.deleteOne({ _id: docId });
        removedCount++;
      }
    }
    
    console.log(`Removed ${removedCount} duplicate documents`);

    // 3. Drop all problematic indexes
    console.log('Fixing indexes...');
    const indexes = await workingHoursCollection.indexes();
    
    for (const index of indexes) {
      if (index.name === 'date_1_staff_1' || 
         (index.key && index.key.date && index.key.staff && !index.name.startsWith('_'))) {
        console.log(`Dropping index: ${index.name}`);
        await workingHoursCollection.dropIndex(index.name);
      }
    }

    // 4. Create new proper indexes
    console.log('Creating new indexes...');
    await workingHoursCollection.createIndex({ date: 1 });
    await workingHoursCollection.createIndex({ staff: 1 });
    
    // Create unique compound index only for staff-specific entries
    await workingHoursCollection.createIndex(
      { date: 1, staff: 1 }, 
      { 
        unique: true,
        sparse: true,
        partialFilterExpression: { staff: { $exists: true, $ne: null } }
      }
    );
    
    console.log('Indexes fixed successfully');
    
    // 5. Verify the fix
    const newDuplicates = await workingHoursCollection.aggregate([
      {
        $group: {
          _id: { 
            date: "$date", 
            staff: "$staff" 
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();

    if (newDuplicates.length > 0) {
      console.warn(`Warning: Still found ${newDuplicates.length} duplicate groups after fix`);
      console.log('These are likely global entries (staff: null) which are allowed to have duplicates');
    } else {
      console.log('Verification successful - no unexpected duplicates found');
    }
    
    console.log('Fix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing working hours:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the fix script
fixWorkingHours().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
}); 