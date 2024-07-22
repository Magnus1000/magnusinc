const Booking = () => {
  const [services, setServices] = React.useState([]);
  const [bookingSlots, setBookingSlots] = React.useState([]);
  const [website, setWebsite] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [selectedServices, setSelectedServices] = React.useState([]);
  const [selectedBookingSlot, setSelectedBookingSlot] = React.useState('');
  const [selectedSlotId, setSelectedSlotId] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookingConfirmed, setBookingConfirmed] = React.useState(false);
  const [screenshot, setScreenshot] = React.useState('');
  const [screenshotLoading, setScreenshotLoading] = React.useState(false);
  const [websiteError, setWebsiteError] = React.useState('');
  const [formInteracted, setFormInteracted] = React.useState(false);
  const [showPointer, setShowPointer] = React.useState(false);
  const bookingOrigin = "home";

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

  React.useEffect(() => {
    const handleScroll = () => {
      const bookingElement = document.getElementById('bookingAnchor1');
      if (bookingElement) {
        const rect = bookingElement.getBoundingClientRect();
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

  const createEvent = (event_content, event_type) => {
    const uuid = Cookies.get('uuid');
    if (uuid) {
      const eventData = {
        uuid,
        event_content,
        event_type,
        event_page:'/'
      };
  
      fetch('https://magnusinc-magnus1000team.vercel.app/api/createEventSB.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
        .then(response => response.json())
        .then(data => console.log('Event created:', data))
        .catch((error) => console.error('Error creating event:', error));
    }
  };

  const handleFormInteraction = () => {
    if (!formInteracted) {
      setFormInteracted(true);
      createEvent('User interacted with booking form', 'booking_form_interaction');
    }
  };

  const handleSlotSelection = (slot) => {
    setSelectedBookingSlot(slot.slot_name);
    setSelectedSlotId(slot.slot_id);
    handleFormInteraction();
  };

  const handleServiceSelection = (service) => {
    setSelectedServices((prevSelectedServices) =>
      prevSelectedServices.includes(service)
        ? prevSelectedServices.filter((s) => s !== service)
        : [...prevSelectedServices, service]
    );
    handleFormInteraction();
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
        selectedSlotId,
        bookingPage: bookingOrigin,
      });
      console.log('Booking submitted successfully:', response.data);
      createEvent('Booking submitted', 'booking_submitted');
      setTimeout(() => {
        setBookingConfirmed(true);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setIsSubmitting(false);
    }
  };

  const fetchScreenshot = async () => {
    if (website) {
      setScreenshotLoading(true);
      try {
        const response = await fetch('https://magnusinc-magnus1000team.vercel.app/api/screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: website }),
        });
        
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
    }
  };

  const WebsitePreview = ({ url, loading }) => {
    return (
      <div className="website-preview" style={{
        maxHeight: url || loading ? 'none' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.5s ease-in-out',
        position: 'relative'
      }}>
        {loading ? (
          <div className="screenshot-loading">
            <div className="fuzzy-line"></div>
          </div>
        ) : url ? (
          <img src={url} alt="Website preview" style={{ width: '100%' }} />
        ) : null}
      </div>
    );
  };

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    handleFormInteraction();
  };

  const handleWebsiteChange = (e) => {
    const value = e.target.value;
    setWebsite(value);
    
    if (value && !value.includes('.')) {
      setWebsiteError('Please enter a valid domain (e.g., google.com)');
    } else {
      setWebsiteError('');
    }
    handleFormInteraction();
  };

  const handleWebsiteKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (website && !websiteError && !screenshotLoading) {
        fetchScreenshot();
      }
    }
  };

  const isFormValid = email && name && selectedBookingSlot && selectedServices.length > 0;

  if (isLoading) {
    return (
      <div className="loading-div">
        <p>Loading...</p>
      </div>
    );
  }

  const getPointerClass = () => {
    if (selectedServices.length > 0 && selectedBookingSlot) {
      if (website) {
        return 'enter-details';
      }
      return 'enter-website';
    }
    return 'select-service';
  };

  return (
    <div className="booking-div">
      {showPointer && (
          <div 
            className={`hand-pointer ${getPointerClass()}`}
          >
            <img 
              src="https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/66927db8a5ae60cac4f6c1f2_hand-pointer.svg" 
              alt="Pointer" 
            />
          </div>
      )}
      {!bookingConfirmed ? (
        <>
          <div className="booking-services-div">
            <div className="booking-header-wrapper">
              <h2 className="booking-h2" id="bookingAnchor1">Select Services</h2>
              {selectedServices.length > 0 && (
                <p className="selected-services-count-text">
                  {selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'} selected
                </p>
              )}
            </div>
            <p className="booking-subheader">Select the services you are interested in:</p>
            <div className="booking-services-grid">
              {services.map((service, index) => {
                const isSelected = selectedServices.includes(service.service_name);
                return (
                  <div
                    key={index}
                    className={`service-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleServiceSelection(service.service_name)}
                  >
                    <div className={`inner-linework-small-wrapper ${isSelected ? 'selected' : ''}`}>
                      <div className={`inner-linework-small ${isSelected ? 'selected' : ''}`}>
                        <div className={`line-square-small top-left-small ${isSelected ? 'selected' : ''}`}></div>
                        <div className={`line-square-small top-right-small ${isSelected ? 'selected' : ''}`}></div>
                        <div className={`line-square-small bottom-right-small ${isSelected ? 'selected' : ''}`}></div>
                        <div className={`line-square-small bottom-left-small ${isSelected ? 'selected' : ''}`}></div>
                      </div>
                    </div>
                    <h3 className={`service-name-h3 ${isSelected ? 'selected' : ''}`}>{service.service_name}</h3>
                    <p className={`service-description ${isSelected ? 'selected' : ''}`}>{service.service_description}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="booking-slots-div">
            <div className="booking-header-wrapper">
              <h2 className="booking-h2">Select Consultation Time</h2>
            </div>
            <p className="booking-subheader">Select a consultation time:</p>
            <div className="booking-slots-grid">
              {bookingSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`booking-slot ${selectedBookingSlot === slot.slot_name ? 'selected' : ''} ${slot.slot_availability === 'unavailable' ? 'unavailable' : ''}`}
                    onClick={() => handleSlotSelection(slot)}
                  >
                  <p className="slot-date">
                    {new Date(slot.slot_date_time).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="slot-time">
                    {new Date(slot.slot_date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                  </p>
                  <p className="slot-length">30 mins</p>
                </div>
              ))}
            </div>
          </div>
          <div className="booking-form">
            <div className="business-info-div">
              <div className="booking-header-wrapper">
                <h2 className="booking-h2" id="bookingAnchor2">Enter Business Website</h2>
              </div>
              <div className="website-input-div">
                <input
                  className="default-input"
                  type="text"
                  id="website"
                  value={website}
                  placeholder="Enter website..."
                  onChange={handleWebsiteChange}
                  onKeyPress={handleWebsiteKeyPress}
                />
                <button 
                  className="confirm-button" 
                  onClick={fetchScreenshot}
                  disabled={!website || websiteError || screenshotLoading}
                >
                  <div className="button-icon">
                    {screenshotLoading ? (
                      <>
                        Analyzing
                        <svg className="spinning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                          <path fill="currentColor" opacity=".4" d="M256 64C150 64 64 150 64 256s86 192 192 192c70.1 0 131.3-37.5 164.9-93.6l.1 .1c-6.9 14.9-1.5 32.8 13 41.2c15.3 8.9 34.9 3.6 43.7-11.7c.2-.3 .4-.6 .5-.9l0 0C434.1 460.1 351.1 512 256 512C114.6 512 0 397.4 0 256S114.6 0 256 0c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/>
                          <path fill="currentColor" d="M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"/>
                        </svg>
                      </>
                    ) : (
                      'Submit'
                    )}
                  </div>
                </button>
              </div>
              {websiteError && <p className="error-message">{websiteError}</p>}
              <WebsitePreview url={screenshot} loading={screenshotLoading} />
            </div>
            <div className="personal-info-div">
              <div className="booking-header-wrapper">
                <h2 className="booking-h2" id="bookingAnchor3">Enter Your Details</h2>
              </div>
              <div className="name-input-div">
                <input
                  className="default-input"
                  type="text"
                  id="name"
                  value={name}
                  placeholder="Enter name..."
                  onChange={(e) => handleInputChange(e, setName)}
                />
              </div>
              <div className="email-input-div">
                <input
                  className="default-input"
                  type="email"
                  id="email"
                  value={email}
                  placeholder="Enter email..."
                  onChange={(e) => handleInputChange(e, setEmail)}
                />
              </div>
            </div>
            <button 
              className="submit-form-button" 
              onClick={submitBooking} 
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <svg className="loadingIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path className="fa-secondary" opacity=".4" d="M256 64C150 64 64 150 64 256s86 192 192 192c70.1 0 131.3-37.5 164.9-93.6l.1 .1c-6.9 14.9-1.5 32.8 13 41.2c15.3 8.9 34.9 3.6 43.7-11.7c.2-.3 .4-.6 .5-.9l0 0C434.1 460.1 351.1 512 256 512C114.6 512 0 397.4 0 256S114.6 0 256 0c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/>
                  <path className="fa-primary" d="M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"/>
                </svg>
              ) : (
                'Book Consultation'
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="confirmation-wrapper">
          <div class="inner-linework">
            <div class="line-square top-left"></div>
            <div class="line-square top-right"></div>
            <div class="line-square bottom-right"></div>
            <div class="line-square bottom-left"></div>
          </div>
          <div className="confirmation-div">
            <h2 className="confirmation-header">BOOKING CONFIRMED</h2>
            <p className="confirmation-text">Thank you for your booking, {name}. We've sent a confirmation email to {email}.</p>
            <p className="confirmation-text">Selected services:</p>
            <ul>
              {selectedServices.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
            <p className="confirmation-text">Your consultation is scheduled for: {selectedBookingSlot}</p>
          </div>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<Booking />, document.getElementById('booking'));