const OpenAI = require("openai");
const cors = require('cors');

// Initialize the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  apiVersion: 'v1',
});

// Initialize the CORS middleware
const corsHandler = cors();

module.exports = async (req, res) => {
  corsHandler(req, res, async () => {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { input, messages } = req.body || {};

    // Log the request body
    console.log('Request body:', req.body);

    if (!input || !messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    console.log('Request received');
    console.log('Input:', input);
    console.log('Messages:', JSON.stringify(messages));

    try {
      // Create the chat completion request
      console.log('Sending request to OpenAI...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4', // or 'gpt-3.5-turbo' if you prefer
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
          { role: 'user', content: input },
        ],
      });

      console.log('Response received from OpenAI');
      console.log('Response:', JSON.stringify(completion.choices[0]));

      // Send the response back to the client
      res.status(200).json(completion.choices[0].message);
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error.message);
      res.status(500).json({ error: 'Error fetching response from OpenAI', message: error.message });
    }
  });
};