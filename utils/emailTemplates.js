const bookingConfirmationTemplate = (booking, serviceInfo, bookingEndTime) => {
    return `
        <h1>Booking Confirmation</h1>
        <p>Dear ${booking.clientDetails.firstName} ${booking.clientDetails.lastName},</p>
        <p>Your booking has been confirmed. Below are the details of your appointment:</p>
        <h2>Appointment Details</h2>
        <ul>
            <li><strong>Date:</strong> ${booking.appointmentDate}</li>
            <li><strong>Time:</strong> ${booking.serviceStartingTime} - ${bookingEndTime}</li>
            <li><strong>Services:</strong> ${serviceInfo.map(service => service.name).join(', ')}</li>
        </ul>
        <p>If you have any questions or need to make changes to your booking, please do not hesitate to contact us.</p>
        <p>Thank you for choosing our service. We look forward to serving you!</p>
        <p>Best regards,</p>
        <p><strong>Swift Addis Mobile Car detailing</strong></p>
        <p><em>+2519000011</em></p>
    `;
};

const staffNotificationTemplate = (booking, staff, serviceInfo, bookingEndTime) => {
    return `
        <h1>New Booking Assigned</h1>
        <p>Dear ${staff.name},</p>
        <p>A new booking has been assigned to you. Below are the details:</p>
        <h2>Client Details</h2>
        <ul>
            <li><strong>Name:</strong> ${booking.clientDetails.firstName} ${booking.clientDetails.lastName}</li>
            <li><strong>Phone:</strong> ${booking.clientDetails.phone}</li>
            <li><strong>Email:</strong> ${booking.clientDetails.email}</li>
        </ul>
        <h2>Appointment Details</h2>
        <ul>
            <li><strong>Date:</strong> ${booking.appointmentDate}</li>
            <li><strong>Time:</strong> ${booking.serviceStartingTime} - ${bookingEndTime}</li>
            <li><strong>Services:</strong> ${serviceInfo.map(service => service.name).join(', ')}</li>
        </ul>
        <h2>Location Details</h2>
        <ul>
            <li><strong>Address:</strong> ${booking.location.address}</li>
        </ul>
    `;
};

module.exports = {
    bookingConfirmationTemplate,
    staffNotificationTemplate,
};