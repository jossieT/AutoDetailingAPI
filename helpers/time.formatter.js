// Convert "HH:mm AM/PM" string to Date object
const parseAMPM = (timeString) => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    let hours24 = parseInt(hours);
    
    if (period === 'PM' && hours24 !== 12) hours24 += 12;
    if (period === 'AM' && hours24 === 12) hours24 = 0;
    
    const date = new Date();
    date.setHours(hours24, parseInt(minutes), 0, 0);
    return date;
};

// Convert Date object to "HH:mm AM/PM" format
// Format Date object into AM/PM time string
const formatAMPM = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours || 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
};

module.exports = {
    parseAMPM,
    formatAMPM
}