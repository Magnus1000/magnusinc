// /api/getLocationString.js
const axios = require('axios');
const cors = require('cors')();

module.exports = (req, res) => {
  cors(req, res, async () => {
    const { lat, lng } = req.query;

    try {
      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`, {
        params: {
          access_token: process.env.MAPBOX_ACCESS_TOKEN
        }
      });

      const address = response.data.features[0].place_name;
      const country = response.data.features[0].context.find(item => item.id.startsWith('country')).text;

      res.json({ address, country });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching data from Mapbox' });
    }
  });
};