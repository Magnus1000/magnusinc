// /api/fetchClosestResults.js
const axios = require('axios');
const cors = require('cors')();
const { getDistance } = require('geolib');

module.exports = (req, res) => {
  cors(req, res, async () => {
    const { lat, lng } = req.query;
    console.log(`Received request with lat: ${lat}, lng: ${lng}`); // Add this line

    try {
      const response = await axios.get(`https://api.airtable.com/v0/${process.env.AIRTABLE_APP_ID}/${process.env.AIRTABLE_TABLE_ID}`, {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
      });

      console.log(`Received response from Airtable: ${JSON.stringify(response.data)}`); // Add this line

      const records = response.data.records.map(record => ({
        image: record.fields.image,
        dealer: record.fields.dealer,
        name: record.fields.name,
        value: record.fields.value,
        distance: getDistance(
          { latitude: lat, longitude: lng },
          { latitude: record.fields.lat, longitude: record.fields.lng }
        )
      }));

      console.log(`Mapped records: ${JSON.stringify(records)}`); // Add this line

      records.sort((a, b) => a.distance - b.distance);

      console.log(`Sorted records: ${JSON.stringify(records)}`); // Add this line

      res.json(records);
    } catch (error) {
      console.error(`An error occurred: ${error.message}`); // Add this line
      res.status(500).json({ error: 'An error occurred while fetching data from Airtable' });
    }
  });
};