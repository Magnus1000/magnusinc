const Chatbot = () => {
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState('');
  
    const handleSend = async () => {
      const userMessage = { sender: 'user', text: input };
      setMessages([...messages, userMessage]);
      setInput('');
  
      try {
        const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/chatbot', {
          input,
          messages,
        });
  
        const botMessage = { sender: 'bot', text: response.data.content };
        setMessages([...messages, userMessage, botMessage]);
      } catch (error) {
        console.error('Error fetching response from serverless function:', error);
      }
    };
  
    return (
      <div className="chatbot">
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chatbot-message ${message.sender}`}>
              {message.text}
            </div>
          ))}
        </div>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' ? handleSend() : null}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    );
};
  
ReactDOM.render(<Chatbot />, document.getElementById('chatbot'));