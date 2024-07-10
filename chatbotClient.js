const Chatbot = () => {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFirstKeystroke, setIsFirstKeystroke] = React.useState(true);
  const [threadId, setThreadId] = React.useState(null);
  const inputRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    handleInitialMessage();
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInitialMessage = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/chatbot', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setThreadId(response.data.threadId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error initializing thread:', error);
      setMessages([{ sender: 'bot', text: 'Sorry, an error occurred. Please try again later.' }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input, showConsultationButton: false };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsFirstKeystroke(true);

    const payload = {
      input,
      messages: [...messages, userMessage],
      threadId
    };

    console.log('Request payload:', payload);

    try {
      const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/chatbot', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let botMessageContent = response.data.content;
      let showConsultationButton = false;

      if (response.data.tool === 'consultation_link') {
        botMessageContent = botMessageContent.replace(
          /<a href="#bookConsultation"[^>]*>([^<]+)<\/a>/,
          '[Book Consultation]'
        );
        showConsultationButton = true;
      }

      const botMessage = { sender: 'bot', text: botMessageContent, showConsultationButton };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching response from serverless function:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Sorry, an error occurred.', showConsultationButton: false }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
    setIsFirstKeystroke(true);
    setThreadId(null);
    handleInitialMessage();
  };

  const handleInputChange = (e) => {
    if (isFirstKeystroke) {
      setInput(e.target.value);
      setIsFirstKeystroke(false);
    } else {
      setInput(e.target.value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleBookConsultation = () => {
    window.location.href = '#bookConsultation';
  };

  return (
    <div className="chatbot">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chatbot-message ${message.sender}`}>
            <div>{message.text}</div>
            {message.showConsultationButton && (
              <button onClick={handleBookConsultation} className="consultation-button">
                Book Consultation
              </button>
            )}
          </div>
        ))}
        {isLoading && <div className="chatbot-message loading">Maggy is typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          ref={inputRef}
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
  );
};

ReactDOM.render(<Chatbot />, document.getElementById('chatbot'));
