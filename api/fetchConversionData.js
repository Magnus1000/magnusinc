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

      // Count unique users for each event type
      const eventTypeCounts = {};
      const uniqueUsers = new Set();

      data.forEach(record => {
        uniqueUsers.add(record.uuid);
        if (!eventTypeCounts[record.event_type]) {
          eventTypeCounts[record.event_type] = new Set();
        }
        eventTypeCounts[record.event_type].add(record.uuid);
      });

      // Calculate the total number of unique users
      const totalUsers = uniqueUsers.size;

      // Calculate the percentage of users for each event type
      const eventTypePercentages = {};
      Object.keys(eventTypeCounts).forEach(eventType => {
        const count = eventTypeCounts[eventType].size;
        eventTypePercentages[eventType] = (count / totalUsers) * 100;
      });

      // Ensure page_view is always 100%
      eventTypePercentages['page_view'] = 100;

      // Sort event types by percentage in descending order
      const sortedEventTypes = Object.entries(eventTypePercentages)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      res.json(sortedEventTypes);
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while fetching data from Supabase' });
    }
  });
};