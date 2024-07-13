function EventLogs() {
  const [logs, setLogs] = React.useState([]);
  const [uuid, setUuid] = React.useState('');
  const [supabase, setSupabase] = React.useState(null);

  React.useEffect(() => {
    // Function to load Supabase script
    const loadSupabaseScript = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Supabase script'));
        document.body.appendChild(script);
      });
    };

    // Function to initialize Supabase client
    const initializeSupabase = () => {
      const supabaseUrl = 'https://lbrtnalayoyzwrnthdse.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicnRuYWxheW95endybnRoZHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1ODgyMjEsImV4cCI6MjAzNTE2NDIyMX0.H16NPoL9OS-7l_GoaoJ-2xKQZ-CdJ4Mo9QXpM-6YRfY';
      const supabaseInstance = supabase.createClient(supabaseUrl, supabaseKey);
      setSupabase(supabaseInstance);
    };

    // Load Supabase script and initialize client
    loadSupabaseScript()
      .then(() => {
        initializeSupabase();
      })
      .catch((error) => console.error('Error loading Supabase:', error));
  }, []);

  React.useEffect(() => {
    if (!supabase) return; // Exit if Supabase is not initialized

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
                  return (
                    <div key={index} className={`event-log ${logUuid === uuid ? 'lime-green' : ''}`}>
                      <span className="code-line-number">{index + 1}</span> {JSON.stringify(logWithoutUuid)}
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