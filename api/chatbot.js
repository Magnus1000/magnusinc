const OpenAI = require("openai");
const axios = require("axios");
const cors = require('cors');
const marked = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const corsHandler = cors();

// Fetch services offered by Magnus Inc
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

// System message to guide the AI's behavior
const systemMessage = {
  role: 'system',
  content: `You are Maggy, an AI assistant for Magnus Inc. Your primary goals are:
  1. Build rapport with the user by being friendly, empathetic, and showing genuine interest in their needs.
  2. Proactively offer a consultation booking when appropriate, using the book_consultation function.
  3. When asked about our services, always use the get_company_services function to retrieve the most up-to-date information.
  4. Be conversational and natural. Keep your responses succinct. Look for opportunities to suggest a consultation, but don't be pushy. 
  5. Never say you're part of OpenAI or any other company.
  6. Avoid discussing politics, religion, or any controversial topics.
  7. If you're unsure how to respond, ask clarifying questions to keep the conversation going.
  8. If you're still unsure, apologize and encourage the user to email us at jack@magnucinc.co`
};

function renderMarkdown(text) {
  const rawHtml = marked.parse(text);
  return DOMPurify.sanitize(rawHtml);
}

// Main handler for incoming requests
module.exports = async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { input, messages } = req.body || {};

    console.log('Received request:', { input, messages });

    if (!input || !messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
      // Initial OpenAI completion request
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
              description: "Instruct user to click button to book a consultation",
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
            const consultationResponse = `Certainly! I'd be happy to help you book a consultation. Please click the "Book Now" button to schedule your appointment.`;

            return { tool_call_id: toolCall.id, role: 'tool', content: consultationResponse };
          }
        }));

        // Second OpenAI completion request including tool responses
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
            ...toolResponses,
          ],
        });

        const sanitizedContent = renderMarkdown(secondResponse.choices[0].message.content);

        res.status(200).json({
          content: sanitizedContent,
          type: 'chat',
          tool: toolResponses.some(r => r.content.includes('book a consultation')) ? 'consultation_button' : null
        });
      } else {
        const sanitizedContent = renderMarkdown(message.content);
        res.status(200).json({ content: sanitizedContent, type: 'chat' });
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Error processing request', message: error.message });
    }
  });
};