const LocationService = () => {
  const [logs, setLogs] = React.useState([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [country, setCountry] = React.useState('United States');
  const [uuid, setUuid] = React.useState(null);
  const [url, setUrl] = React.useState(window.location.pathname);
  const [pageLoadRecorded, setPageLoadRecorded] = React.useState(false);
  const [locationServiceRecorded, setLocationServiceRecorded] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = React.useState(null);
  const [view, setView] = React.useState('frontend');
  const [selectedCar, setSelectedCar] = React.useState(null);
  const [showPointer, setShowPointer] = React.useState(false);
  const [pointerPosition, setPointerPosition] = React.useState('select');

  const carOptions = [
    {
      make_model: 'Ford F-150',
      image: 'https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/666636aaca8c5ca3b6212efd_ford-f150.webp'
    },
    {
      make_model: 'Tesla Cybertruck',
      image: 'https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/666636aaa04eecfc857244b1_cybertruck.webp'
    },
    {
      make_model: 'Rivian',
      image: 'https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/666636aaf8c5104598400baa_rivian.webp'
    },
    {
      make_model: 'VW Beetle',
      image: 'https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/6667293fb45b148bef095611_vw2.webp'
    }
  ];

  React.useEffect(() => {
    let uuid = Cookies.get('uuid');
    if (uuid) {
      setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `UUID fetched from cookies: ${uuid}.` }]);
      setUuid(uuid);
    } else {
      uuid = generateUUID();
      Cookies.set('uuid', uuid);
      setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `UUID not found in cookies. New UUID generated and set: ${uuid}.` }]);
      setUuid(uuid);
    }
    fetch('https://ipapi.co/json')
      .then(response => response.json())
      .then(data => {
        const { latitude: lat, longitude: lon, city, country_name: country } = data;
        setLogs(prevLogs => [
          ...prevLogs,
          { event_time: new Date().toISOString(), event_content: "Approx location via IP:" },
          { event_time: new Date().toISOString(), event_content: `Lat: ${lat}, Lng: ${lon}` },
          { event_time: new Date().toISOString(), event_content: `City: ${city}` },
          { event_time: new Date().toISOString(), event_content: `Country: ${country}` }
        ]);

        if (!pageLoadRecorded) {
          createEvent(uuid, `Page loaded in ${city}, ${country}`, 'page_view');
          setPageLoadRecorded(true);
        }
      })
      .catch((error) => {
        setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `Error getting location via IP: ${error.message}` }]);
      });
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      const selectVehicleElement = document.getElementById('locationAnchor1');
      if (selectVehicleElement) {
        const rect = selectVehicleElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const triggerPoint = viewportHeight * 0.7; // 70% of viewport height
  
        if (rect.top <= triggerPoint) {
          setShowPointer(true);
        } else {
          setShowPointer(false);
        }
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    // Call handleScroll once to set initial state
    handleScroll();
  
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function generateUUID() {
    var d = new Date().getTime();
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function createEvent(uuid, event_content, event_type) {
    const event_page = url;
    const eventData = {
      uuid,
      event_content,
      event_type,
      event_page
    };
    console.log('Event data:', eventData);
    fetch('https://magnusinc-magnus1000team.vercel.app/api/createEventSB.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch((error) => console.error('Error:', error));
  }

  const handleResultClick = (result, index) => {
    setSelectedResultIndex(index);
    setLogs(prevLogs => [
      ...prevLogs,
      { event_time: new Date().toISOString(), event_content: `Result clicked: ${index + 1}` },
      { event_time: new Date().toISOString(), event_content: `Dealer: ${result.dealer}` },
      { event_time: new Date().toISOString(), event_content: `Make/Model: ${result.make_model}` },
      { event_time: new Date().toISOString(), event_content: `Value: ${result.value}` },
      { event_time: new Date().toISOString(), event_content: `Distance: ${result.distance}` }
    ]);
  };

  const fetchLocationString = (lat, lng) => {
    fetch(`https://magnusinc-magnus1000team.vercel.app/api/getLocationString?lat=${lat}&lng=${lng}`)
      .then(response => response.json())
      .then(data => {
        setLogs(prevLogs => [
          ...prevLogs,
          { event_time: new Date().toISOString(), event_content: "Obtained address from coordinates." },
          { event_time: new Date().toISOString(), event_content: `Address: ${data.address}` }
        ]);
        setCountry(data.country);
      })
      .catch((error) => {
        setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `Error fetching location string: ${error.message}` }]);
      });
  };

  const handleCarClick = (make_model) => {
    setSelectedCar(make_model);
    setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `Car filter selected: ${make_model}` }]);
    if (results.length > 0) {
      fetchFilteredResults(make_model);
    }
    setPointerPosition('find');
  };

  const fetchFilteredResults = (make_model) => {
    setIsFetching(true);
    const lastLat = results[0]?.latitude;
    const lastLng = results[0]?.longitude;
    
    if (!lastLat || !lastLng) {
      setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: "Error: No location data available." }]);
      setIsFetching(false);
      return;
    }

    fetch(`https://magnusinc-magnus1000team.vercel.app/api/fetchClosestResults?lat=${lastLat}&lng=${lastLng}&make_model=${make_model}`)
      .then(response => response.json())
      .then(data => {
        setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `Filtered results fetched for ${make_model}.` }]);
        setResults(data.slice(0, 4));
        setIsFetching(false);
      })
      .catch((error) => {
        setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `Error fetching filtered results: ${error.message}` }]);
        setIsFetching(false);
      });
  };

  const handleGetLocation = () => {
    setIsFetching(true);
    setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: "Button clicked." }]);
    if (navigator.geolocation) {
      setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: "Permission granted." }]);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLogs(prevLogs => [
            ...prevLogs,
            { event_time: new Date().toISOString(), event_content: "Precise location via Browser:" },
            { event_time: new Date().toISOString(), event_content: `Lat: ${latitude}, Lng: ${longitude}.` }
          ]);
  
          fetchLocationString(latitude, longitude);
  
          let userUuid = uuid || Cookies.get('uuid');
  
          console.log('userUuid:', userUuid);
  
          if (!userUuid) {
            userUuid = generateUUID();
            Cookies.set('uuid', userUuid);
            setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `UUID not found in state or cookies. New UUID generated and set: ${userUuid}.` }]);
            setUuid(userUuid);
          } else {
            setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `UUID fetched from ${uuid ? 'state' : 'cookies'}: ${userUuid}.` }]);
          }
  
          if (!locationServiceRecorded) {
            createEvent(userUuid, `Location: ${latitude}, ${longitude}`, 'location_service');
            setLocationServiceRecorded(true);
          }
  
          fetch(`https://magnusinc-magnus1000team.vercel.app/api/fetchClosestResults?lat=${latitude}&lng=${longitude}${selectedCar ? `&make_model=${selectedCar}` : ''}`)
            .then(response => response.json())
            .then(data => {
              setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: "Closest results fetched" }]);
              setResults(data.slice(0, 4));
              setIsFetching(false);
            })
            .catch((error) => {
              setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `Error fetching closest results: ${error.message}` }]);
              setIsFetching(false);
            });
        },
        (error) => {
          setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: `Error getting location: ${error.message}` }]);
          setIsFetching(false);
        }
      );
    } else {
      setLogs(prevLogs => [...prevLogs, { event_time: new Date().toISOString(), event_content: "Geolocation not supported by this browser." }]);
      setIsFetching(false);
    }
  };

  const convertDistance = (distance, country) => {
    distance = distance / 1000;
    if (country === 'United States') {
      return `${(distance * 0.621371).toFixed(2)} mi away`;
    } else {
      return `${distance.toFixed(2)} km away`;
    }
  }
  
  return (
    <div className="service-row">
      <div className="try-me-div">
        <div className="try-me-text">TRY ME</div>
      </div>
      <div className="toggle-buttons">
        <button className={`toggle-class ${view === 'frontend' ? 'active' : ''}`} onClick={() => setView('frontend')}>Frontend</button>
        <button className={`toggle-class ${view === 'backend' ? 'active' : ''}`} onClick={() => setView('backend')}>Backend</button>
      </div>
      <div className="service-inner-row">
        {showPointer && view === 'frontend' && (
            <div 
              className={`hand-pointer ${selectedCar ? 'fetch-location' : 'select-vehicle'}`}
            >
              <img 
                src="https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/66927db8a5ae60cac4f6c1f2_hand-pointer.svg" 
                alt="Pointer" 
              />
            </div>
        )}
        <div className={`column ${view === 'frontend' ? 'active' : ''}`}>
          <div className="column-left solid">
            <div className="column-left-header-row">
              <div className="location-header" id="locationAnchor1">Select vehicle</div>
            </div>
            <div className="car-filter-options">
              {carOptions.map((car) => (
                <div 
                  key={car.make_model} 
                  className={`car-filter-option ${selectedCar === car.make_model ? 'selected' : ''}`}
                  onClick={() => handleCarClick(car.make_model)}
                >
                  <img src={car.image} alt={car.make_model} className="car-filter-image" />
                  <div className="car-filter-name">{car.make_model}</div>
                </div>
              ))}
            </div>
            <div className="column-left-button-row">
              <div className="location-header" id="locationAnchor2">Find nearest dealership</div>
              <button className="button-primary w-inline-block" onClick={handleGetLocation}>
                <div className="button-text">
                  {isFetching ? "Fetching..." : "Get Location"}
                </div>
                <div className="button-icon">
                  {isFetching ? (
                    <svg className="spinning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <path fill="currentColor" opacity=".4" d="M256 64C150 64 64 150 64 256s86 192 192 192c70.1 0 131.3-37.5 164.9-93.6l.1 .1c-6.9 14.9-1.5 32.8 13 41.2c15.3 8.9 34.9 3.6 43.7-11.7c.2-.3 .4-.6 .5-.9l0 0C434.1 460.1 351.1 512 256 512C114.6 512 0 397.4 0 256S114.6 0 256 0c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/>
                      <path fill="currentColor" d="M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                      <path fill="currentColor" d="M256 224v32V431.1L377.8 102.2 48.9 224H224h32zM0 208L392.5 62.6 432 48 417.4 87.5 272 480H256 224V448 288 256H192 32 0V224 208H16z"></path>
                    </svg>
                  )}
                </div>
              </button>
            </div>
            <div className="column-left-header-row">
              {isFetching ? (
                <div className="loading-placeholder-div">
                  <div className="loading-placeholder-text">Searching nearest dealerships...</div>
                </div>
              ) : (
                <div className="location-result-grid">
                  {results.length > 0 ? (
                    results.map((result, index) => (
                      <div key={index} className={`location-result-div ${selectedResultIndex === index ? 'selected' : ''}`} onClick={() => handleResultClick(result, index)}>
                        <div className="location-result-value">
                          {result.value === 0 ? "SOLD OUT" : `${result.value} available`}
                        </div>
                        <div className="location-image-div">
                          <div className="image-overlay-div">
                          </div>
                          <img
                            src={result.image_cdn_link}
                            loading="lazy"
                            alt=""
                            className="location-image"
                          />
                        </div>
                        <div className="location-details-div">
                          <div className="location-result-header">{result.make_model}</div>
                          <div className="location-result-name">{result.dealer}</div>
                          <div className="location-result-address">{result.address}</div>
                          {result.distance !== 0 && (
                            <div className="location-result-distance-div">
                              <div className="button-icon w-embed">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                  <path fill="currentColor" d="M352 192c0-88.4-71.6-160-160-160S32 103.6 32 192c0 20.2 9.1 48.6 26.5 82.7c16.9 33.2 39.9 68.2 63.4 100.5c23.4 32.2 46.9 61 64.5 81.9c1.9 2.3 3.8 4.5 5.6 6.6c1.8-2.1 3.6-4.3 5.6-6.6c17.7-20.8 41.1-49.7 64.5-81.9c23.5-32.3 46.4-67.3 63.4-100.5C342.9 240.6 352 212.2 352 192zm32 0c0 88.8-120.7 237.9-170.7 295.9C200.2 503.1 192 512 192 512s-8.2-8.9-21.3-24.1C120.7 429.9 0 280.8 0 192C0 86 86 0 192 0S384 86 384 192zm-240 0a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm48 80a80 80 0 1 1 0-160 80 80 0 1 1 0 160z" />
                                </svg>
                              </div>
                              <div className="location-result-distance">{convertDistance(result.distance, country)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    Array(4).fill(0).map((_, index) => (
                      <div key={index} className="location-result-placeholder"></div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`column ${view === 'backend' ? 'active' : ''}`}>
          <div className="column-right">
            <pre contentEditable="false" className="code-block-examples w-code-block" style={{ display: 'block', overflowX: 'auto', background: '#2b2b2b', color: '#f8f8f2', padding: '0.5em' }}>
                <code className="language-javascript" style={{ whiteSpace: 'pre' }}>
                  {logs.map((log, index) => (
                    <div key={index} className="event-log">
                      <span className="code-line-number">{index + 1}</span> {JSON.stringify(log)}
                    </div>
                  ))}
                </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<LocationService />, document.getElementById('locationService'));
