const Booking = () => {
  const [services, setServices] = React.useState([]);
  const [bookingSlots, setBookingSlots] = React.useState([]);
  const [website, setWebsite] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [selectedServices, setSelectedServices] = React.useState([]);
  const [selectedBookingSlot, setSelectedBookingSlot] = React.useState('');

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

  const handleSlotSelection = (slot) => {
    setSelectedBookingSlot(slot);
  };

  const handleServiceSelection = (service) => {
    setSelectedServices((prevSelectedServices) =>
      prevSelectedServices.includes(service)
        ? prevSelectedServices.filter((s) => s !== service)
        : [...prevSelectedServices, service]
    );
  };

  const submitBooking = async () => {
    try {
      const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/makeBooking', {
        website,
        email,
        selectedServices,
        selectedBookingSlot,
      });
      console.log('Booking submitted successfully:', response.data);
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
  };

  return (
    <div className="booking-div">
      <div className="booking-services-div">
        <h2 className="booking-h2">Available Services</h2>
        <div className="booking-services-grid">
            {services.map((service, index) => (
                <div
                    key={index}
                    className={`service-item ${selectedServices.includes(service.service_name) ? 'selected' : ''}`}
                    >
                    <input
                        type="checkbox"
                        id={`service-${index}`}
                        name="services"
                        value={service.service_name}
                        onChange={() => handleServiceSelection(service.service_name)}
                    />
                    <label htmlFor={`service-${index}`}>{service.service_name}</label>
                    <p>{service.service_description}</p>
                </div>
            ))}
        </div>
      </div>
      <div className="booking-slots-div">
        <h2 className="booking-h2">Available Booking Slots</h2>
        <div className="booking-slots-grid">
            {bookingSlots.map((slot, index) => (
            <div
                key={index}
                className={`booking-slot ${selectedBookingSlot === slot.slot_name ? 'selected' : ''}`}
                onClick={() => handleSlotSelection(slot.slot_name)}
            >
                <input
                type="radio"
                id={`slot-${index}`}
                name="bookingSlot"
                value={slot.slot_name}
                checked={selectedBookingSlot === slot.slot_name}
                onChange={() => handleSlotSelection(slot.slot_name)}
                />
                <label htmlFor={`slot-${index}`}>
                    <p className="slot-name">{slot.slot_name}</p>
                    <p className="slot-date">{slot.slot_date_time}</p>
                    <p className="slot-availability">{slot.slot_availability}</p>
                </label>
            </div>
            ))}
        </div>
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