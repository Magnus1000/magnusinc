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

        if (Object.keys(data).length > 0) {
          // Transforming the response data
          const labels = Object.keys(data);
          const dataset = Object.values(data);

          // Calculate the percentages
          const pageViewCount = data['page_view'] || 1; // Use 1 to avoid division by zero
          const percentages = labels.map(label => ((data[label] / pageViewCount) * 100).toFixed(2));

          // Prepare data for the chart
          setChartData({
            labels: labels,
            datasets: [{
              label: 'Event Count',
              data: dataset,
              fill: true,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              tension: 0.1
            }, {
              label: 'Event Percentage',
              data: percentages,
              fill: false,
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              borderColor: 'rgba(255, 159, 64, 1)',
              type: 'line',
              yAxisID: 'y1',
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
        type: 'bar',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Event Count'
              }
            },
            y1: {
              beginAtZero: true,
              type: 'linear',
              position: 'right',
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: 'Event Percentage (%)'
              }
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
        <div className="column-right">
          <div className="column-right-header-row">
            <div className="column-header-wrapper">
              <div className="column-header-text light">BACKEND</div>
              <div className="column-subheader-text light">What you see</div>
            </div>
          </div>
          <div className="chart-wrapper">
            {chartData ? <canvas ref={chartRef} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

console.log('Rendering ConversionService component...');
ReactDOM.render(<ConversionService />, document.getElementById('conversionService'));