// /api/fetchClosestResults.js
const axios = require('axios');
const cors = require('cors')();

module.exports = (req, res) => {
  cors(req, res, async () => {
    try {
        const response = await axios.get(`https://api.airtable.com/v0/${process.env.AIRTABLE_APP_ID}/${process.env.AIRTABLE_EVENT_TYPE_TABLE_ID}`, {
            headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
            }
        });

        console.log(`Received response from Airtable: ${JSON.stringify(response.data)}`); // Add this line

        const records = response.data.records.map(record => ({
            event_type: record.fields.event_type,
            event_order: record.fields.event_order,
            event_count: record.fields.event_count,
        }));

        res.json(records);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`); // Add this line
        res.status(500).json({ error: 'An error occurred while fetching data from Airtable' });
    }
  });
};