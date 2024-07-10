// api/chatbot.js
import OpenAI from "openai";

// Initialize the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const { input, messages } = req.body;

  console.log('Request received');
  console.log('Input:', input);
  console.log('Messages:', JSON.stringify(messages));

  try {
    // Create the chat completion request
    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo' if you have access
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
    console.error('Error fetching response from OpenAI:', error);
    res.status(500).json({ error: 'Error fetching response from OpenAI' });
  }
}
