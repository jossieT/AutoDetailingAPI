const mongoose = require('mongoose');
const config = require('./config/config');
const http = require('http');
//const bodyParser = require('body-parser');
const app = require('./server');
const logger = require('./config/logger');
const dotenv = require('dotenv');

const createInitialAdmin = require('./adminInit');

dotenv.config();
//const { swaggerDocs } = require('./swagger');

const httpServer = http.createServer(app);

mongoose.connect(config.db_connection, {
  useNewUrlParser: true,
}).then(async () => {
  logger.info('mongoDB connection successful');
  
  // Fix WorkingHours indexes - drop and recreate
  try {
    // Reference the WorkingHours model
    const WorkingHours = mongoose.model('WorkingHours');
    
    // Get all current indexes
    const indexes = await WorkingHours.collection.indexes();
    
    // Drop problematic indexes
    const problematicIndexes = indexes.filter(index => 
      index.name === 'date_1_staff_1' || 
      (index.key && index.key.date && index.key.staff)
    );
    
    for (const index of problematicIndexes) {
      logger.info(`Dropping index: ${index.name}`);
      await WorkingHours.collection.dropIndex(index.name);
    }
    
    // Create proper indexes
    await WorkingHours.collection.createIndex({ date: 1 });
    await WorkingHours.collection.createIndex({ staff: 1 });
    
    // Create unique compound index only for staff-specific entries
    await WorkingHours.collection.createIndex(
      { date: 1, staff: 1 }, 
      { 
        unique: true,
        sparse: true,
        partialFilterExpression: { staff: { $exists: true, $ne: null } }
      }
    );
    
    logger.info('WorkingHours indexes have been fixed');
  } catch (error) {
    logger.error(`Error fixing WorkingHours indexes: ${error.message}`);
  }
  
  createInitialAdmin();
}).catch((error) => {
  logger.error(`Error occured with erro message: ${error.message}, { stack: error.stack }`);
});



const server = httpServer.listen(config.port, () => {
  logger.info(`server listening on Port ${config.port}`);
});

//swaggerDocs(app, config.port);
// Move swaggerDocs outside of the server.listen callback




const exitHandler = () => {
  if(server) {
    server.close(() => {
      logger.info('Server CLosed');
      process.exit(1);
    })
  } else {
    process.exit(1);
  }
}

const unExpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
}

process.on("uncaughtException", unExpectedErrorHandler);

process.on("unhandledRejection", unExpectedErrorHandler);
process.on("SIGTERM", () => {
  logger.info('SIGTERM Received');
  if(server) {
    server.close();
  }
})
