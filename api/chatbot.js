const OpenAI = require("openai");
const axios = require("axios");
const cors = require('cors');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  apiVersion: 'v1',
});

const corsHandler = cors();

// Function to fetch services from the external API
async function fetchServices() {
  try {
    const response = await axios.get('https://magnusinc-magnus1000team.vercel.app/api/fetchServicesForChatbot');
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    return null;
  }
}

const systemMessage = {
  role: 'system', 
  content: 'You are Maggy, an AI assistant for Magnus Inc. When asked about our services, always use the get_company_services function to retrieve the most up-to-date information. Never say you\'re part of OpenAI or any other company.'
};

module.exports = async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { input, messages } = req.body || {};

    if (!input || !messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          systemMessage,
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
          { role: 'user', content: input },
        ],
        functions: [
          {
            name: "get_company_services",
            description: "Get the services provided by Magnus Inc",
            parameters: {
              type: "object",
              properties: {},
            },
          },
        ],
        function_call: "auto",
      });

      const message = completion.choices[0].message;

      if (message.function_call && message.function_call.name === "get_company_services") {
        const services = await fetchServices();
        let serviceResponse;
        
        if (services && services.length > 0) {
          serviceResponse = `Magnus Inc offers the following services:\n${services.map(s => `- ${s}`).join('\n')}`;
        } else {
          serviceResponse = `I apologize, but I'm currently unable to retrieve our service information. Please check our website or contact our sales team for the most up-to-date list of services.`;
        }

        const secondResponse = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            systemMessage,
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
            { role: 'user', content: input },
            message,
            { role: 'function', name: "get_company_services", content: serviceResponse },
          ],
        });

        res.status(200).json({ content: secondResponse.choices[0].message.content, type: 'chat' });
      } else {
        res.status(200).json({ content: message.content, type: 'chat' });
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Error processing request', message: error.message });
    }
  });
};