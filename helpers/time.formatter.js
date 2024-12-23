// Convert "HH:mm AM/PM" string to Date object
const parseAMPM = (timeString) => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return new Date(1970, 0, 1, hours, minutes);
};

// Convert Date object to "HH:mm AM/PM" format
// Format Date object into AM/PM time string
const formatAMPM = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
};

module.exports = {
    parseAMPM,
    formatAMPM
}