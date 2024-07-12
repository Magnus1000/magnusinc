const EmailSignupService = () => {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [view, setView] = React.useState('frontend');
  const emailRef = React.useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (email && email.includes('@')) {
      setIsSubmitting(true);
      console.log(`Email submitted: ${email}`);

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

      const eventData = {
        uuid,
        event_content,
        event_time,
        event_type,
        event_page
      };

      try {
        const responseSendEmail = await fetch('https://magnusinc-magnus1000team.vercel.app/api/sendEmail.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email, uuid: uuid }),
        });

        if (responseSendEmail.ok) {
          console.log('Email successfully sent to the server (sendEmail)');

          const responseCreateUserEvent = await fetch('https://magnusinc-magnus1000team.vercel.app/api/createEventSB.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
          });

          if (responseCreateUserEvent.ok) {
            console.log('Email successfully sent to the server (createUserEvent)');
            setTimeout(() => {
              setIsSubmitting(false);
              setIsSubmitted(true);
            }, 1500);
          } else {
            console.error('Failed to send email to the server (createUserEvent)');
            setIsSubmitting(false);
          }
        } else {
          console.error('Failed to send email to the server (sendEmail)');
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('An error occurred:', error);
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
    console.log('EmailSignupService component mounted.');
  }, []);

  function generateUUID() {
    // ... (keep the existing generateUUID function)
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
      <div className="service-inner-row email">
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
                    disabled={isSubmitting}
                  />
                  <button className="submit-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <svg className="loadingIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path className="fa-secondary" opacity=".4" d="M256 64C150 64 64 150 64 256s86 192 192 192c70.1 0 131.3-37.5 164.9-93.6l.1 .1c-6.9 14.9-1.5 32.8 13 41.2c15.3 8.9 34.9 3.6 43.7-11.7c.2-.3 .4-.6 .5-.9l0 0C434.1 460.1 351.1 512 256 512C114.6 512 0 397.4 0 256S114.6 0 256 0c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/>
                        <path className="fa-primary" d="M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"/>
                      </svg>
                    ) : (
                      'Test'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="confirmation-div">
                <h2 className="success-h2">Email Submitted!</h2>
                <p className="success-text">Thank you for submitting your email. We've sent a confirmation to {email}.</p>
                <p className="success-text">You'll receive updates and news about our services.</p>
              </div>
            )}
          </div>
        </div>
        <div className={`column ${view === 'backend' ? 'active' : ''}`}>
          <div className="column-right">
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<EmailSignupService />, document.getElementById('EmailService'));