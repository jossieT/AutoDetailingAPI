const bookingConfirmationTemplate = (booking, serviceInfo, bookingEndTime, addOns = []) => {
    return `
    <p><strong>Dear ${booking.clientDetails.firstName} ${booking.clientDetails.lastName},</strong></p>
    <p>Thank you for choosing Swift Addis Mobile Car Detailing! We’ve received your booking request.</p>

    <h2>Appointment Details</h2>
    <ul>
        <li><strong>Date:</strong> ${booking.appointmentDate}</li>
        <li><strong>Time:</strong> ${booking.serviceStartingTime} - ${bookingEndTime}</li>
        <li><strong>Service Package:</strong> ${serviceInfo.map(service => service.name.en).join(', ')}</li>
        ${
            addOns.length > 0
            ? `<li><strong>Add-On Service:</strong> ${addOns.map(addOn => addOn.optionName.en).join(', ')}</li>`
            : ''
        }
    </ul>

    <p>Please note that your booking will be confirmed after we contact you to finalize the details. If you have any questions or need to update your booking, feel free to reach out to us at one of the phone numbers specified below.</p>

    <p>Thank you for trusting us with your car care needs. We’ll be in touch shortly to confirm your appointment!</p>

    <p>Best regards,</p>
    <p><strong>Swift Addis Mobile Car Detailing Team</strong></p>
    <p>📞 <em>0987963123</em></p>
    <p>📞 <em>0995090852</em></p>
    <p>📧 <em>info@swiftaddisdetailing.com</em></p>
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
            <li><strong>Services:</strong> ${serviceInfo.map(service => service.name.en).join(', ')}</li>
            
             ${addOns.length > 0
            ? `<li><strong>Add-On Services:</strong> 
                        <ul>
                            ${addOns.map(addOn => `
                                <li><strong>${addOn.optionName.en}:</strong> ${addOn.description.en || 'No description provided'}</li>
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

const bookingApprovalTemplate = (booking, serviceInfo, bookingEndTime, addOns = []) => {
    
    return `
    <p><strong>Dear ${booking.clientDetails.firstName} ${booking.clientDetails.lastName},</strong></p>
    <p>Thank you for choosing Swift Addis Mobile Car Detailing! We are happy to confirm your appointment.</p>
    
    <p>Appointment Details Details:</p>
    <ul>
            <li><strong>Date:</strong> ${booking.appointmentDate}</li>
            <li><strong>Time:</strong> ${booking.serviceStartingTime} - ${booking.bookingEndTime}</li>
            <li><strong>Services:</strong> ${serviceInfo.map(service => service.name.en).join(', ')}</li>
            
             ${addOns.length > 0
            ? `<li><strong>Add-On Services:</strong> 
                        <ul>
                            ${addOns.map(addOn => `
                                <li><strong>${addOn.optionName.en}:</strong> ${addOn.description.en || 'No description provided'}</li>
                            `).join('')}
                        </ul>
                       </li>`
            : ''
        }
    </ul>
    <p>Our team will arrive at the scheduled time and location to provide your selected service. If you have any special instructions or need to make adjustments, please let us know at least 24 hours in advance by calling us at one of the phone numbers specified below.</p>
    
    <p><strong>We look forward to giving your car the care it deserves!</strong></p>

    <p>Best regards,</p>
    <p><strong>Swift Addis Mobile Car Detailing Team</strong></p>
    <p>📞 <em>0987963123</em></p>
    <p>📞 <em>0995090852</em></p>
    <p>📧 <em>info@swiftaddisdetailing.com</em></p>
`;
}

const bookingCancellationTemplate = (booking, serviceInfo, bookingEndTime, addOns = []) => {
    return `
     <p><strong>Dear ${booking.clientDetails.firstName} ${booking.clientDetails.lastName},</strong></p>
    <p>Thank you for choosing Swift Addis Mobile Car Detailing. Unfortunately, we are unable to accommodate your booking request at this time.</p>
    
    <p>Appointment Details Details:</p>
    <ul>
            <li><strong>Date:</strong> ${booking.appointmentDate}</li>
            <li><strong>Time:</strong> ${booking.serviceStartingTime} - ${booking.bookingEndTime}</li>
            <li><strong>Services:</strong> ${serviceInfo.map(service => service.name.en).join(', ')}</li>
            
             ${addOns.length > 0
            ? `<li><strong>Add-On Services:</strong> 
                        <ul>
                            ${addOns.map(addOn => `
                                <li><strong>${addOn.optionName.en}:</strong> ${addOn.description.en || 'No description provided'}</li>
                            `).join('')}
                        </ul>
                       </li>`
            : ''
        }
    </ul>

    <p>We sincerely apologize for any inconvenience this may cause. Please feel free to contact us at our phone numbers specified below to reschedule or to discuss alternative options that may work better for you.</p>
    
    <p><strong>We value your trust and look forward to serving you in the future.</strong></p>
    
    <p>Best regards,</p>
    <p><strong>Swift Addis Mobile Car Detailing Team</strong></p>
    <p>📞 <em>0987963123</em></p>
    <p>📞 <em>0995090852</em></p>
    <p>📧 <em>info@swiftaddisdetailing.com</em></p>
`;
}

module.exports = {
    bookingConfirmationTemplate,
    staffNotificationTemplate,
    bookingApprovalTemplate,
    bookingCancellationTemplate
};