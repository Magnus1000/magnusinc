function ClearDataButton() {
    const [isClearing, setIsClearing] = React.useState(false);
  
    const clearData = async () => {
      setIsClearing(true);
      const uuid = Cookies.get('uuid');
  
      if (!uuid) {
        console.error('UUID not found in cookies');
        setIsClearing(false);
        return;
      }
  
      try {
        const response = await fetch('https://magnusinc-magnus1000team.vercel.app/api/clearData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uuid }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to clear data');
        }
  
        const result = await response.json();
        console.log('Data cleared successfully. Refresh page:', result);
        alert('Data cleared successfully');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data. Please try again.');
      } finally {
        setIsClearing(false);
      }
    };
  
    return (
      <button 
        className="submit-button" 
        onClick={clearData} 
        disabled={isClearing}
      >
        {isClearing ? 'Clearing...' : 'Clear Data'}
      </button>
    );
  }
  
  ReactDOM.render(<ClearDataButton />, document.getElementById('clearDataButton'));