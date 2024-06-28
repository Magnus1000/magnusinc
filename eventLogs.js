  // Initialize Supabase
  const supabaseUrl = 'https://lbrtnalayoyzwrnthdse.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicnRuYWxheW95endybnRoZHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1ODgyMjEsImV4cCI6MjAzNTE2NDIyMX0.H16NPoL9OS-7l_GoaoJ-2xKQZ-CdJ4Mo9QXpM-6YRfY';
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  // Function to handle realtime updates
  const handleRealtimeUpdates = (payload) => {
    console.log('Change received!', payload);
    // Update your UI here with the new data
  };

  // Subscribe to realtime changes on your table
  const realtimeSubscription = supabase
    .from('event_logs')
    .on('*', handleRealtimeUpdates)
    .subscribe();