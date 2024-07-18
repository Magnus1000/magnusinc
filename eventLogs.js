function EventLogs() {
  const [logs, setLogs] = React.useState([]);
  const [uuid, setUuid] = React.useState('');
  const [supabase, setSupabase] = React.useState(null);

  React.useEffect(() => {
    // Function to initialize Supabase client
    const initializeSupabase = () => {
      if (window.supabase) {
        const supabaseUrl = 'https://lbrtnalayoyzwrnthdse.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicnRuYWxheW95endybnRoZHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1ODgyMjEsImV4cCI6MjAzNTE2NDIyMX0.H16NPoL9OS-7l_GoaoJ-2xKQZ-CdJ4Mo9QXpM-6YRfY';
        const supabaseInstance = window.supabase.createClient(supabaseUrl, supabaseKey);
        setSupabase(supabaseInstance);
      } else {
        console.error('Supabase is not loaded');
      }
    };

    // Check if Supabase is already loaded
    if (window.supabase) {
      initializeSupabase();
    } else {
      // If not, set up a MutationObserver to watch for the script being added
      const observer = new MutationObserver((mutations) => {
        if (window.supabase) {
          observer.disconnect();
          initializeSupabase();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Cleanup function to disconnect the observer
      return () => observer.disconnect();
    }
  }, []);

  React.useEffect(() => {
    if (!supabase) return; // Exit if Supabase is not initialized
  
    // Function to format log entries
    const formatLogEntry = (log) => {
      const { event_id, event_time, event_type, event_page } = log;
      return {
        event_id,
        event_time: new Date(event_time).toISOString().split('.')[0],
        event_type,
        event_page
      };
    };
  
    // Fetch the last 100 event logs
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('event_logs')
        .select('*')
        .order('event_id', { ascending: false })
        .limit(100);
  
      if (error) {
        console.error('Error fetching logs:', error);
      } else {
        // Format the logs
        const cleanedData = data.map(formatLogEntry);
        setLogs(cleanedData);
      }
    };
  
    fetchLogs();
  
    // Function to handle realtime updates
    const handleRealtimeUpdates = (payload) => {
      console.log('Realtime update received:', payload);
      // Check if the event type is an INSERT to add new logs
      if (payload.eventType === 'INSERT') {
        const newLog = formatLogEntry(payload.new);
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
  }, [supabase]);

  React.useEffect(() => {
    // Function to get uuid from cookies
    const getUuidFromCookies = () => {
      const cookieUuid = Cookies.get('uuid');
      if (cookieUuid && !uuid) {
        setUuid(cookieUuid);
      }
    };
  
    // Check if uuid is not already set
    if (!uuid) {
      // Initial check
      getUuidFromCookies();
  
      // Set an interval to keep trying until uuid is set
      const interval = setInterval(getUuidFromCookies, 1000);
  
      // Cleanup the interval on component unmount
      return () => clearInterval(interval);
    }
  }, [uuid, logs]);

  return (
    <div className="service-row">
      <div className="service-inner-row code">
        <div className="column-right">
          <div className="column-right-header-row">
              <div className="column-header-wrapper">
                  <div className="column-header-text light">EVENT LOGS</div>
                  <div className="legend-wrapper">
                    <div className="legend-div">
                      <div className="legend-dot lime-green"></div>
                      <div className="legend-text lime-green">You (anonymous)</div>
                    </div>
                    <div className="legend-div">
                      <div className="legend-dot white"></div>
                      <div className="legend-text white">Other users (anonymous)</div>
                    </div>
                  </div>
              </div>
          </div>
          <pre contentEditable="false" className="code-block-examples w-code-block" style={{ display: 'block', overflowX: 'auto', background: '#2b2b2b', color: '#f8f8f2', padding: '0.5em' }}>
            <code className="language-javascript" style={{ whiteSpace: 'pre' }}>
              {logs.map((log, index) => {
                const { uuid: logUuid, ...logWithoutUuid } = log; // Remove uuid from log
                const isCurrentUser = logUuid === uuid;
                return (
                  <div key={index} className={`event-log ${isCurrentUser ? 'lime-green' : ''}`}>
                    <span className="code-line-number">{index + 1}</span> 
                    <span className={isCurrentUser ? 'lime-green' : ''}>{JSON.stringify(logWithoutUuid)}</span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<EventLogs />, document.getElementById('eventLogs'));