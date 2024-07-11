const Booking = () => {
  const [services, setServices] = React.useState([]);
  const [bookingSlots, setBookingSlots] = React.useState([]);

  useEffect(() => {
	const fetchData = async () => {
	  try {
		const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/booking');
		setServices(response.data.services);
		setBookingSlots(response.data.bookingSlots);
	  } catch (error) {
		console.error('Error fetching data:', error);
	  }
	};

	fetchData();
  }, []);

  return (
	<div className="booking-div">
	  <h2>Available Services</h2>
	  {services.map((service, index) => (
		<div key={index}>
		  <input type="checkbox" id={`service-${index}`} name="services" value={service.service_name} />
		  <label htmlFor={`service-${index}`}>{service.service_name}</label>
		  <p>{service.service_description}</p>
		</div>
	  ))}
	</div>
  );
};

ReactDOM.render(<Booking />, document.getElementById('booking'));