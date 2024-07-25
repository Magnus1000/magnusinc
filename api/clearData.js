import { createClient } from '@supabase/supabase-js'
const cors = require('cors')();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

module.exports = (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { uuid } = req.body

    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' })
    }

    console.log(`Received request to archive data for UUID: ${uuid}`);

    try {
      // Update all records for the given UUID
      const { data, error } = await supabase
        .from('event_logs')
        .update({ archive: true })
        .eq('uuid', uuid)

      if (error) throw error

      console.log(`Successfully archived records for UUID: ${uuid}. Affected rows: ${data.length}`);

      return res.status(200).json({ message: 'Records archived successfully', affected_rows: data.length })
    } catch (error) {
      console.error('Error updating records:', error)
      return res.status(500).json({ error: 'Failed to update records' })
    }
  });
};