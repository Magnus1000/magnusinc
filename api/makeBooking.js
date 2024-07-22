import axios from 'axios';
const cors = require('cors');

const corsHandler = cors();

module.exports = (req, res) => {
  corsHandler(req, res, async () => {
	const { website, email, selectedServices, selectedBookingSlot, pageSlug, bookingPage } = req.body;

	console.log('Received booking request:', req.body);

	try {
	  const response = await axios.post('https://hook.us1.make.com/y6c61clds14yvapchy7y8lfd5f0m4t8u', {
		website,
		email,
		selectedServices,
		selectedBookingSlot,
		pageSlug,
		booking_page: bookingPage,
	  });
	  console.log('Booking submitted successfully:', response.data);
	  res.status(200).send('Booking submitted successfully');
	} catch (error) {
	  console.error('Error submitting booking:', error);
	  res.status(500).send('Error submitting booking');
	}
  });
};