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

// Function to simplify browser
function simplifyBrowser(browser) {
    console.log('Simplifying browser:', browser);
    if (!browser) return 'unknown';
    
    const browserLower = browser.toLowerCase();
    
    if (browserLower.includes('chrome')) return 'chrome';
    if (browserLower.includes('firefox')) return 'firefox';
    if (browserLower.includes('safari')) return 'safari';
    if (browserLower.includes('edge')) return 'edge';
    if (browserLower.includes('opera')) return 'opera';
    if (browserLower.includes('ie') || browserLower.includes('internet explorer')) return 'ie';
    
    return 'other';
}

// Function to simplify vehicle
function simplifyVehicle(vehicle) {
    console.log('Simplifying vehicle:', vehicle);
    if (!vehicle) return 'unknown';
    
    // Extract the first word and convert to lowercase
    return vehicle.split(' ')[0].toLowerCase();
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

                    const simplifiedOS = simplifyOS(req.body.deviceInfo?.os);
                    const simplifiedBrowser = simplifyBrowser(req.body.deviceInfo?.browser);
                    const device = req.body.deviceInfo?.device || 'unknown';
                    const simplifiedVehicle = simplifyVehicle(req.body.selectedCar);

                    console.log('Simplified OS:', simplifiedOS);
                    console.log('Simplified Browser:', simplifiedBrowser);
                    console.log('Device:', device);
                    console.log('Simplified Vehicle:', simplifiedVehicle);

                    const newBody = {
                        ...req.body,
                        simplified_os: simplifiedOS,
                        simplified_browser: simplifiedBrowser,
                        device: device,
                        simplified_vehicle: simplifiedVehicle
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