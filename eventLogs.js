// Initialize Supabase client
const supabaseUrl = 'https://lbrtnalayoyzwrnthdse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicnRuYWxheW95endybnRoZHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1ODgyMjEsImV4cCI6MjAzNTE2NDIyMX0.H16NPoL9OS-7l_GoaoJ-2xKQZ-CdJ4Mo9QXpM-6YRfY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

function EventLogs() {
  const [logs, setLogs] = React.useState([]);

  React.useEffect(() => {
    // Fetch the last 100 event logs
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('event_logs')
        .select('*')
        .order('event_time', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching logs:', error);
      } else {
        setLogs(data);
      }
    };

    fetchLogs();

    // Function to handle realtime updates
    const handleRealtimeUpdates = (payload) => {
      console.log('Realtime update received:', payload);
      // Check if the event type is an INSERT to add new logs
      if (payload.eventType === 'INSERT') {
        // Prepend the new log to the existing logs
        setLogs((currentLogs) => [payload.new, ...currentLogs]);
      }
    };

    // Subscribe to realtime changes on your table
    const subscription = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_logs' },
        handleRealtimeUpdates
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to the event_logs table');
        }
      });

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  return (
    <div className="service-row">
      <div className="try-me-div">
          <div className="try-me-text">EVENT LOGS</div>
      </div>
      <div className="service-inner-row">
        <div className="column-right">
          <div className="column-right-header-row">
              <div className="column-header-wrapper">
                  <div className="column-header-text light">EVENT LOGS</div>
                  <div className="column-subheader-text light">Last 100 events</div>
              </div>
          </div>
        </div>
        <pre contenteditable="false" className="code-block-examples w-code-block" style={{ display: 'block', overflowX: 'auto', background: '#2b2b2b', color: '#f8f8f2', padding: '0.5em' }}>
            <code className="language-javascript" style={{ whiteSpace: 'pre' }}>{logs}</code>
        </pre>
      </div>
    </div>
  );
}

ReactDOM.render(<EventLogs />, document.getElementById('eventLogs'));

return (
  <div className="service-row">
    <div className="try-me-div">
        <div className="try-me-text">TRY ME</div>
    </div>
    <div className="toggle-buttons">
      <button className={`toggle-class ${view === 'frontend' ? 'active' : ''}`} onClick={() => setView('frontend')}>Frontend</button>
      <button className={`toggle-class ${view === 'backend' ? 'active' : ''}`} onClick={() => setView('backend')}>Backend</button>
    </div>
    <div className="service-inner-row">
      <div className={`column ${view === 'frontend' ? 'active' : ''}`} style={{ position: 'absolute', width: '100%', transition: 'opacity 0.5s', opacity: view === 'frontend' ? 1 : 0 }}>
        <div className="column-left">
          <div className="email-form-div">
            <form className="email-form" onSubmit={handleSubmit}>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="email-input"
              />
              <button className="submit-button" type="submit">Sign Up</button>
            </form>
          </div>
        </div>
      </div>
      <div className={`column ${view === 'backend' ? 'active' : ''}`} style={{ position: 'absolute', width: '100%', transition: 'opacity 0.5s', opacity: view === 'backend' ? 1 : 0 }}>
        <div className="column-right">
            <div className="column-right-header-row">
                <div className="column-header-wrapper">
                    <div className="column-header-text light">BACKEND</div>
                    <div className="column-subheader-text light">What you see</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
);
