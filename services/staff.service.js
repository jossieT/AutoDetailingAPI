const User = require('../model/user.model');
const Booking = require('../model/booking.model');

//Get All staff list
const staffList = async () =>{
    const staffs = User.find({});
    if(!staffs) {
        throw new Error('Staff List empty');
    }

    return staffs;
}
// Add new staff
const addStaff = async (data) => {
  const { name, email, password, phone } = data;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('Email is already in use');

  // Create a new staff member
  const newStaff = await User.create({ name, email, password, phone, role: 'staff' });
  return newStaff;
};

// Edit staff details
const editStaff = async (staffId, data) => {
  const updatedStaff = await User.findByIdAndUpdate(staffId, data, { new: true, runValidators: true });
  if (!updatedStaff) throw new Error('Staff not found');
  return updatedStaff;
};

// Delete staff
const deleteStaff = async (staffId) => {
  const deletedStaff = await User.findByIdAndDelete(staffId);
  if (!deletedStaff) throw new Error('Staff not found');
  return deletedStaff;
};

// Get bookings assigned to a staff member
const getStaffBookings = async (staffId) => {
  const staff = await User.findById(staffId);
  if (!staff || staff.role !== 'staff') throw new Error('Staff not found');

  const bookings = await Booking.find({ assignedTo: staffId });
  return bookings;
};

module.exports = { addStaff, editStaff, deleteStaff, getStaffBookings, staffList };
