// /api/fetchClosestResults.js
const Airtable = require('airtable');
const cors = require('cors')();

module.exports = (req, res) => {
  cors(req, res, async () => {
    const { date } = req.body;

    try {
      Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: process.env.AIRTABLE_API_KEY
      });
      const base = Airtable.base(process.env.AIRTABLE_APP_ID);

      // Fetch services
      const services = await new Promise((resolve, reject) => {
        let allServices = [];
        base(process.env.AIRTABLE_SERVICES_TABLE).select({
          fields: ['service_name', 'header_3']
        }).eachPage((records, fetchNextPage) => {
          allServices = allServices.concat(records.map(record => ({
            service_name: record.get('service_name'),
            service_description: record.get('header_3'),
          })));
          fetchNextPage();
        }, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(allServices);
          }
        });
      });

      console.log(`Fetched services: ${JSON.stringify(services)}`);

      // Fetch and filter booking slots
      const bookingSlots = await new Promise((resolve, reject) => {
        let allSlots = [];
        base(process.env.AIRTABLE_CALENDAR_TABLE).select({
          fields: ['slot_name', 'slot_date_time', 'slot_availability'],
          filterByFormula: `IS_AFTER({slot_date_time}, '${date}')`
        }).eachPage((records, fetchNextPage) => {
          allSlots = allSlots.concat(records.map(record => ({
            slot_name: record.get('slot_name'),
            slot_date_time: record.get('slot_date_time'),
            slot_availability: record.get('slot_availability'),
          })));
          fetchNextPage();
        }, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(allSlots);
          }
        });
      });

      console.log(`Fetched and filtered booking slots: ${JSON.stringify(bookingSlots)}`);

      // Combine the results
      res.json({ services, bookingSlots });
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while fetching data from Airtable' });
    }
  });
};