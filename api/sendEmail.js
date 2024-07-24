const axios = require('axios');
const cors = require('cors');

// Initializing CORS handler
const corsHandler = cors();

// Function to simplify OS
function simplifyOS(os) {
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
    try {
        console.log('Inside the serverless function...');
        console.log('Request body:', req.body);

        corsHandler(req, res, async () => {
            if (req.method === 'POST') {
                try {
                    let eventContent, simplifiedOS, browser, device;

                    try {
                        eventContent = JSON.parse(req.body.event_content);
                        simplifiedOS = simplifyOS(eventContent.deviceInfo?.os);
                        browser = eventContent.deviceInfo?.browser || 'unknown';
                        device = eventContent.deviceInfo?.device || 'unknown';
                    } catch (parseError) {
                        console.error('Error parsing event_content:', parseError);
                        eventContent = {};
                        simplifiedOS = 'unknown';
                        browser = 'unknown';
                        device = 'unknown';
                    }

                    const newBody = {
                        ...req.body,
                        simplified_os: simplifiedOS,
                        browser: browser,
                        device: device
                    };

                    // Replace with your Make webhook URL
                    const response = await axios.post('https://hook.us1.make.com/hwokeowcw3so3jfkgy5pnns0o2r9mkd6', newBody, {
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