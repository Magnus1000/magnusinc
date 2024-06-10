const axios = require('axios');
const cors = require('cors');
const Airtable = require('airtable');

const corsHandler = cors();

module.exports = async (req, res) => {
    try {
        console.log('Inside the serverless function...');
        console.log('Request body:', req.body);

        corsHandler(req, res, async () => {
            let { uuid, event_content, event_type, event_page } = req.body;

            // Generate event time in ISO format
            const event_time = new Date().toISOString();
        
            // Initialize Airtable with your base ID and API key
            const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_APP_ID);
        
            try {
                // Check if the UUID exists in the UUID table
                const records = await base(process.env.AIRTABLE_UUID_TABLE_ID).select({
                    filterByFormula: `{UUID} = '${uuid}'`,
                }).firstPage();

                // If the UUID doesn't exist, create a new record in the UUID table
                if (records.length === 0) {
                    const newRecord = await base(process.env.AIRTABLE_USER_TABLE_ID).create([
                        { fields: { UUID: uuid } },
                    ]);
                    uuid = newRecord[0].id;
                } else {
                    uuid = records[0].id;
                }

                // Create a new record in the specified table
                await base(process.env.AIRTABLE_EVENT_LOG_TABLE_ID).create([
                    {
                        fields: {
                            uuid: [uuid],
                            event_content,
                            event_time,
                            event_type,
                            event_page
                        },
                    },
                ]);
        
                res.status(200).json({ message: 'Record created successfully' });
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};