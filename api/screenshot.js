const axios = require('axios');
const cors = require('cors')();
const { URL } = require('url');

module.exports = (req, res) => {
  cors(req, res, async () => {
    if (req.method === 'POST') {
      let { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const apiKey = process.env.SCRAPINGBEE_API_KEY;
      console.log('API Key:', apiKey ? 'Set' : 'Not set');

      if (!apiKey) {
        console.error('ScrapingBee API key is not set');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      // Function to normalize the URL
      const normalizeUrl = (inputUrl) => {
        // Remove leading/trailing whitespace
        inputUrl = inputUrl.trim();

        // Handle localhost and IP addresses
        if (inputUrl.startsWith('localhost') || /^(\d{1,3}\.){3}\d{1,3}/.test(inputUrl)) {
          return `http://${inputUrl}`;
        }

        // Add protocol if missing
        if (!/^https?:\/\//i.test(inputUrl)) {
          inputUrl = `https://${inputUrl}`;
        }

        try {
          let parsedUrl = new URL(inputUrl);

          // Remove unnecessary 'www.' if present
          if (parsedUrl.hostname.startsWith('www.')) {
            parsedUrl.hostname = parsedUrl.hostname.slice(4);
          }

          // Remove trailing slash
          return parsedUrl.toString().replace(/\/$/, '');
        } catch (error) {
          console.error('Error parsing URL:', error);
          return inputUrl;
        }
      };

      // Normalize the input URL
      url = normalizeUrl(url);

      const createUrlVariations = (inputUrl) => {
        let parsedUrl;
        try {
          parsedUrl = new URL(inputUrl);
        } catch (error) {
          console.error('Error parsing URL:', error);
          return [inputUrl];
        }

        let variations = [
          inputUrl,
          inputUrl.replace(/^https?:\/\//, ''),
          `http://${inputUrl.replace(/^https?:\/\//, '')}`,
          `https://${inputUrl.replace(/^https?:\/\//, '')}`
        ];

        // Add www. variation
        variations.push(`${parsedUrl.protocol}//www.${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`);

        // Add variation without www.
        variations.push(`${parsedUrl.protocol}//${parsedUrl.hostname.replace(/^www\./, '')}${parsedUrl.pathname}${parsedUrl.search}`);

        // Add variations with and without trailing slash
        variations = variations.flatMap(v => [v, v.endsWith('/') ? v.slice(0, -1) : `${v}/`]);

        return [...new Set(variations)]; // Remove duplicates
      };

      const urlVariations = createUrlVariations(url);

      for (const currentUrl of urlVariations) {
        try {
          const response = await axios.get('https://app.scrapingbee.com/api/v1/', {
            params: {
              'api_key': apiKey,
              'url': currentUrl,
              'screenshot': 'true',
            },
            responseType: 'arraybuffer',
            timeout: 30000 // 30 seconds timeout
          });

          res.setHeader('Content-Type', 'image/png');
          return res.status(200).send(response.data);
        } catch (error) {
          console.error(`Error fetching screenshot for ${currentUrl}:`, error);
          if (error.response) {
            console.error('ScrapingBee API response:', error.response.status, error.response.data.toString());
          }
          // If this is the last URL variation, return an error
          if (currentUrl === urlVariations[urlVariations.length - 1]) {
            return res.status(500).json({ error: 'Failed to fetch screenshot' });
          }
          // Otherwise, continue to the next URL variation
        }
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  });
};