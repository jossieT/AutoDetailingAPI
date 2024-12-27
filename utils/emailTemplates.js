const bookingConfirmationTemplate = (booking, serviceInfo, bookingEndTime, addOns = []) => {
    return `
    <p>Dear ${booking.clientDetails.firstName} ${booking.clientDetails.lastName},</p>
    <p>Thank you for choosing Swift Addis Mobile Car Detailing! We’ve received your booking request.</p>

    <h2>Appointment Details</h2>
    <ul>
        <li><strong>Date:</strong> ${booking.appointmentDate}</li>
        <li><strong>Time:</strong> ${booking.serviceStartingTime} - ${bookingEndTime}</li>
        <li><strong>Service Package:</strong> ${serviceInfo.map(service => service.name).join(', ')}</li>
        ${
            addOns.length > 0
            ? `<li><strong>Add-On Service:</strong> ${addOns.map(addOn => addOn.optionName).join(', ')}</li>`
            : ''
        }
    </ul>

    <p>Please note that your booking will be confirmed after we contact you to finalize the details. If you have any questions or need to update your booking, feel free to reach out to us at <strong>+251 900 0011</strong>.</p>

    <p>Thank you for trusting us with your car care needs. We’ll be in touch shortly to confirm your appointment!</p>

    <p>Best regards,</p>
    <p><strong>Swift Addis Mobile Car Detailing Team</strong></p>
    <p>📞 <em>+251 900 0011</em></p>
`;
};

const staffNotificationTemplate = (booking, staff, serviceInfo, bookingEndTime, addOns = []) => {
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
            
             ${addOns.length > 0
            ? `<li><strong>Add-On Services:</strong> 
                        <ul>
                            ${addOns.map(addOn => `
                                <li><strong>${addOn.optionName}:</strong> ${addOn.description || 'No description provided'}</li>
                            `).join('')}
                        </ul>
                       </li>`
            : ''
        }

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