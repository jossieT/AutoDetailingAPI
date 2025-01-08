//const bcrypt = require('bcrypt');
const User = require('./model/user.model'); // Adjust the path to your User model

/**
 * Function to create an initial admin account if none exists
 */
const createInitialAdmin = async () => {
    try {
        // Check if an admin already exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Admin account already exists. Skipping admin creation.');
            return;
        }

        // Get admin details from environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Super Admin';

        if (!adminEmail || !adminPassword) {
            throw new Error(
                'Environment variables ADMIN_EMAIL and ADMIN_PASSWORD must be set to create an admin account.'
            );
        }

        // Hash the admin password
        //const hashedPassword = await bcrypt.hash(adminPassword, 8);

        // Create the admin account
        const admin = new User({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
        });

        await admin.save();
        console.log('Initial admin account created successfully.');
    } catch (error) {
        console.error('Error creating initial admin account:', error.message);
    }
};

module.exports = createInitialAdmin;
