const EmailSignupService = () => {
  const [email, setEmail] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const emailRef = React.useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (email && email.includes('@')) {
      console.log(`Email submitted: ${email}`);
      setIsSubmitted(true);
      // Here you can add the code to send the email to your server or API
    } else {
      console.error('Invalid email address');
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

  console.log('Rendering EmailSignupService component...');
  return (
    <div className="service-row">
      <div className="service-inner-row">
        <div className="column-left">
          <form onSubmit={handleSubmit}>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>
        <div className="column-right">
          <div className="column-right-header-row">
            <div className="column-header-wrapper">
              <div className="column-header-text light">BACKEND</div>
              <div className="column-subheader-text light">What you see</div>
            </div>
          </div>
          {/* The section on the right remains unchanged */}
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<EmailSignupService />, document.getElementById('EmailService'));