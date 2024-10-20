const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');
const config = require('./config.json'); // Import config.json

const app = express();
app.use(bodyParser.json());

// ANSI escape codes for coloring
const colors = {
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

const VERIFY_TOKEN = 'pagebot';

// Serve static files from the Music directory
app.use(express.static(path.join(__dirname, 'Music')));

// Load and set menu commands
const loadMenuCommands = async () => {
  try {
    const commandsDir = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commandsList = commandFiles.map(file => {
      const command = require(path.join(commandsDir, file));
      return { name: command.name, description: command.description || 'No description available' };
    });

    const loadCmd = await axios.post(`https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${config.pageAccessToken}`, {
      commands: [
        {
          locale: "default",
          commands: commandsList
        }
      ]
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (loadCmd.data.result === "success") {
      console.log("Commands loaded!");
    } else {
      console.log("Failed to load commands");
    }
  } catch (error) {
    console.error('Error loading commands:', error);
  }
};

// Call the loadMenuCommands function to load the commands on startup
loadMenuCommands();

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
    console.log(`${colors.red} Bot Owner: ${config.owner}`); // Access owner property from config.json
});
        
