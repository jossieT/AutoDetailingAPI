const nodemailer = require('nodemailer');
require('dotenv').config();

const adminTransporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
        user: process.env.ADMINEMAIL_USER,
        pass: process.env.ADMINEMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false // Only if facing certificate issues
    }
});

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: true, // Required for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

// Test the connection (optional)
transporter.verify(function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log('Client Email service is ready to send messages');
    }
});

adminTransporter.verify(function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log('Admin Email service is ready to send messages');
    }
});

module.exports = { transporter, adminTransporter };