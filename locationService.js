const LocationService = () => {
    const [log, setLog] = React.useState('// event_logs');
    const [results, setResults] = React.useState([]);

    React.useEffect(() => {
        let uuid = Cookies.get('uuid');
        if (uuid) {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] UUID fetched from cookies: ${uuid}`);
        } else {
            uuid = generateUUID();
            Cookies.set('uuid', uuid);
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] UUID not found in cookies. New UUID generated and set: ${uuid}`);
        }
        fetch('https://ip-api.com/json')
        .then(response => response.json())
        .then(data => {
            const { lat, lon, city, country } = data;
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Approx location via IP:\n[${new Date().toISOString()}] Lat: ${lat}, Lng: ${lon}\n[${new Date().toISOString()}] City: ${city}\n[${new Date().toISOString()}] Country: ${country}`);
        })
        .catch((error) => {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Error getting location via IP: ${error.message}`);
        });
    }, []);

    function generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

const handleGetLocation = () => {
    setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Button clicked.`);
    if (navigator.geolocation) {
      setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Permission granted.`);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Precise location via Browser:`);
          setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Lat: ${latitude}, Lng: ${longitude}`);

        // Fetch closest results
        fetch(`https://magnusinc-magnus1000team.vercel.app/api/fetchClosestResults?lat=${latitude}&lng=${longitude}`)
        .then(response => response.json())
        .then(data => {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Closest results fetched:`);
            setResults(data.records); // Update this line
            console.log(data.records);
        })
        .catch((error) => {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Error fetching closest results: ${error.message}`);
        });
        },
        (error) => {
          setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Error getting location: ${error.message}`);
        }
      );
    } else {
      setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Geolocation not supported by this browser.`);
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
                {results.slice(0, 4).map((result, index) => (
                <div key={index} className="location-result-div">
                    <div className="location-image-div">
                    <img 
                        src={result.image} 
                        loading="lazy" 
                        alt="" 
                        className="location-image"
                    />
                    </div>
                    <div className="location-details-div">
                    <div className="location-result-header">{result.dealer}</div>
                    <div className="location-result-name">{result.name}</div>
                    <div className="location-result-value">{result.value}</div>
                    <div className="location-result-distance">{result.distance}</div>
                    </div>
                </div>
                ))}
            </div>
          </div>
          <div className="column-right">
            <div className="column-right-header-row">
              <div className="column-header-wrapper">
                <div className="column-header-text light">BACKEND</div>
                <div className="text-block">What you see</div>
              </div>
            </div>
            <pre contenteditable="false" className="code-block-examples w-code-block" style={{ display: 'block', overflowX: 'auto', background: '#2b2b2b', color: '#f8f8f2', padding: '0.5em' }}>
              <code className="language-javascript" style={{ whiteSpace: 'pre' }}>{log}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  };

  ReactDOM.render(<LocationService />, document.getElementById('locationService'));