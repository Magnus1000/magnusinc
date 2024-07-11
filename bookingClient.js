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
          const currentDate = new Date().toISOString();
          const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/booking', {
            date: currentDate,
          });
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
        <div className="try-me-div">
            <div className="try-me-text">BOOK CONSULTATION</div>
        </div>
        <div className="booking-services-div">
          <h2 className="booking-h2">Select Services</h2>
          <p className="booking-subheader">Select the services you are interested in:</p>
          <div className="booking-services-grid">
            {services.map((service, index) => (
              <div
                key={index}
                className={`service-item ${selectedServices.includes(service.service_name) ? 'selected' : ''}`}
                onClick={() => handleServiceSelection(service.service_name)}
              >
                <h3 className="service-name-h3">{service.service_name}</h3>
                <p className="service-description">{service.service_description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="booking-slots-div">
          <h2 className="booking-h2">Select Consultation Time</h2>
          <p className="booking-subheader">Select a consultation time:</p>
          <div className="booking-slots-grid">
            {bookingSlots.map((slot, index) => (
              <div
                key={index}
                className={`booking-slot ${selectedBookingSlot === slot.slot_name ? 'selected' : ''}`}
                onClick={() => handleSlotSelection(slot.slot_name)}
              >
                <p className="slot-name">{slot.slot_name}</p>
                <p className="slot-date">
                  {new Date(slot.slot_date_time).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
                <p className="slot-availability">{slot.slot_availability}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="booking-form">
            <div className="business-info-div">
                <h2 className="booking-h2">Enter Business Website</h2>
                <div className="website-input-div">
                    <input
                    className="default-input"
                    type="text"
                    id="website"
                    value={website}
                    placeholder="Enter website..."
                    onChange={(e) => setWebsite(e.target.value)}
                    />
                </div>
            </div>
            <div className="personal-info-div">
                <h2 className="booking-h2">Enter Your Details</h2>
                <div className="name-input-div">
                    <input
                    className="default-input"
                    type="email"
                    id="email"
                    value={email}
                    placeholder="Enter name..."
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="email-input-div">
                    <input
                    className="default-input"
                    type="email"
                    id="email"
                    value={email}
                    placeholder="Enter email..."
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>
          <button className="submit-button" onClick={submitBooking}>Submit Booking</button>
        </div>
      </div>
    );
};

ReactDOM.render(<Booking />, document.getElementById('booking'));