const LocationService = () => {
    const [log, setLog] = React.useState('');

    React.useEffect(() => {
        fetch('https://ip-api.com/json')
        .then(response => response.json())
        .then(data => {
            const { lat, lon, city, country } = data;
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Initial location via IP: Latitude: ${lat}, Longitude: ${lon}, City: ${city}, Country: ${country}`);
        })
        .catch((error) => {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Error getting location via IP: ${error.message}`);
        });
    }, []);

    const handleGetLocation = () => {
        setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Button clicked.`);
        if (navigator.geolocation) {
          setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Permission granted.`);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Latitude: ${latitude}, Longitude: ${longitude}`);
            },
            (error) => {
              setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Error getting location: ${error.message}`);
            }
          );
        } else {
          setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Geolocation is not supported by this browser.`);
        }
      };

    return (
      <div className="service-row">
        <div className="service-inner-row">
          <div className="try-me-div">
            <div className="try-me-text">TRY ME</div>
          </div>
          <div className="column-left">
            <div className="column-left-header-row">
              <div className="column-header-wrapper">
                <div className="column-header-text">FRONTEND</div>
                <div className="text-block-2">What your users see</div>
              </div>
            </div>
            <div className="column-left-button-row">
              <button className="button-primary w-inline-block" onClick={handleGetLocation}>
                <div className="button-text">Get Location</div>
                <div className="button-icon w-embed">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                      fill="currentColor"
                      d="M256 224v32V431.1L377.8 102.2 48.9 224H224h32zM0 208L392.5 62.6 432 48 417.4 87.5 272 480H256 224V448 288 256H192 32 0V224 208z"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
            <div className="column-left-header-row">
              <div className="location-result-grid">
                <div className="location-result-div">
                  <div className="location-details-div">
                    <div className="location-result-header">Location Log</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="column-right">
            <div className="column-right-header-row">
              <div className="column-header-wrapper">
                <div className="column-header-text light">BACKEND</div>
                <div className="text-block">What you see</div>
              </div>
            </div>
            <pre className="code-block-custom">
            <code>
                {log}
            </code>
            </pre>
          </div>
        </div>
      </div>
    );
  };

  ReactDOM.render(<LocationService />, document.getElementById('locationService'));