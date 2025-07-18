/**
 * Utility Functions
 * 
 * This module provides a set of utility functions for common tasks such as date formatting, string manipulation, object comparison,
 * array difference finding, HTML to text conversion, and sorting order transformation. These utilities are designed to simplify
 * repetitive tasks in JavaScript applications.
 */

/**
 * Checks if a value is an object.
 * 
 * @param {any} object - The value to check.
 * @returns {boolean} True if the value is an object and not null, otherwise false.
 */
const isObject = (object) => {
  return object != null && typeof object === 'object';
}

/**
 * Formats a date string into a more readable format with month, day, and time.
 * 
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string in the format "Month DD at HH:MM am/pm".
 */
export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/**
 * Formats a date string into a more detailed format including the full date and time.
 * 
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string in the format "Month DD, YYYY at HH:MM am/pm".
 */

export const formaterTime = (dateString) => {
  const date = new Date(dateString);
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return formattedTime;
}
export const formaterDate = (dateString) => {
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime).toLowerCase();
    return `${formattedDate} at ${formattedTime}`;
}
export const formaterDateOnly = (dateString) => {
  const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
  const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', optionsDate);
  const formattedTime = date.toLocaleTimeString('en-US', optionsTime).toLowerCase();
  return `${formattedDate}`;
}

export const formatDateToCustomString = (isoTimestamp) => {
  let date = new Date(isoTimestamp);
  return date.getUTCFullYear().toString() +
      String(date.getUTCMonth() + 1).padStart(2, '0') +
      String(date.getUTCDate()).padStart(2, '0') +
      String(date.getUTCHours()).padStart(2, '0') +
      String(date.getUTCMinutes()).padStart(2, '0') +
      String(date.getUTCSeconds()).padStart(2, '0');
}

export const formatPhoneNumber = (phoneNumber) => {
      
  phoneNumber = phoneNumber.replace(/\s+/g, '');

  if (phoneNumber.startsWith('+')) {
      phoneNumber = phoneNumber.slice(1);
  }
  if (phoneNumber.length === 12) {
    if (phoneNumber.startsWith("91")) {
      return phoneNumber;
    } else {
      return null;
    }
  } else if (phoneNumber.length === 10) {
    return '91' + phoneNumber;
  } else {
    return null;
  }
}

export const formatLatitude = (latitude) => {
  return latitude.toFixed(12).toString();
}

// export const formatDate = (dateString) => {
//     // Convert the ISO date string to a Date object
//     const date = new Date(dateString);

//     // Check if date is valid
//     if (isNaN(date.getTime())) {
//         throw new Error("Invalid date provided");
//     }

//     // Extract day, month, and year
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();

//     // Format as DD/MM/YYYY
//     return `${day}/${month}/${year}`;
// };

// Example usage

/**
 * Capitalizes the first letter of each word in a string.
 * 
 * @param {string} data - The string to capitalize.
 * @returns {string} The capitalized string.
 */
export const capitalizeEachWord = (data) => {
  return data.replace(/\b\w/g, (match) => match.toUpperCase());
}

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase.
 * 
 * @param {string} string - The string to capitalize.
 * @returns {string} The capitalized string.
 */
export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Compares two objects for equality, including nested objects.
 * 
 * @param {object} object1 - The first object to compare.
 * @param {object} object2 - The second object to compare.
 * @returns {boolean} True if the objects are equal, otherwise false.
 */
export const objectEqual = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  console.log('1');
  if (keys1.length !== keys2.length) {
    return false;
  }
  console.log('2');
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    console.log('3', areObjects);
    if (areObjects) {
      return false;
    }
  }
  return true;
}

/**
 * Finds differences between two arrays of objects based on `id` and `value` properties.
 * 
 * @param {array} arr1 - The first array to compare.
 * @param {array} arr2 - The second array to compare.
 * @returns {array} An array of objects that differ between the two arrays.
 */
export const findDifferenceArray = (arr1, arr2) => {
  let differences = [];

  const arr2Dict = arr2.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  arr1.forEach(item => {
    const itemInArr2 = arr2Dict[item.id];
    if (itemInArr2 && item.value !== itemInArr2.value) {
      differences.push({
        id: item.id,
        value: item.value,
      });
    }
  });

  return differences;
}

/**
 * Converts an HTML string to plain text.
 * 
 * @param {string} htmlString - The HTML string to convert.
 * @returns {string} The plain text extracted from the HTML string.
 */
export const convertHTMLToText = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  return doc.body.textContent || "";
}

/**
 * Converts a sort order string (e.g., "field asc") into a more descriptive object.
 * 
 * @param {string} input - The sort order string.
 * @returns {object} An object representing the field and sort order (e.g., { field: "Ascending" }).
 */
export const convertSortOrder = (input) => {
  const [field, order] = input[0].split(' ');
  let sortOrder = ""
  // console.log(field, order)
  if ( field === "createdAt" || field === "id" || field === "financialStatus" || field === "orderNumber" || field === "orderStatus" ) {
    sortOrder = order === 'asc' ? 'Ascending' : 'Descending'
  } else {
    sortOrder = order === 'asc' ? 'Descending' : 'Ascending';
  }
  const result = {};
  result[field] = sortOrder;
  return result;
}

/**
 * Transforms a sort order string (e.g., "field asc") into a more descriptive object.
 * 
 * @param {array} input - An array containing the sort order string.
 * @returns {object} An object representing the field and sort order (e.g., { field: "Ascending" }).
 */
export const transformSortOrder = (input) => {
  if (!input || !Array.isArray(input) || input.length === 0 || !input[0]) {
    return {};
  }

  const parts = input[0].split(' ');
  if (parts.length !== 2) {
    return {};
  }

  const [field, order] = parts;
  if (order !== 'asc' && order !== 'desc') {
    return {};
  }

  const sortOrder = order === 'asc' ? 'Ascending' : 'Descending';
  const result = {};
  result[field] = sortOrder;
  return result;
}



// export const getLatLong = async (address) => {
//     // Replace YOUR_GOOGLE_MAPS_API_KEY with your actual Google Maps Geocoding API key
//     const apiKey = 'AIzaSyAjOpQ9biCv7-OHpp9nn0KAIzAWVKn_3UI'; // Add your API key here
//     const formattedAddress = encodeURIComponent(address); // Encode the address for URL

//     // Build the Geocoding API URL
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${apiKey}`;

//     try {
//         // Make the API request
//         const response = await fetch(url);

//         // Check for a successful response
//         if (!response.ok) {
//             throw new Error('Error contacting Google Maps API');
//         }

//         // Decode the JSON response
//         const data = await response.json();

//         // Check if the response contains results
//         if (data.status === 'OK' && data.results.length > 0) {
//             // Extract latitude and longitude
//             const latitude = data.results[0].geometry.location.lat;
//             const longitude = data.results[0].geometry.location.lng;
//             return {
//                 latitude: latitude,
//                 longitude: longitude
//             };
//         } else {
//             // Handle errors, such as ZERO_RESULTS if the address is not found
//             throw new Error('Address not found or error occurred');
//         }
//     } catch (error) {
//         console.error(error);
//         return error.message; // Return error message
//     }
// };
