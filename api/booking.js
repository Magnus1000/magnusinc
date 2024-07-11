// /api/fetchClosestResults.js
const axios = require('axios');
const cors = require('cors')();

module.exports = (req, res) => {
  cors(req, res, async () => {
    const { lat, lng } = req.query;

    try {
      // First API call to fetch services
      const servicesResponse = await axios.get(`https://api.airtable.com/v0/${process.env.AIRTABLE_APP_ID}/${process.env.AIRTABLE_SERVICES_TABLE}`, {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
      });

      console.log(`Received response from Airtable (Services): ${JSON.stringify(servicesResponse.data)}`);

      const services = servicesResponse.data.records.map(record => ({
        service_name: record.fields.service_name,
        service_description: record.fields.service_description,
      }));

      console.log(`Mapped services: ${JSON.stringify(services)}`);

      // Second API call to fetch booking slots
      const slotsResponse = await axios.get(`https://api.airtable.com/v0/${process.env.AIRTABLE_APP_ID}/${process.env.AIRTABLE_CALENDAR_TABLE}`, {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
      });

      console.log(`Received response from Airtable (Slots): ${JSON.stringify(slotsResponse.data)}`);

      const bookingSlots = slotsResponse.data.records.map(record => ({
        slot_name: record.fields.slot_name,
        slot_date_time: record.fields.slot_date_time,
        slot_availability: record.fields.slot_availability,
      }));

      console.log(`Mapped booking slots: ${JSON.stringify(bookingSlots)}`);

      // Combine the results
      res.json({ services, bookingSlots });
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while fetching data from Airtable' });
    }
  });
};