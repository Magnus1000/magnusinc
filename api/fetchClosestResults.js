// /api/fetchClosestResults.js
const axios = require('axios');
const cors = require('cors')();
const { getDistance } = require('geolib');

module.exports = (req, res) => {
  cors(req, res, async () => {
    const { lat, lng } = req.query;

    try {
      const response = await axios.get(`https://api.airtable.com/v0/${process.env.AIRTABLE_APP_ID}/${process.env.AIRTABLE_TABLE_NAME}`, {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
      });

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

      records.sort((a, b) => a.distance - b.distance);

      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching data from Airtable' });
    }
  });
};