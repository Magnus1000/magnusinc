const ConversionService = () => {
  const [chartData, setChartData] = React.useState(null);
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    let uuid = Cookies.get('uuid');
    if (uuid) {
      console.log(`UUID fetched from cookies: ${uuid}`);
    } else {
      uuid = generateUUID();
      Cookies.set('uuid', uuid);
      console.log(`UUID not found in cookies. New UUID generated and set: ${uuid}`);
    }
    console.log('Fetching data from server...');
    fetch('https://magnusinc-magnus1000team.vercel.app/api/fetchConversionData')
      .then(response => {
        console.log('Received response from server');
        return response.json();
      })
      .then(data => {
        console.log('Received data from server:', data);
        if (data.length > 0) {
          const labels = data.map(record => record.event_type);
          const dataset = data.map(record => record.event_count);
          setChartData({
            labels: labels,
            datasets: [{
              label: 'Event Count',
              data: dataset,
              fill: false,
              backgroundColor: 'rgb(75, 192, 192)',
              borderColor: 'rgba(75, 192, 192, 0.2)',
            }],
          });
          console.log('Data processed and chart data set');
        } else {
          console.log('No data received from server');
        }
      })
      .catch((error) => {
        console.error(`Error getting data from server: ${error.message}`);
      });
  }, []);

  React.useEffect(() => {
    if (chartData && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, [chartData]);

  console.log('Rendering component...');
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
          {chartData ? <canvas ref={chartRef} /> : null}
        </div>
      </div>
    </div>
  );
};

console.log('Rendering ConversionService component...');
ReactDOM.render(<ConversionService />, document.getElementById('conversionService'));
