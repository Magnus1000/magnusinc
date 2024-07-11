const Booking = () => {
  const [services, setServices] = React.useState([]);
  const [bookingSlots, setBookingSlots] = React.useState([]);
  const [website, setWebsite] = React.useState('');
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
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

  const submitBooking = () => {
    // Handle the form submission logic here
    console.log('Website:', website);
    console.log('Email:', email);
    // Add your form submission logic here
  };

  return (
    <div className="booking-div">
        <div className="booking-services-div">
            <h2 className="booking-h2">Available Services</h2>
            {services.map((service, index) => (
                <div key={index}>
                <input type="checkbox" id={`service-${index}`} name="services" value={service.service_name} />
                <label htmlFor={`service-${index}`}>{service.service_name}</label>
                <p>{service.service_description}</p>
                </div>
            ))}
        </div>
        <div className="booking-services-div">
            <h2 className="booking-h2">Available Booking Slots</h2>
            {bookingSlots.map((slot, index) => (
                <div key={index}>
                <p><strong>Slot Name:</strong> {slot.slot_name}</p>
                <p><strong>Date & Time:</strong> {slot.slot_date_time}</p>
                <p><strong>Availability:</strong> {slot.slot_availability}</p>
                </div>
            ))}
        </div>
        <div className="booking-form">
            <div className="website-input-div">
                <label htmlFor="website">Website:</label>
                <input
                    type="text"
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                />
            </div>
            <div className="email-input-div">
            <label htmlFor="email">Email:</label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>
            <button className="primary-button" onClick={submitBooking}>Submit Booking</button>
        </div>
    </div>
  );
};

ReactDOM.render(<Booking />, document.getElementById('booking'));