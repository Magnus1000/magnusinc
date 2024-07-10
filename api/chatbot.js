// api/chatbot.js
const axios = require('axios');

module.exports = async (req, res) => {
  const { input, messages } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
          { role: 'user', content: input },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(response.data.choices[0].message);
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error);
    res.status(500).json({ error: 'Error fetching response from OpenAI' });
  }
};
