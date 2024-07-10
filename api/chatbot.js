// api/chatbot.js
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = async (req, res) => {
  const { input, messages } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
        { role: 'user', content: input },
      ],
    });

    res.status(200).json(response.data.choices[0].message);
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error);
    res.status(500).json({ error: 'Error fetching response from OpenAI' });
  }
};
