const axios = require('axios');
const cors = require('cors');
const Airtable = require('airtable');

const corsHandler = cors();

module.exports = async (req, res) => {
    console.log('Inside the serverless function...');
    console.log('Request body:', req.body);

    // Handle CORS
    corsHandler(req, res, async () => {
        try {
            // Destructure request body
            let { uuid, event_content, event_type, event_page } = req.body;

            // Generate event time in ISO format
            const event_time = new Date().toISOString();

            // Initialize Airtable with your base ID and API key from Vercel environment variables
            const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_APP_ID);

            // Create a new record in the specified table
            await base(process.env.AIRTABLE_EVENT_LOG_TABLE_ID).create([
                {
                    fields: {
                        uuid_text: uuid, // Ensure this is an array of record IDs if needed
                        event_content,
                        event_time,
                        event_type,
                        event_page
                    },
                },
            ]);

            // Send success response
            res.status(200).json({ message: 'Record created successfully' });
        } catch (error) {
            // Log the error and send an error response
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};