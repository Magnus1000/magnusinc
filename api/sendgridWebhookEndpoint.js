const cors = require('cors')();
const { createClient } = require('@supabase/supabase-js');

// Access Vercel environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createEvent(uuid, event_content, event_type) {
  const event_page = 'email_client'; // You can modify this as needed

  const eventData = {
    uuid,
    event_content,
    event_type,
    event_page
  };

  console.log('Event data:', eventData);

  try {
    const response = await fetch('https://magnusinc-magnus1000team.vercel.app/api/createEventSB.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const events = req.body;
      console.log('Received webhook data:', events);

      for (const event of events) {
        const email = event.email;
        const eventType = event.event;

        console.log('Processing event:', event);

        // Find the corresponding UUID
        const { data, error } = await supabase
          .from('event_logs')
          .select('uuid')
          .eq('event_type', 'email_capture')
          .eq('event_content', JSON.stringify({ email }))
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching UUID:', error);
          continue;
        }

        if (data && data.length > 0) {
          const uuid = data[0].uuid;
          console.log(`Found UUID: ${uuid} for email: ${email}`);
          await createEvent(uuid, JSON.stringify(event), `email_${eventType}`);
        } else {
          console.error(`No matching UUID found for email: ${email}`);
        }
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};