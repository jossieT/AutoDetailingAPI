const mongoose = require('mongoose');
const WorkingHours = require('../model/working.hours.model');
const config = require('../config/config');

// MongoDB connection
mongoose.connect(config.db_connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedWorkingHours = async () => {
    const workingHours = new WorkingHours({
        startTime: '06:00',
        endTime: '14:00',
        intervalMinutes: 30,
    });

    await workingHours.save();
    console.log('Working hours seeded');
    mongoose.disconnect();
};

seedWorkingHours();