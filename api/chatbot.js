const OpenAI = require("openai");
const axios = require("axios");
const cors = require('cors');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const corsHandler = cors();

async function fetchServices() {
  try {
    const response = await axios.get('https://magnusinc-magnus1000team.vercel.app/api/fetchServicesForChatbot');
    return response.data.map(service => ({
      name: service.service_name,
      description: service.service_description
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    return null;
  }
}

const systemMessage = {
  role: 'system',
  content: `You are Maggy, an AI assistant for Magnus Inc. Your primary goals are:
  1. Build rapport with the user by being friendly, empathetic, and showing genuine interest in their needs.
  2. Proactively offer a consultation booking when appropriate, using the book_consultation function.
  3. When asked about our services, always use the get_company_services function to retrieve the most up-to-date information.
  Be conversational and natural. Look for opportunities to suggest a consultation, but don't be pushy. Never say you're part of OpenAI or any other company.`
};

async function initializeThread() {
  try {
    const thread = await openai.beta.threads.create();
    console.log('Thread initialized with ID:', thread.id);
    return thread.id;
  } catch (error) {
    console.error('Error initializing thread:', error);
    return null;
  }
}

module.exports = async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { input, messages, threadId } = req.body || {};

    if (!input || !messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    let currentThreadId = threadId;

    if (!currentThreadId) {
      currentThreadId = await initializeThread();
      if (!currentThreadId) {
        return res.status(500).json({ error: 'Could not initialize thread' });
      }
      return res.status(200).json({ threadId: currentThreadId, messages: [{ sender: 'bot', text: 'Thread initialized. How can I help you today?' }] });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        thread_id: currentThreadId,
        messages: [
          systemMessage,
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
          { role: 'user', content: input },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "get_company_services",
              description: "Get the services provided by Magnus Inc",
              parameters: {
                type: "object",
                properties: {},
              },
            },
          },
          {
            type: "function",
            function: {
              name: "book_consultation",
              description: "Offer to book a consultation",
              parameters: {
                type: "object",
                properties: {},
              },
            },
          },
        ],
        tool_choice: "auto",
      });

      const message = completion.choices[0].message;

      if (message.tool_calls) {
        const toolResponses = await Promise.all(message.tool_calls.map(async (toolCall) => {
          if (toolCall.function.name === "get_company_services") {
            const services = await fetchServices();
            let serviceResponse;

            if (services && services.length > 0) {
              serviceResponse = `Magnus Inc offers the following services:\n${services.map(s => `- ${s.name}: ${s.description}`).join('\n')}`;
            } else {
              serviceResponse = `I apologize, but I'm currently unable to retrieve our service information. Please check our website or contact our sales team for the most up-to-date list of services.`;
            }

            return { tool_call_id: toolCall.id, role: 'tool', content: serviceResponse };
          } else if (toolCall.function.name === "book_consultation") {
            const consultationResponse = `Certainly! I'd be happy to help you book a consultation. You can schedule your appointment right away by clicking here: <a href="#bookConsultation" class="consultation-link">Book Your Consultation</a>. Is there anything specific you'd like to discuss during the consultation?`;

            return { tool_call_id: toolCall.id, role: 'tool', content: consultationResponse };
          }
        }));

        const secondResponse = await openai.chat.completions.create({
          model: 'gpt-4',
          thread_id: currentThreadId,
          messages: [
            systemMessage,
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
            { role: 'user', content: input },
            message,
            ...toolResponses,
          ],
        });

        res.status(200).json({
          content: secondResponse.choices[0].message.content,
          type: 'chat',
          threadId: currentThreadId,
          tool: toolResponses.some(r => r.content.includes('book a consultation')) ? 'consultation_link' : null
        });
      } else {
        res.status(200).json({ content: message.content, type: 'chat', threadId: currentThreadId });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error processing request', message: error.message });
    }
  });
};
