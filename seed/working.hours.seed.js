const mongoose = require('mongoose');
const WorkingHours = require('../model/working.hours.model');
const config = require('../config/config');

// MongoDB connection
mongoose.connect(config.db_connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// const seedWorkingHours = async () => {
//     const workingHours = new WorkingHours({
//         startTime: '06:00',
//         endTime: '17:00',
//         intervalMinutes: 30,
//     });

//     await workingHours.save();
//     console.log('Working hours seeded');
//     mongoose.disconnect();
// };

const generateTimeSlots = (startTime, endTime, intervalMinutes) => {
    const slots = [];
    let current = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);


    while (current < end) {
        const hours = current.getHours();
        const minutes = current.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedTime = `${formattedHours}:${minutes} ${period}`;
        slots.push(formattedTime);
        current.setMinutes(current.getMinutes() + intervalMinutes);
    }
    return slots;
};

const seedWorkingHours = async () => {
    const startTime = '06:00';
    const endTime = '17:00';
    const intervalMinutes = 30;

    // Generate time slots
    const timeSlots = generateTimeSlots(startTime, endTime, intervalMinutes);

    // Seed data with time slots
    const workingHours = new WorkingHours({
        startTime,
        endTime,
        intervalMinutes,
        timeSlots, // Store the generated time slots
    });

    await workingHours.save();
    console.log('Working hours seeded with time slots');
    mongoose.disconnect();
};
seedWorkingHours();