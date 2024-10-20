const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');

const app = express();
app.use(bodyParser.json());

// ANSI escape codes for coloring
const colors = {
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

const VERIFY_TOKEN = 'pagebot';
const config = require('./config.json'); // Import config.json

// Serve static files from the Music directory
app.use(express.static(path.join(__dirname, 'Music')));

// Endpoint for Facebook webhook verification
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Endpoint for handling messages and postbacks
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message) {
                    handleMessage(event, config.pageAccessToken); // Use pageAccessToken from config.json
                } else if (event.postback) {
                    handlePostback(event, config.pageAccessToken); // Use pageAccessToken from config.json
                }
            });
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Function to log the current date and time in PH time
function logTime() {
    const options = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true  // Use 12-hour format with AM/PM
    };

    const currentTime = new Date().toLocaleString('en-PH', options);
    const logMessage = `Current time (PH): ${currentTime}\n`;
    console.log(logMessage);

} 

// Log the time immediately
logTime();

// Set interval to call logTime every 30 minutes (1800000 milliseconds)
setInterval(logTime, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`${colors.red} Bot Owner: ${config.owner}`); // Access admin property from config.json
});