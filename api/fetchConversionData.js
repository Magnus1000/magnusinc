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
        .from('event_logs') // Replace with your actual table name
        .select('uuid, event_type');

      if (error) {
        throw error;
      }

      console.log(`Received response from Supabase: ${JSON.stringify(data)}`);

      // Count unique events by uuid and event_type
      const eventTypeCounts = {};
      data.forEach(record => {
        const key = `${record.uuid}_${record.event_type}`;
        if (!eventTypeCounts[key]) {
          eventTypeCounts[key] = 1;
        }
      });

      // Aggregate the counts by event_type
      const aggregatedEventTypeCounts = {};
      Object.keys(eventTypeCounts).forEach(key => {
        const eventType = key.split('_')[1];
        aggregatedEventTypeCounts[eventType] = (aggregatedEventTypeCounts[eventType] || 0) + 1;
      });

      // Calculate the total number of unique users (page_view count)
      const totalUsers = aggregatedEventTypeCounts['page_view'] || 1; // Default to 1 to avoid division by zero

      // Calculate the percentage of users for each event type
      const eventTypePercentages = {};
      Object.keys(aggregatedEventTypeCounts).forEach(eventType => {
        eventTypePercentages[eventType] = (aggregatedEventTypeCounts[eventType] / totalUsers) * 100;
      });

      // Ensure page_view is always 100%
      eventTypePercentages['page_view'] = 100;

      res.json(eventTypePercentages);
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while fetching data from Supabase' });
    }
  });
};
