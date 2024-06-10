const ConversionService = () => {
    const [setChartData, chartData] = React.useState('');

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
                <div className="column-subheader-text">What your users see</div>
              </div>
            </div>
            <div className="column-left-header-row">
            </div>
          </div>
          <div className="column-right">
            <div className="column-right-header-row">
              <div className="column-header-wrapper">
                <div className="column-header-text light">BACKEND</div>
                <div className="column-subheader-text light">What you see</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  ReactDOM.render(<ConversionService />, document.getElementById('conversionService'));