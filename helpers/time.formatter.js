// Convert "HH:mm AM/PM" string to Date object
const parseAMPM = (timeString) => {
    // Add defensive checks
    if (!timeString) {
        console.error('parseAMPM received invalid time string:', timeString);
        return new Date(); // Return current time as fallback
    }
    
    try {
        const [time, period] = timeString.split(' ');
        
        // Validate that both parts exist
        if (!time || !period) {
            console.error('Invalid time format (missing time or period):', timeString);
            return new Date();
        }
        
        const [hours, minutes] = time.split(':');
        
        // Validate that hours and minutes are numbers
        if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) {
            console.error('Invalid time format (hours/minutes not numeric):', timeString);
            return new Date();
        }
        
        let hours24 = parseInt(hours);
        
        if (period === 'PM' && hours24 !== 12) hours24 += 12;
        if (period === 'AM' && hours24 === 12) hours24 = 0;
        
        const date = new Date();
        date.setHours(hours24, parseInt(minutes), 0, 0);
        return date;
    } catch (error) {
        console.error('Error parsing time string:', timeString, error);
        return new Date(); // Return current time as fallback
    }
};

// Convert Date object to "HH:mm AM/PM" format
// Format Date object into AM/PM time string
const formatAMPM = (date) => {
    // Add defensive check for invalid date
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error('formatAMPM received invalid date:', date);
        return '12:00 PM'; // Return default time as fallback
    }
    
    try {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours || 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    } catch (error) {
        console.error('Error formatting date:', date, error);
        return '12:00 PM'; // Return default time as fallback
    }
};

module.exports = {
    parseAMPM,
    formatAMPM
}