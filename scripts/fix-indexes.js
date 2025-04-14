/**
 * A simple script to fix MongoDB indexes for the working hours collection
 * This should be run if you encounter duplicate key errors (E11000)
 * 
 * Usage: node scripts/fix-indexes.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection string 
const DB_CONNECTION = process.env.DB_CONNECTION_STR || process.env.DB_CONNECTION;

if (!DB_CONNECTION) {
  console.error('DB_CONNECTION_STR or DB_CONNECTION not found in .env file');
  process.exit(1);
}

async function dropIndexIfExists(collection, indexName) {
  try {
    await collection.dropIndex(indexName);
    console.log(`Dropped index: ${indexName}`);
    return true;
  } catch (error) {
    if (error.code === 27 || error.message.includes('index not found')) {
      console.log(`Index ${indexName} does not exist, nothing to drop`);
      return false;
    }
    // For other errors, rethrow
    throw error;
  }
}

async function createIndexSafely(collection, keys, options = {}) {
  const indexName = Object.keys(keys).map(key => `${key}_${keys[key]}`).join('_');
  
  try {
    // Try to drop any existing index with this name first
    try {
      await collection.dropIndex(indexName);
      console.log(`Dropped existing index: ${indexName} before recreating`);
    } catch (error) {
      // Ignore index not found errors
      if (!(error.code === 27 || error.message.includes('index not found'))) {
        console.log(`Warning: ${error.message}`);
      }
    }
    
    // Create the index with a specific name to avoid conflicts
    const fullOptions = { 
      ...options,
      name: indexName
    };
    
    await collection.createIndex(keys, fullOptions);
    console.log(`Created index: ${indexName}`);
    return true;
  } catch (error) {
    console.error(`Failed to create index ${indexName}:`, error.message);
    return false;
  }
}

async function fixIndexes() {
  console.log('Starting index fix script...');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_CONNECTION, {
      useNewUrlParser: true,
    });
    console.log('Connected successfully');

    // Get direct collection reference
    const workingHoursCollection = mongoose.connection.db.collection('workinghours');
    
    // List all current indexes
    console.log('Current indexes:');
    const currentIndexes = await workingHoursCollection.indexes();
    currentIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    // Drop all existing indexes except _id
    console.log('\nDropping all existing indexes (except _id)...');
    for (const index of currentIndexes) {
      if (index.name !== '_id_') {
        await dropIndexIfExists(workingHoursCollection, index.name);
      }
    }
    
    // Create new indexes
    console.log('\nCreating new indexes...');
    
    // Simple indexes first
    console.log('Creating date index...');
    await createIndexSafely(workingHoursCollection, { date: 1 });
    
    console.log('Creating staff index...');
    await createIndexSafely(workingHoursCollection, { staff: 1 });
    
    // Create special compound index that allows multiple null staff values
    console.log('Creating special compound index...');
    await createIndexSafely(
      workingHoursCollection,
      { date: 1, staff: 1 }, 
      { 
        unique: true,
        sparse: true,
        partialFilterExpression: { staff: { $exists: true, $ne: null } }
      }
    );
    
    // Verify the new indexes
    console.log('\nNew indexes:');
    const newIndexes = await workingHoursCollection.indexes();
    newIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(unique)' : ''}`);
    });
    
    console.log('\nIndexes fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
fixIndexes().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
}); 