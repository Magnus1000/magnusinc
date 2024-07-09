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
        // Filter out the unwanted properties
        const cleanedData = data.map(log => {
          const { event_order, event_content, ...cleanedLog } = log;
          return cleanedLog;
        });
        setLogs(cleanedData);
      }
    };

    fetchLogs();

    // Function to handle realtime updates
    const handleRealtimeUpdates = (payload) => {
      console.log('Realtime update received:', payload);
      // Check if the event type is an INSERT to add new logs
      if (payload.eventType === 'INSERT') {
        const { event_order, event_content, ...newLog } = payload.new;
        setLogs((currentLogs) => [newLog, ...currentLogs]);
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
          <pre contentEditable="false" className="code-block-examples w-code-block" style={{ display: 'block', overflowX: 'auto', background: '#2b2b2b', color: '#f8f8f2', padding: '0.5em' }}>
              <code className="language-javascript" style={{ whiteSpace: 'pre' }}>
                {logs.map(log => JSON.stringify(log)).join('\n')}
              </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<EventLogs />, document.getElementById('eventLogs'));
