const axios = require('axios');
const cors = require('cors');

// Initializing CORS handler
const corsHandler = cors(); // Simplify CORS implementation

module.exports = async (req, res) => {
    try {
        console.log('Inside the serverless function...');

        corsHandler(req, res, async () => { // Use corsHandler to handle CORS
            if (req.method === 'POST') {
                try {
                    // Replace with your Make webhook URL
                    const response = await axios.post('https://hook.us1.make.com/hwokeowcw3so3jfkgy5pnns0o2r9mkd6', req.body, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    res.status(200).json(response.data);
                } catch (error) {
                    console.error('Error:', error);
                    res.status(500).json({ message: error.message });
                }
            } else {
                res.setHeader('Allow', ['POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
