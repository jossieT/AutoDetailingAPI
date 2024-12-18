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


console.log(parseAMPM("12:00 AM")); // Should output: 1970-01-01T00:00:00
console.log(parseAMPM("12:00 PM")); // Should output: 1970-01-01T12:00:00
console.log(parseAMPM("01:00 PM")); // Should output: 1970-01-01T13:00:00
console.log(parseAMPM("01:00 AM")); // Should output: 1970-01-01T01:00:00
console.log(parseAMPM("11:59 PM")); // Should output: 1970-01-01T23:59:00
console.log(parseAMPM("11:59 AM")); // Should output: 1970-01-01T11:59:00

console.log(formatAMPM(new Date('1970-01-01T00:00:00'))); // Should output: "12:00 AM"
console.log(formatAMPM(new Date('1970-01-01T12:00:00'))); // Should output: "12:00 PM"
console.log(formatAMPM(new Date('1970-01-01T13:00:00'))); // Should output: "1:00 PM"
console.log(formatAMPM(new Date('1970-01-01T01:00:00'))); // Should output: "1:00 AM"
console.log(formatAMPM(new Date('1970-01-01T11:59:00'))); // Should output: "11:59 AM"
console.log(formatAMPM(new Date('1970-01-01T23:59:00'))); // Should output: "11:59 PM"


module.exports = {
    parseAMPM,
    formatAMPM
}