const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Test the connection (optional)
transporter.verify(function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email service is ready to send messages');
    }
});

module.exports = transporter;