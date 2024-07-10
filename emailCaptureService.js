const EmailSignupService = () => {
    const [email, setEmail] = React.useState('');
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [view, setView] = React.useState('frontend');
    const emailRef = React.useRef(null);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (email && email.includes('@')) {
        console.log(`Email submitted: ${email}`);
        setIsSubmitted(true);
  
        let uuid = Cookies.get('uuid');
        if (uuid) {
          console.log(`UUID fetched from cookies: ${uuid}`);
        } else {
          uuid = generateUUID();
          Cookies.set('uuid', uuid);
          console.log(`UUID not found in cookies. New UUID generated and set: ${uuid}`);
        }
  
        const event_content = JSON.stringify({ email });
        const event_time = new Date().toISOString();
        const event_type = 'email_capture';
        const event_page = '/services';
  
        // Define the event data
        const eventData = {
          uuid,
          event_content,
          event_time,
          event_type,
          event_page
        };
  
        try {
          // Sending email to the second serverless function first
          const responseSendEmail = await fetch('https://magnusinc-magnus1000team.vercel.app/api/sendEmail.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, uuid: uuid }), // Include UUID in the request body if it exists
          });
  
          if (responseSendEmail.ok) {
            console.log('Email successfully sent to the server (sendEmail)');
            // Handle success response
  
            // After successfully sending the email, create the user event
            const responseCreateUserEvent = await fetch('https://magnusinc-magnus1000team.vercel.app/api/createEventSB.js', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(eventData),
            });
  
            if (responseCreateUserEvent.ok) {
              console.log('Email successfully sent to the server (createUserEvent)');
              // Handle success response
            } else {
              console.error('Failed to send email to the server (createUserEvent)');
              // Handle server errors or invalid responses
            }
          } else {
            console.error('Failed to send email to the server (sendEmail)');
            // Handle server errors or invalid responses
          }
        } catch (error) {
          console.error('An error occurred:', error);
          // Handle the error appropriately
        }
      }
    };
  
    React.useEffect(() => {
      if (isSubmitted && emailRef.current) {
        emailRef.current.disabled = true; // Disable the email field after submission
      }
    }, [isSubmitted]);
  
    React.useEffect(() => {
      console.log('EmailSignupService component mounted.');
    }, []);
  
    function generateUUID() { // Public Domain/MIT
      var d = new Date().getTime(); // Timestamp
      var d2 = (performance && performance.now && (performance.now() * 1000)) || 0; // Time in microseconds since page-load or 0 if unsupported
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16; // Random number between 0 and 16
        if (d > 0) { // Use timestamp until depleted
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else { // Use microseconds since page-load if supported
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  
    console.log('Rendering EmailSignupService component...');
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
          <div className={`column ${view === 'frontend' ? 'active' : ''}`} style={{ position: 'absolute', width: '100%', transition: 'opacity 0.5s', opacity: view === 'frontend' ? 1 : 0 }}>
            <div className="column-left">
              <div className="email-form-div">
                <form className="email-form" onSubmit={handleSubmit}>
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="email-input"
                  />
                  <button className="submit-button" type="submit">Sign Up</button>
                </form>
              </div>
            </div>
          </div>
          <div className={`column ${view === 'backend' ? 'active' : ''}`}>
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
      </div>
    );
};
  
ReactDOM.render(<EmailSignupService />, document.getElementById('EmailService'));
  