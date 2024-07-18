const EmailSignupService = () => {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [view, setView] = React.useState('frontend');
  const emailRef = React.useRef(null);
  const [showPointer, setShowPointer] = React.useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (email && email.includes('@')) {
      setIsSubmitting(true);
      addLog(`Email submitted: ${email}`);

      let uuid = Cookies.get('uuid');
      if (uuid) {
        addLog(`UUID fetched from cookies: ${uuid}`);
      } else {
        uuid = generateUUID();
        Cookies.set('uuid', uuid);
        addLog(`UUID not found in cookies. New UUID generated and set: ${uuid}`);
      }

      const event_content = JSON.stringify({ email });
      const event_time = new Date().toISOString();
      const event_type = 'email_capture';
      const event_page = '/services';

      const eventData = {
        uuid,
        event_content,
        event_time,
        event_type,
        event_page
      };

      try {
        addLog('Sending email to server...');
        const responseSendEmail = await fetch('https://magnusinc-magnus1000team.vercel.app/api/sendEmail.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email, uuid: uuid }),
        });

        if (responseSendEmail.ok) {
          addLog('Email successfully sent to the server (sendEmail)');

          addLog('Creating user event...');
          const responseCreateUserEvent = await fetch('https://magnusinc-magnus1000team.vercel.app/api/createEventSB.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
          });

          if (responseCreateUserEvent.ok) {
            addLog('User event created successfully (createUserEvent)');
            setTimeout(() => {
              setIsSubmitting(false);
              setIsSubmitted(true);
              addLog('Email submission process completed');
            }, 1500);
          } else {
            addLog('Failed to create user event (createUserEvent)');
            setIsSubmitting(false);
          }
        } else {
          addLog('Failed to send email to the server (sendEmail)');
          setIsSubmitting(false);
        }
      } catch (error) {
        addLog(`An error occurred: ${error.message}`);
        setIsSubmitting(false);
      }
    }
  };

  React.useEffect(() => {
    if (isSubmitted && emailRef.current) {
      emailRef.current.disabled = true;
    }
  }, [isSubmitted]);

  React.useEffect(() => {
    const handleScroll = () => {
      const emailInputElement = document.getElementById('emailAnchor1');
      if (emailInputElement) {
        const rect = emailInputElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const topTriggerPoint = viewportHeight * 0.3; // 30% of viewport height
        const bottomTriggerPoint = viewportHeight * 0.7; // 70% of viewport height
  
        if (rect.top > topTriggerPoint && rect.top <= bottomTriggerPoint) {
          setShowPointer(true);
          emailInputElement.focus();
        } else {
          setShowPointer(false);
          emailInputElement.blur(); // Remove focus when outside the range
        }
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    // Call handleScroll once to set initial state
    handleScroll();
  
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if (d > 0) {//Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {//Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }


  return (
    <div className="service-row">
      <div className="try-me-div">
          <div className="try-me-text">TRY ME</div>
      </div>
      <div className="toggle-buttons">
        <button className={`toggle-class ${view === 'frontend' ? 'active' : ''}`} onClick={() => setView('frontend')}>Frontend</button>
        <button className={`toggle-class ${view === 'backend' ? 'active' : ''}`} onClick={() => setView('backend')}>Backend</button>
      </div>
      <div className="service-inner-row email">
      {showPointer && view === 'frontend' && (
            <div 
              className="hand-pointer email"
            >
              <img 
                src="https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/66927db8a5ae60cac4f6c1f2_hand-pointer.svg" 
                alt="Pointer" 
              />
            </div>
        )}
        <div className={`column ${view === 'frontend' ? 'active' : ''}`}>
          <div className="column-left">
            {!isSubmitted ? (
              <div className="email-form-div">
                <form className="email-form" onSubmit={handleSubmit}>
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="default-input"
                    id="emailAnchor1"
                    disabled={isSubmitting}
                  />
                  <button className="submit-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <svg className="button-icon spinning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path fill="currentColor" opacity=".4" d="M256 64C150 64 64 150 64 256s86 192 192 192c70.1 0 131.3-37.5 164.9-93.6l.1 .1c-6.9 14.9-1.5 32.8 13 41.2c15.3 8.9 34.9 3.6 43.7-11.7c.2-.3 .4-.6 .5-.9l0 0C434.1 460.1 351.1 512 256 512C114.6 512 0 397.4 0 256S114.6 0 256 0c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/>
                        <path fill="currentColor" d="M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"/>
                      </svg>
                    ) : (
                      'Test'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="confirmation-wrapper">
                <div className="confirmation-div">
                  <h2 className="success-h2">Email Submitted!</h2>
                  <p className="success-text">Thank you for submitting your email. We've sent a confirmation to {email}.</p>
                  <p className="success-text">You'll receive updates and news about our services.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={`column ${view === 'backend' ? 'active' : ''}`}>
          <div className="column-right">
            <pre contentEditable="false" className="code-block-examples w-code-block" style={{ display: 'block', overflowX: 'auto', background: '#2b2b2b', color: '#f8f8f2', padding: '0.5em' }}>
                <code className="language-javascript" id="emailLogs" style={{ whiteSpace: 'pre' }}>
                </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<EmailSignupService />, document.getElementById('EmailService'));
