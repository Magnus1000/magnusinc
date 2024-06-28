const axios = require('axios');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const corsHandler = cors();

module.exports = async (req, res) => {
    try {
        console.log('Inside the serverless function...');
        console.log('Request body:', req.body);

        corsHandler(req, res, async () => {
            let { uuid, event_content, event_type, event_page } = req.body;

            // Generate event time in ISO format
            const event_time = new Date().toISOString();
        
            // Initialize Supabase client
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        
            try {
                // Insert a new record in the event_logs table
                const { data: newRecord, error: insertError } = await supabase
                    .from('event_logs')
                    .insert([
                        { uuid, event_content, event_time, event_type, event_page },
                    ]);

                if (insertError) throw insertError;

                console.log('Record created successfully:', newRecord[0].id);

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