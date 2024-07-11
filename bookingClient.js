const Booking = () => {
    const [services, setServices] = React.useState([]);
    const [bookingSlots, setBookingSlots] = React.useState([]);
    const [website, setWebsite] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [selectedServices, setSelectedServices] = React.useState([]);
    const [selectedBookingSlot, setSelectedBookingSlot] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [bookingConfirmed, setBookingConfirmed] = React.useState(false);
    const [screenshot, setScreenshot] = React.useState('');
    const [screenshotLoading, setScreenshotLoading] = React.useState(false);
  
    React.useEffect(() => {
      const fetchData = async () => {
        try {
          const currentDate = new Date().toISOString();
          const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/booking', {
            date: currentDate,
          });
          setServices(response.data.services);
          setBookingSlots(response.data.bookingSlots);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsLoading(false);
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
      setIsSubmitting(true);
      try {
        const response = await axios.post('https://magnusinc-magnus1000team.vercel.app/api/makeBooking', {
          website,
          email,
          name,
          selectedServices,
          selectedBookingSlot,
        });
        console.log('Booking submitted successfully:', response.data);
        // Delay setting bookingConfirmed to true by 1 second
        setTimeout(() => {
          setBookingConfirmed(true);
          setIsSubmitting(false);
        }, 1000);
      } catch (error) {
        console.error('Error submitting booking:', error);
        setIsSubmitting(false);
      }
    };

    const handleWebsiteChange = React.useCallback(
        React.useMemo(
            () =>
                debounce(async (url) => {
                    if (url) {
                        setScreenshotLoading(true);
                        try {
                            const apiKey = 'RYSHBF2460F91AWLAH49IB27ISRB2GNFJ6322Z6XG1ZNZGLDCLKL8GL21JG25YJC29AH140W2CLOGOZ3';
                            const encodedUrl = encodeURIComponent(url);
                            const screenshotUrl = `https://app.scrapingbee.com/api/v1/screenshot?api_key=${apiKey}&url=${encodedUrl}&width=1024&height=768`;
                            
                            const response = await fetch(screenshotUrl);
                            if (response.ok) {
                                const blob = await response.blob();
                                const objectUrl = URL.createObjectURL(blob);
                                setScreenshot(objectUrl);
                            } else {
                                console.error('Failed to fetch screenshot');
                                setScreenshot('');
                            }
                        } catch (error) {
                            console.error('Error fetching screenshot:', error);
                            setScreenshot('');
                        }
                        setScreenshotLoading(false);
                    } else {
                        setScreenshot('');
                    }
                }, 500),
            []
        ),
        []
    );

    const WebsitePreview = ({ url, loading }) => {
        return (
            <div className="website-preview" style={{
                maxHeight: url || loading ? '300px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.5s ease-in-out'
            }}>
                {loading ? (
                    <div className="screenshot-loading">Loading preview...</div>
                ) : url ? (
                    <img src={url} alt="Website preview" style={{ width: '100%' }} />
                ) : null}
            </div>
        );
    };

    const isFormValid = email && name && selectedBookingSlot && selectedServices.length > 0;
  
    if (isLoading) {
      return (
        <div className="loading-div">
          <p>Loading...</p>
        </div>
      );
    }

    return (
      <div className="booking-div">
        <div className="try-me-div">
            <div className="try-me-text">BOOK CONSULTATION</div>
        </div>
        {!bookingConfirmed ? (
          <>
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
                            onChange={(e) => {
                                setWebsite(e.target.value);
                                handleWebsiteChange(e.target.value);
                            }}
                        />
                    </div>
                    <WebsitePreview url={screenshot} loading={screenshotLoading} />
                </div>
                <div className="personal-info-div">
                    <h2 className="booking-h2">Enter Your Details</h2>
                    <div className="name-input-div">
                        <input
                        className="default-input"
                        type="text"
                        id="name"
                        value={name}
                        placeholder="Enter name..."
                        onChange={(e) => setName(e.target.value)}
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
              <button 
                className="submit-button" 
                onClick={submitBooking} 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <svg className="loadingIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path className="fa-secondary" opacity=".4" d="M256 64C150 64 64 150 64 256s86 192 192 192c70.1 0 131.3-37.5 164.9-93.6l.1 .1c-6.9 14.9-1.5 32.8 13 41.2c15.3 8.9 34.9 3.6 43.7-11.7c.2-.3 .4-.6 .5-.9l0 0C434.1 460.1 351.1 512 256 512C114.6 512 0 397.4 0 256S114.6 0 256 0c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/>
                    <path className="fa-primary" d="M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"/>
                  </svg>
                ) : (
                  'Submit Booking'
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="booking-confirmation-div">
            <h2>Booking Confirmed!</h2>
            <p>Thank you for your booking, {name}. We've sent a confirmation email to {email}.</p>
            <p>Selected services:</p>
            <ul>
              {selectedServices.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
            <p>Your consultation is scheduled for: {selectedBookingSlot}</p>
          </div>
        )}
      </div>
    );
};

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

ReactDOM.render(<Booking />, document.getElementById('booking'));