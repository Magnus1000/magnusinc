const axios = require('axios');
const cors = require('cors')();

module.exports = (req, res) => {
  cors(req, res, async () => {
    if (req.method === 'POST') {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const apiKey = process.env.SCRAPINGBEE_API_KEY;
      console.log('API Key:', apiKey ? 'Set' : 'Not set'); // Log whether the API key is set

      if (!apiKey) {
        console.error('ScrapingBee API key is not set');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const apiUrl = `https://app.scrapingbee.com/api/v1/screenshot?api_key=${apiKey}&url=${encodeURIComponent(url)}&width=1024&height=768`;
      console.log('API URL:', apiUrl.replace(apiKey, 'REDACTED')); // Log the API URL (with key redacted)

      try {
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        
        res.setHeader('Content-Type', 'image/png');
        return res.status(200).send(response.data);
      } catch (error) {
        console.error('Error fetching screenshot:', error.message);
        if (error.response) {
          console.error('ScrapingBee API response:', error.response.status, error.response.data.toString());
        }
        return res.status(500).json({ error: 'Failed to fetch screenshot' });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
};