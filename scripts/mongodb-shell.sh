#!/bin/bash
# MongoDB shell script to connect to your database using Docker
# This script allows you to run MongoDB commands directly

# Load environment variables from .env file
if [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
else
  echo "Error: .env file not found in parent directory"
  exit 1
fi

# Check if MongoDB connection string is available
if [ -z "$DB_CONNECTION_STR" ] && [ -z "$DB_CONNECTION" ]; then
  echo "Error: DB_CONNECTION_STR or DB_CONNECTION not found in .env file"
  exit 1
fi

# Use the available connection string
if [ -n "$DB_CONNECTION_STR" ]; then
  CONNECTION_STRING=$DB_CONNECTION_STR
else
  CONNECTION_STRING=$DB_CONNECTION
fi

echo "Connecting to MongoDB using Docker..."
echo ""
echo "Use the following commands to fix the working hours indexes:"
echo ""
echo "// Show all indexes in the workinghours collection"
echo "db.workinghours.getIndexes()"
echo ""
echo "// Drop the problematic compound index"
echo "db.workinghours.dropIndex('date_1_staff_1')"
echo ""
echo "// Create new indexes"
echo "db.workinghours.createIndex({ date: 1 })"
echo "db.workinghours.createIndex({ staff: 1 })"
echo "db.workinghours.createIndex({ date: 1, staff: 1 }, { unique: true, sparse: true, partialFilterExpression: { staff: { \$exists: true, \$ne: null } } })"
echo ""
echo "// Show indexes again to verify"
echo "db.workinghours.getIndexes()"
echo ""
echo "Starting MongoDB shell..."

# Run MongoDB shell through Docker
docker run --rm -it mongo:latest mongosh "$CONNECTION_STRING" 