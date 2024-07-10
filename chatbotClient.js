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
        />
        <button onClick={handleSend} disabled={isLoading}>Send</button>
        <button onClick={handleClearChat}>Clear Chat</button>
      </div>
    </div>
  );
};

ReactDOM.render(<Chatbot />, document.getElementById('chatbot'));