const { useState, useEffect } = React;
    
const EventsList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Replace 'your-vercel-websocket-url' with the actual WebSocket URL provided by Vercel
    const rws = new ReconnectingWebSocket('wss://magnusinc-magnus1000team.vercel.app/api/webhook');

    rws.onmessage = (event) => {
      const newEvent = JSON.parse(event.data);
      setEvents(prevEvents => [newEvent, ...prevEvents]);
    };

    rws.onopen = () => console.log('WebSocket connection opened');
    rws.onclose = () => console.log('WebSocket connection closed');

    return () => {
      rws.close();
    };
  }, []);

  return (
    <div>
      <h2>Latest Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>
            <h3>{event.Name}</h3>
            <p>{event.Description}</p>
            <p>{event.Date}</p> s
          </li>
        ))}
      </ul>
    </div>
  );
};

ReactDOM.render(<EventsList />, document.getElementById('eventLogs'));