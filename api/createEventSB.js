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
        
            // Log environment variables to ensure they are loaded correctly
            console.log('Supabase URL:', process.env.SUPABASE_URL);
            console.log('Supabase Key:', process.env.SUPABASE_KEY);

            // Initialize Supabase client
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        
            try {
                // Insert a new record in the event_logs table
                const { data: newRecord, error: insertError } = await supabase
                    .from('event_logs')
                    .insert([
                        { uuid_text: uuid, uuid },
                    ]);

                // Log the full response from Supabase
                console.log('Supabase response:', { newRecord, insertError });

                if (insertError) {
                    console.error('Supabase insert error:', insertError);
                    throw new Error(JSON.stringify(insertError));
                }

                console.log('Record created successfully:', newRecord);

                res.status(200).json({ message: 'Record created successfully' });
            } catch (error) {
                console.error('Error details:', error);
                res.status(500).json({ error: error.message || 'Internal Server Error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
