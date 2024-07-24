const axios = require('axios');
const cors = require('cors');

// Initializing CORS handler
const corsHandler = cors();

// Function to simplify OS
function simplifyOS(os) {
    console.log('Simplifying OS:', os);
    if (!os) return 'unknown';
    
    const osLower = os.toLowerCase();
    
    if (osLower.includes('mac') || osLower.includes('ios')) return 'mac';
    if (osLower.includes('win')) return 'windows';
    if (osLower.includes('android')) return 'android';
    if (osLower.includes('linux')) return 'linux';
    if (osLower.includes('chromium') || osLower.includes('chrome os')) return 'chrome os';
    
    return 'other';
}

module.exports = async (req, res) => {
    console.log('Function invoked. Method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        corsHandler(req, res, async () => {
            if (req.method === 'POST') {
                try {
                    console.log('Processing POST request');

                    // The deviceInfo is now directly in the request body
                    const simplifiedOS = simplifyOS(req.body.deviceInfo?.os);
                    const browser = req.body.deviceInfo?.browser || 'unknown';
                    const device = req.body.deviceInfo?.device || 'unknown';

                    console.log('Simplified OS:', simplifiedOS);
                    console.log('Browser:', browser);
                    console.log('Device:', device);

                    const newBody = {
                        ...req.body,
                        simplified_os: simplifiedOS,
                        browser: browser,
                        device: device
                    };

                    console.log('Prepared body for webhook:', JSON.stringify(newBody, null, 2));

                    console.log('Sending request to webhook');
                    const response = await axios.post('https://hook.us1.make.com/hwokeowcw3so3jfkgy5pnns0o2r9mkd6', newBody, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    console.log('Webhook response status:', response.status);
                    console.log('Webhook response data:', JSON.stringify(response.data, null, 2));

                    res.status(200).json(response.data);
                } catch (error) {
                    console.error('Error in request processing:', error);
                    console.error('Error stack:', error.stack);
                    res.status(500).json({ message: error.message });
                }
            } else {
                console.log('Method not allowed:', req.method);
                res.setHeader('Allow', ['POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
            }
        });
    } catch (error) {
        console.error('Unhandled error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};