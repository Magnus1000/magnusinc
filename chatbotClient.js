const Chatbot = () => {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

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
    } catch (error) {
      console.error('Error fetching response from serverless function:', error);
      // Optionally add an error message to the chat
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: 'Sorry, an error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chatbot">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chatbot-message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {isLoading && <div className="chatbot-message loading">Bot is typing...</div>}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' ? handleSend() : null}
          disabled={isLoading}
          className="chat-input"
        />
        <div className="chat-button-wrapper">
          <button onClick={handleSend} disabled={isLoading} className="send-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M209 50.2l-17-17-17 17L21.4 203.8l-17 17 33.9 33.9 17-17L168 125.1V456v24h48V456 125.1L328.6 237.8l17 17 33.9-33.9-17-17L209 50.2z"/>
            </svg>
          </button>
          <button onClick={handleClearChat} className="clear-chat-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M345 137l17-17L328 86.1l-17 17-119 119L73 103l-17-17L22.1 120l17 17 119 119L39 375l-17 17L56 425.9l17-17 119-119L311 409l17 17L361.9 392l-17-17-119-119L345 137z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<Chatbot />, document.getElementById('chatbot'));