/**
 * Converts a UTC date string from the backend to a local Date object
 * The backend sends dates in UTC format, and we need to ensure they're properly converted
 */
export const parseUTCDate = (dateString) => {
  if (!dateString) return null;
  
  // If it's already a Date object, return it
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // If it's a string, ensure it's treated as UTC
  // Backend sends dates like "2024-01-01T05:15:00" or "2024-01-01T05:15:00Z"
  let dateStr = dateString;
  
  // If it doesn't end with Z, add it to indicate UTC
  if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
    // Check if it has time component
    if (dateStr.includes('T')) {
      // Add Z to indicate UTC
      dateStr = dateStr + 'Z';
    }
  }
  
  const date = new Date(dateStr);
  
  // Validate the date
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return new Date(); // Return current date as fallback
  }
  
  return date;
};

/**
 * Formats a UTC date string to local time string
 */
export const formatUTCDate = (dateString, formatStr = 'MMM dd, yyyy HH:mm') => {
  const { format } = require('date-fns');
  const date = parseUTCDate(dateString);
  return format(date, formatStr);
};

