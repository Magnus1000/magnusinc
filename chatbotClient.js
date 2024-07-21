const Chatbot = () => {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFirstMessage, setIsFirstMessage] = React.useState(true);
  const [initialMessageSent, setInitialMessageSent] = React.useState(false);

  const handleBookConsultation = () => {
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendInitialMessage = () => {
    if (!initialMessageSent) {
      const initialBotMessage = {
        sender: 'bot',
        text: "Hello! I'm Maggy, your AI assistant. How can I help you today?",
        showConsultationButton: false
      };
      setMessages([initialBotMessage]);
      setInitialMessageSent(true);
    }
  };

  React.useEffect(() => {
    sendInitialMessage();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input, showConsultationButton: false };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    if (isFirstMessage) {
      let userUuid = Cookies.get('uuid');
      if (userUuid) {
        createEvent(userUuid, 'First message sent', 'chat_start');
        setIsFirstMessage(false);
      }
    }

    try {
      const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/chatbot', {
        input,
        messages
      });

      let botMessageContent = response.data.content;
      let showConsultationButton = response.data.tool === 'consultation_button';

      const botMessage = { sender: 'bot', text: botMessageContent, showConsultationButton };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching response from serverless function:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Sorry, an error occurred.', showConsultationButton: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
    setIsFirstMessage(true);
    setInitialMessageSent(false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  function createEvent(uuid, event_content, event_type) {
    const event_page = '/services';

    const eventData = {
      uuid,
      event_content,
      event_type,
      event_page
    };

    fetch('https://magnusinc-magnus1000team.vercel.app/api/createEventSB.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch((error) => console.error('Error:', error));
  }

  const renderMessage = (message) => {
    return <div dangerouslySetInnerHTML={{ __html: message.text }} />;
  };

  return (
    <div className="chatbot-div">
      <div className="chatbot-header">
        <div class="chatbot-header-name-div">
          <div class="chatbot-header-name-text">Maggy</div>
        </div>
        <div class="chatbot-header-expand-div">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M144 32l16 0 0 32-16 0L32 64l0 112 0 16L0 192l0-16L0 48 0 32l16 0 128 0zM0 336l0-16 32 0 0 16 0 112 112 0 16 0 0 32-16 0L16 480 0 480l0-16L0 336zM432 32l16 0 0 16 0 128 0 16-32 0 0-16 0-112L304 64l-16 0 0-32 16 0 128 0zM416 336l0-16 32 0 0 16 0 128 0 16-16 0-128 0-16 0 0-32 16 0 112 0 0-112z"/></svg>
        </div>
      </div>    
      <div className="chatbot">
        <div className="chatbot-messages">
          {initialMessageSent && messages.map((message, index) => (
            <div key={index} className={`chatbot-message ${message.sender}`}>
              {renderMessage(message)}
              {message.showConsultationButton && (
                <button onClick={handleBookConsultation} className="consultation-button">
                  Book Consultation
                </button>
              )}
            </div>
          ))}
          {isLoading && <div className="chatbot-message loading">Maggy is typing...</div>}
        </div>
        <div className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Reply to Maggy..."
            disabled={isLoading}
            className="chat-input"
          />
          <div className="chat-button-wrapper">
            <button onClick={handleSend} disabled={isLoading} className="send-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path fill="currentColor" d="M209 50.2l-17-17-17 17L21.4 203.8l-17 17 33.9 33.9 17-17L168 125.1V456v24h48V456 125.1L328.6 237.8l17 17 33.9-33.9-17-17L209 50.2z"/>
              </svg>
            </button>
            <button onClick={handleClearChat} className="clear-chat-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path fill="currentColor" d="M345 137l17-17L328 86.1l-17 17-119 119L73 103l-17-17L22.1 120l17 17 119 119L39 375l-17 17L56 425.9l17-17 119-119L311 409l17 17L361.9 392l-17-17-119-119L345 137z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<Chatbot />, document.getElementById('chatbotTarget'));