const axios = require('axios');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const corsHandler = cors();

module.exports = async (req, res) => {
    corsHandler(req, res, async () => {
        // Initialize Supabase client
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

        console.log('Request body:', req.body);

        // Extract parameters from request body
        const { uuid, event_content, event_type, event_page } = req.body;

        try {
            // Check if user exists in the "users" table
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', uuid)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                // Handle errors other than "no rows returned"
                console.error('Supabase user check error:', userError);
                throw new Error(JSON.stringify(userError));
            }

            // If user does not exist, create one
            if (!user) {
                const { data: newUser, error: newUserError } = await supabase
                    .from('users')
                    .insert([{ uuid: uuid }]);

                if (newUserError) {
                    console.error('Supabase user creation error:', newUserError);
                    throw new Error(JSON.stringify(newUserError));
                }

                console.log('User created successfully:', newUser);
            }

            // Insert a new record in the event_logs table
            const { data: newRecord, error: insertError } = await supabase
                .from('event_logs')
                .insert([
                    { 
                        uuid: uuid,
                        event_content: event_content,
                        event_type: event_type,
                        event_page: event_page
                    },
                ]);

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
};
