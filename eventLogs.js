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
    <div>
      <h2>Event Logs</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            {/* Adjust according to your log structure */}
            {log.event_content} - {new Date(log.event_time).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.render(<EventLogs />, document.getElementById('eventLogs'));
