const cors = require('cors')();
const { createClient } = require('@supabase/supabase-js');

// Access Vercel environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = (req, res) => {
  cors(req, res, async () => {
    try {
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('services') // Replace with your actual table name
        .select('service_name, problem_description, solution_description') 
      if (error) {
        throw error;
      }

      console.log(`Received response from Supabase: ${JSON.stringify(data)}`);

      // Return the fetched data as JSON
      res.json(data);
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while fetching data from Supabase' });
    }
  });
};