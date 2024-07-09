// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function EventLogs() {
  const [logs, setLogs] = React.useState([]);

  React.useEffect(() => {
    let isMounted = true; // Flag to handle component unmounting

    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('event_logs')
          .select('*')
          .order('event_time', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (isMounted) {
          setLogs(data);
        }
      } catch (error) {
        console.error('Error fetching logs:', error.message);
      }
    };

    fetchLogs();

    const handleRealtimeUpdates = (payload) => {
      console.log('Realtime update received:', payload);
      if (payload.eventType === 'INSERT' && isMounted) {
        setLogs((currentLogs) => [payload.new, ...currentLogs]);
      }
    };

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

    return () => {
      isMounted = false;
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
        <pre
          contentEditable="false"
          className="code-block-examples w-code-block"
          style={{
            display: 'block',
            overflowX: 'auto',
            background: '#2b2b2b',
            color: '#f8f8f2',
            padding: '0.5em',
          }}
        >
          <code className="language-javascript" style={{ whiteSpace: 'pre' }}>
            {JSON.stringify(logs, null, 2)}
          </code>
        </pre>
      </div>
    </div>
  );
}

ReactDOM.render(<EventLogs />, document.getElementById('eventLogs'));
