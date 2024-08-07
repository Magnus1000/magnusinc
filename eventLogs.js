function EventLogs() {
  const [logs, setLogs] = React.useState([]);
  const [uuid, setUuid] = React.useState('');
  const [supabase, setSupabase] = React.useState(null);

  // Initialize Supabase client
  React.useEffect(() => {
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

    if (window.supabase) {
      initializeSupabase();
    } else {
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

      return () => observer.disconnect();
    }
  }, []);

  // Fetch logs and set up real-time updates
  React.useEffect(() => {
    if (!supabase) return;

    const formatLogEntry = (log) => {
      const { event_id, event_time, event_type, event_page, archive, uuid: logUuid } = log;
      return {
        event_type,
        event_time: new Date(event_time).toISOString().split('.')[0],
        event_page,
        event_id,
        uuid: logUuid,  // Use the log's UUID, not the current user's
        archive
      };
    };

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('event_logs')
        .select('*')
        .eq('archive', false)  // Only select logs where archive is false
        .order('event_id', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching logs:', error);
      } else {
        const cleanedData = data.map(formatLogEntry);
        setLogs(cleanedData);
      }
    };

    fetchLogs();

    const handleRealtimeUpdates = (payload) => {
      console.log('Realtime update received:', payload);
      if (payload.eventType === 'INSERT' && !payload.new.archive) {
        const newLog = formatLogEntry(payload.new);
        setLogs((currentLogs) => [newLog, ...currentLogs]);
    
        if (
          (payload.new.event_type === 'email_capture' || 
           payload.new.event_type === 'email_open' || 
           payload.new.event_type === 'email_delivered') &&
          payload.new.uuid === uuid
        ) {
          fetchEmailCaptureLogs();
        }
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
      supabase.removeSubscription(subscription);
    };
  }, [supabase]);

  // Fetch UUID from cookies
  React.useEffect(() => {
    const getUuidFromCookies = () => {
      const cookieUuid = Cookies.get('uuid');
      if (cookieUuid && !uuid) {
        setUuid(cookieUuid);
      }
    };

    if (!uuid) {
      getUuidFromCookies();
      const interval = setInterval(getUuidFromCookies, 1000);
      return () => clearInterval(interval);
    }
  }, [uuid]);

  // Fetch email capture logs
  const fetchEmailCaptureLogs = async () => {
    if (!supabase || !uuid) return;
  
    const { data, error } = await supabase
      .from('event_logs')
      .select('*')
      .or(`event_type.eq.email_capture,event_type.eq.email_open`)
      .eq('uuid', uuid)
      .eq('archive', false);  // Only select logs where archive is false
  
    if (error) {
      console.error('Error fetching email capture logs:', error);
    } else {
      const formattedData = data.map((log, index) => {
        const { event_id, event_time, event_type, event_page } = log;
        return `<div class="event-log uuid"><span class="code-line-number">${index + 1}</span><span class="uuid">${JSON.stringify({ event_type, event_time: new Date(event_time).toISOString().split('.')[0], event_page, event_id }).replace(/^\s+|\s+$/g, '')}</span></div>`;
      }).join('');
  
      const emailLogsDiv = document.getElementById('emailLogs');
      if (emailLogsDiv) {
        emailLogsDiv.innerHTML = formattedData;
      } else {
        console.error('Div with id emailLogs not found');
      }
    }
  };

  // Fetch email logs initially and on supabase state change
  React.useEffect(() => {
    fetchEmailCaptureLogs();
  }, [supabase]);

  return (
    <div className="service-row">
      <div className="service-inner-row code">
        <div className="column-right">
          <div className="column-right-header-row">
            <div className="column-header-wrapper">
              <div className="column-header-text light">EVENT LOGS</div>
              <div className="legend-wrapper">
                <div className="legend-div">
                  <div className="legend-dot uuid"></div>
                  <div className="legend-text uuid">you (anonymous)</div>
                </div>
                <div className="legend-div">
                  <div className="legend-dot nonuuid"></div>
                  <div className="legend-text nonuuid">users (anonymous)</div>
                </div>
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
              padding: '0.5em'
            }}
          >
            <code className="language-javascript" style={{ whiteSpace: 'pre' }}>
              {logs.map((log, index) => {
                const { uuid: logUuid, archive, ...logWithoutUuid } = log;
                const isCurrentUser = logUuid === uuid;
                const orderedLog = {
                  event_type: logWithoutUuid.event_type,
                  event_time: logWithoutUuid.event_time,
                  event_page: logWithoutUuid.event_page,
                  event_id: logWithoutUuid.event_id
                };
                return (
                  <div key={index} className={`event-log ${isCurrentUser ? 'uuid' : 'nonuuid'}`}>
                    <span className="code-line-number">{index + 1}</span> 
                    <span className={isCurrentUser ? 'uuid' : ''}>{JSON.stringify(orderedLog)}</span>
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