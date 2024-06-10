const LocationService = () => {
    const [log, setLog] = React.useState('// event_logs');
    const [isFetching, setIsFetching] = React.useState(false);
    const [country, setCountry] = React.useState('United States');
    const [results, setResults] = React.useState([
        {
            dealer: 'Wormwood Motors',
            name: 'Ford',
            value: 0.0,
            distance: 0.0,
            image: 'https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/666636aaca8c5ca3b6212efd_ford-f150.webp'
        },
        {
            dealer: 'Wormwood Motors',
            name: 'Tesla Cybertruck',
            value: 0.0,
            distance: 0.0,
            image: 'https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/666636aaa04eecfc857244b1_cybertruck.webp'
        },
        {
            dealer: 'Wormwood Motors',
            name: 'Rivian',
            value: 0.0,
            distance: 0.0,
            image: 'https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/666636aaf8c5104598400baa_rivian.webp'
        },
        {
            dealer: 'Wormwood Motors',
            name: 'VW Beatle',
            value: 0.0,
            distance: 0.0,
            image: 'https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/666636aaf244c26abb87ef53_vw.webp'
        }
    ]);
    const [selectedResultIndex, setSelectedResultIndex] = React.useState(null);

    React.useEffect(() => {
        let uuid = Cookies.get('uuid');
        if (uuid) {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] UUID fetched from cookies: ${uuid}.`);
        } else {
            uuid = generateUUID();
            Cookies.set('uuid', uuid);
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] UUID not found in cookies. New UUID generated and set: ${uuid}.`);
        }
        fetch('https://ipapi.co/json')
        .then(response => response.json())
        .then(data => {
            const { latitude: lat, longitude: lon, city, country_name: country } = data;
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

    const handleResultClick = (result, index) => {
        setSelectedResultIndex(index);
        setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Result clicked: ${index + 1}\n[${new Date().toISOString()}] Dealer: ${result.dealer}\n[${new Date().toISOString()}] Name: ${result.name}\n[${new Date().toISOString()}] Value: ${result.value}\n[${new Date().toISOString()}] Distance: ${result.distance}`);
    };

    const fetchLocationString = (lat, lng) => {
        fetch(`https://magnusinc-magnus1000team.vercel.app/api/getLocationString?lat=${lat}&lng=${lng}`)
        .then(response => response.json())
        .then(data => {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Obtained address from coordinates.\n[${new Date().toISOString()}] ${data.address}`);
            setCountry(data.country);
        })
        .catch((error) => {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Error fetching location string: ${error.message}`);
        });
    };

    const handleGetLocation = () => {
        // Set isFetching to true before starting the fetch
        setIsFetching(true);

        setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Button clicked.`);
        if (navigator.geolocation) {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Permission granted.`);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Precise location via Browser:`);
                    setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Lat: ${latitude}, Lng: ${longitude}.`);

                    // Fetch location string
                    fetchLocationString(latitude, longitude);

                    // Fetch closest results
                    fetch(`https://magnusinc-magnus1000team.vercel.app/api/fetchClosestResults?lat=${latitude}&lng=${longitude}`)
                    .then(response => response.json())
                    .then(data => {
                        setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Closest results fetched.`);
                        setResults(data);
                        console.log(data);
                        setIsFetching(false);
                    })
                    .catch((error) => {
                        setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Error fetching closest results: ${error.message}`);
                        setIsFetching(false);
                    });
                },
                (error) => {
                    setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Error getting location: ${error.message}`);
                    setIsFetching(false);
                }
            );
        } else {
            setLog((prevLog) => `${prevLog}\n[${new Date().toISOString()}] Geolocation not supported by this browser.`);
            setIsFetching(false);
        }
    };

    const convertDistance = (distance, country) => {
        distance = distance / 1000; // Convert distance from meters to kilometers
        if (country === 'United States') {
            // Convert distance to miles if the country is United States
            return `${(distance * 0.621371).toFixed(2)} miles`;
        } else {
            // The distance is in kilometers for other countries
            return `${distance.toFixed(2)} km`;
        }
    }

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
                    <div className="button-text">
                        {isFetching ? "Fetching..." : "Get Location"}
                    </div>
                    <div className="button-icon w-embed">
                        {isFetching ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M224 80h64V16l-64 0V80zM208 96V80 16 0h16 64 16V16 80 96l-16 0H224 208zM80 224H16v64H80V224zM16 208H80 96v16 64 16H80 16 0V288 224 208H16zM224 432v64h64V432H224zm-16 64V432 416h16 64 16v16 64 16H288 224 208V496zM432 224v64h64V224H432zm-16-16h16 64 16v16 64 16H496 432 416V288 224 208zM108.9 357.8L63.7 403.1l45.3 45.3 45.3-45.3-45.3-45.3zM52.4 391.8l45.3-45.3 11.3-11.3 11.3 11.3 45.3 45.3 11.3 11.3-11.3 11.3-45.3 45.3L108.9 471 97.6 459.6 52.4 414.4 41 403.1l11.3-11.3zm305.5 11.3l45.3 45.3 45.3-45.3-45.3-45.3-45.3 45.3zm33.9 56.6l-45.3-45.3-11.3-11.3 11.3-11.3 45.3-45.3 11.3-11.3 11.3 11.3 45.3 45.3L471 403.1l-11.3 11.3-45.3 45.3L403.1 471l-11.3-11.3zM108.9 154.2l45.3-45.3L108.9 63.7 63.7 108.9l45.3 45.3zm0 22.6L97.6 165.5 52.4 120.2 41 108.9 52.4 97.6 97.6 52.4 108.9 41l11.3 11.3 45.3 45.3 11.3 11.3-11.3 11.3-45.3 45.3-11.3 11.3z"/>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path fill="currentColor" d="M256 224v32V431.1L377.8 102.2 48.9 224H224h32zM0 208L392.5 62.6 432 48 417.4 87.5 272 480H256 224V448 288 256H192 32 0V224 208z"></path>
                            </svg>
                        )}
                    </div>
                </button>
            </div>
            <div className="column-left-header-row">
                <div className="location-result-grid">
                    {results && results.slice(0, 4).map((result, index) => (
                    <div key={index} className={`location-result-div ${selectedResultIndex === index ? 'selected' : ''}`} onClick={() => handleResultClick(result, index)}>
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
                            <div className="location-result-value">{result.value === 0 ? "SOLD OUT" : result.value}</div>
                            <div className="location-result-distance">{convertDistance(result.distance, country)}</div>
                        </div>
                    </div>
                    ))}
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
            <pre contenteditable="false" className="code-block-examples w-code-block" style={{ display: 'block', overflowX: 'auto', background: '#2b2b2b', color: '#f8f8f2', padding: '0.5em' }}>
              <code className="language-javascript" style={{ whiteSpace: 'pre' }}>{log}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  };

  ReactDOM.render(<LocationService />, document.getElementById('locationService'));