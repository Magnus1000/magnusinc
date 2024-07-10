const Chatbot = () => {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const chatbotRef = React.useRef(null);

  React.useEffect(() => {
    setInput('Reply to Maggy...');

    const hasShownInitialMessage = localStorage.getItem('hasShownInitialMessage');

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && messages.length === 0 && !hasShownInitialMessage) {
          handleInitialMessage();
          localStorage.setItem('hasShownInitialMessage', 'true');
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (chatbotRef.current) {
      observer.observe(chatbotRef.current);
    }

    return () => {
      if (chatbotRef.current) {
        observer.unobserve(chatbotRef.current);
      }
    };
  }, []);

  const handleInitialMessage = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/chatbot', {
        input: 'Hello',
        messages: [],
      });

      const botMessage = { sender: 'bot', text: response.data.content };
      setMessages([botMessage]);
    } catch (error) {
      console.error('Error fetching initial response:', error);
      setMessages([{ sender: 'bot', text: 'Hello! I'm Maggy, Magnus Inc's AI assistant. How can I help you today?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || input === 'Reply to Maggy...') return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/chatbot', {
        input,
        messages,
      });

      const botMessage = { sender: 'bot', text: response.data.content };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      setInput('Reply to Maggy...');
    } catch (error) {
      console.error('Error fetching response from serverless function:', error);
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Sorry, an error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('Reply to Maggy...');
    localStorage.removeItem('hasShownInitialMessage');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === 'Reply to Maggy...') {
      setInput('');
    } else {
      setInput(value);
    }
  };

  const handleInputFocus = () => {
    if (input === 'Reply to Maggy...') {
      setInput('');
    }
  };

  const handleInputBlur = () => {
    if (input === '') {
      setInput('Reply to Maggy...');
    }
  };

  return (
    <div ref={chatbotRef} className="chatbot">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chatbot-message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {isLoading && <div className="chatbot-message loading">Maggy is typing...</div>}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyPress={(e) => e.key === 'Enter' ? handleSend() : null}
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