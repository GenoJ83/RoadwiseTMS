const https = require('follow-redirects').https;

// Infobip configuration
const INFOBIP_CONFIG = {
    hostname: process.env.INFOBIP_BASE_URL || 'rpzr1p.api.infobip.com',
    path: '/sms/2/text/advanced',
    headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    maxRedirects: 20
};

// Send SMS via Infobip
async function sendSMS(to, message, from = '447491163443') {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            "messages": [
                {
                    "destinations": [{ "to": to }],
                    "from": from,
                    "text": message
                }
            ]
        });

        const options = {
            method: 'POST',
            hostname: INFOBIP_CONFIG.hostname,
            path: '/sms/2/text/advanced',
            headers: {
                'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            maxRedirects: 20
        };

        const req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                const body = Buffer.concat(chunks);
                console.log(`SMS sent to ${to}:`, body.toString());
                resolve({
                    success: true,
                    messageId: 'sent',
                    status: 'sent'
                });
            });

            res.on("error", function (error) {
                console.error('Infobip error:', error);
                reject(error);
            });
        });

        req.on('error', function (error) {
            console.error('Request error:', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Send traffic light command to Arduino
async function sendTrafficCommand(arduinoPhone, direction, state) {
    const command = `${direction}:${state}`;
    return await sendSMS(arduinoPhone, command);
}

// Send emergency alert to multiple numbers
async function sendEmergencyAlert(phoneNumbers, message) {
    const results = [];

    for (const phone of phoneNumbers) {
        try {
            const result = await sendSMS(phone, `🚨 EMERGENCY: ${message}`);
            results.push({ phone, success: true, result });
        } catch (error) {
            results.push({ phone, success: false, error: error.message });
        }
    }

    return results;
}

// Send status update
async function sendStatusUpdate(phone, status) {
    const message = `Traffic Status Update:\n${status}`;
    return await sendSMS(phone, message);
}

// Send to multiple destinations
async function sendSMSToMultiple(phoneNumbers, message, from = '447491163443') {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            "messages": [
                {
                    "destinations": phoneNumbers.map(phone => ({ "to": phone })),
                    "from": from,
                    "text": message
                }
            ]
        });

        const options = {
            method: 'POST',
            hostname: INFOBIP_CONFIG.hostname,
            path: INFOBIP_CONFIG.path,
            headers: {
                ...INFOBIP_CONFIG.headers,
                'Content-Length': Buffer.byteLength(postData)
            },
            maxRedirects: INFOBIP_CONFIG.maxRedirects
        };

        const req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                const body = Buffer.concat(chunks);
                try {
                    const response = JSON.parse(body.toString());
                    console.log(`Bulk SMS sent to ${phoneNumbers.length} recipients:`, response);
                    resolve({
                        success: true,
                        messageId: response.messages?.[0]?.messageId,
                        status: response.messages?.[0]?.status?.groupName || 'sent',
                        recipients: phoneNumbers.length
                    });
                } catch (error) {
                    console.error('Error parsing Infobip response:', error);
                    resolve({
                        success: true,
                        messageId: 'unknown',
                        status: 'sent',
                        recipients: phoneNumbers.length
                    });
                }
            });

            res.on("error", function (error) {
                console.error('Infobip response error:', error);
                reject(error);
            });
        });

        req.on('error', function (error) {
            console.error('Infobip request error:', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

module.exports = {
    sendSMS,
    sendTrafficCommand,
    sendEmergencyAlert,
    sendStatusUpdate,
    sendSMSToMultiple
}; 