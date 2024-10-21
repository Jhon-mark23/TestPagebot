const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');
const config = require('./config.json');

const app = express();
app.use(bodyParser.json());

const colors = {
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

const VERIFY_TOKEN = 'pagebot';

app.use(express.static(path.join(__dirname, 'Music')));

const setGetStartedButton = async () => {
  try {
    const url = `https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${config.pageAccessToken}`;
    const requestBody = {
      get_started: {
        payload: "GET_STARTED_PAYLOAD"
      }
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log(response.data);  // Log the full response to check for any errors

    if (response.data.result === "success") {
      console.log("Get Started button set successfully!");
    } else {
      console.log("Failed to set Get Started button");
    }
  } catch (error) {
    console.error('Error setting Get Started button:', error.response ? error.response.data : error.message);
  }
};
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

setGetStartedButton();
loadMenuCommands();

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

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message) {
          handleMessage(event, config.pageAccessToken);
        } else if (event.postback) {
          handlePostback(event, config.pageAccessToken);
        }
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function logTime() {
  const options = {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };

  const currentTime = new Date().toLocaleString('en-PH', options);
  const logMessage = `Current time (PH): ${currentTime}\n`;
  console.log(logMessage);
}

logTime();
setInterval(logTime, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`${colors.red} Bot Owner: ${config.owner}`);
});
