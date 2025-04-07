/**
 * MongoDB direct commands to fix working hours indexes
 * 
 * How to use:
 * 1. Save this file
 * 2. Run MongoDB CLI: mongo
 * 3. Execute this script: load("scripts/direct-fix.js")
 * 
 * Alternatively, you can copy-paste these commands directly in the MongoDB shell
 */

// Switch to your database (replace with your actual database name)
// db = db.getSiblingDB("carDetailingService");

// Print current indexes for verification
print("\nCurrent indexes:");
db.workinghours.getIndexes().forEach(idx => {
  print(JSON.stringify(idx));
});

// Drop all existing indexes except _id
print("\nDropping indexes...");
db.workinghours.getIndexes().forEach(idx => {
  if (idx.name !== "_id_") {
    try {
      print(`Dropping index: ${idx.name}`);
      db.workinghours.dropIndex(idx.name);
    } catch (e) {
      print(`Error dropping index ${idx.name}: ${e.message}`);
    }
  }
});

// Create new indexes
print("\nCreating new indexes...");

// Simple date index
try {
  print("Creating date index");
  db.workinghours.createIndex(
    { date: 1 },
    { name: "date_1" }
  );
} catch (e) {
  print(`Error creating date index: ${e.message}`);
}

// Simple staff index
try {
  print("Creating staff index");
  db.workinghours.createIndex(
    { staff: 1 },
    { name: "staff_1" }
  );
} catch (e) {
  print(`Error creating staff index: ${e.message}`);
}

// Special compound index with partial filter
try {
  print("Creating compound index");
  db.workinghours.createIndex(
    { date: 1, staff: 1 },
    { 
      name: "date_1_staff_1_unique",
      unique: true,
      sparse: true,
      partialFilterExpression: { staff: { $exists: true, $ne: null } }
    }
  );
} catch (e) {
  print(`Error creating compound index: ${e.message}`);
}

// Print updated indexes for verification
print("\nUpdated indexes:");
db.workinghours.getIndexes().forEach(idx => {
  print(JSON.stringify(idx));
});

print("\nIndex repair finished!");

// Find potential duplicate entries (global working hours)
print("\nChecking for duplicate entries:");
const duplicates = db.workinghours.aggregate([
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

print(`Found ${duplicates.length} duplicate groups`);

if (duplicates.length > 0) {
  print("\nWarning: Found duplicate entries. This could cause issues.");
  print("Run the following commands to deduplicate them:");
  
  duplicates.forEach((group, i) => {
    print(`\n// Group ${i+1}: ${JSON.stringify(group._id)}`);
    print(`// Found ${group.count} duplicates`);
    
    // Print IDs of duplicate documents except the last one (to keep)
    const docsToRemove = group.docs.slice(0, -1); 
    
    docsToRemove.forEach(docId => {
      print(`db.workinghours.deleteOne({ _id: ObjectId("${docId}") });`);
    });
  });
} 