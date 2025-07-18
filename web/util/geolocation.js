// utils/geolocation.js

const googleMapApiKey = process.env.GOOGLE_MAP_API_KEY;

export const getLatLong = async (address, logger) => {
    const formattedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${googleMapApiKey}`;

    try {
        const response = await fetch(url);
        logger.info({ status: response.status, statusText: response.statusText }, "API Response Status");

        if (!response.ok) {
            throw new Error(`Error contacting Google Maps API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        logger.info({ data }, "API Response Data");

        if (data.status !== 'OK') {
            throw new Error(`Geocoding API Error: ${data.status}. Error message: ${data.error_message || 'No details available'}`);
        }

        if (data.results.length > 0) {
            const latitude = data.results[0].geometry.location.lat;
            const longitude = data.results[0].geometry.location.lng;
            logger.info({ latitude, longitude }, "Extracted Coordinates");
            return { latitude, longitude };
        } else {
            throw new Error('No results found for the provided address');
        }
    } catch (error) {
        logger.error({ error: error.message }, "An error occurred while fetching latitude and longitude");
        return { error: error.message };
    }
};
