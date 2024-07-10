// /api/fetchClosestResults.js
const cors = require('cors')();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lbrtnalayoyzwrnthdse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicnRuYWxheW95endybnRoZHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1ODgyMjEsImV4cCI6MjAzNTE2NDIyMX0.H16NPoL9OS-7l_GoaoJ-2xKQZ-CdJ4Mo9QXpM-6YRfY';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = (req, res) => {
  cors(req, res, async () => {
    try {
      const { data, error } = await supabase
        .from('event_logs') // Replace with your actual table name
        .select('event_type');

      if (error) {
        throw error;
      }

      console.log(`Received response from Supabase: ${JSON.stringify(data)}`);

      // Aggregate the data by event_type
      const eventTypeCounts = data.reduce((acc, record) => {
        acc[record.event_type] = (acc[record.event_type] || 0) + 1;
        return acc;
      }, {});

      // Calculate the total number of users (page_view count)
      const totalUsers = eventTypeCounts['page_view'] || 1; // Default to 1 to avoid division by zero

      // Calculate the percentage of users for each event type
      const eventTypePercentages = Object.keys(eventTypeCounts).reduce((acc, eventType) => {
        if (eventType !== 'page_view') {
          acc[eventType] = (eventTypeCounts[eventType] / totalUsers) * 100;
        }
        return acc;
      }, {});

      res.json(eventTypePercentages);
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while fetching data from Supabase' });
    }
  });
};