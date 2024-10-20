const fs = require('fs');
const axios = require('axios');
const path = require('path')

//const petDataPath = './petData.json';
const petDataPath = path.join(__dirname, 'data', 'petData.json');

let petData = {}; 

const hungerDecreaseInterval = 60 * 60 * 1000; // 1 hour
const sleepCheckInterval = 2 * 60 * 60 * 1000; // 2 hours

// Load pet data from the JSON file
function loadPetData() {
  if (fs.existsSync(petDataPath)) {
    petData = JSON.parse(fs.readFileSync(petDataPath));
  }
}

// Save pet data to the JSON file
function savePetData() {
  fs.writeFileSync(petDataPath, JSON.stringify(petData, null, 2));
}

// Function to generate a status bar for pet attributes
function generateStatusBar(attribute, value) {
  const barLength = 10;
  const filledLength = Math.round((value / 100) * barLength);
  const emptyLength = barLength - filledLength;
  return `${attribute}: [${'█'.repeat(filledLength)}${'░'.repeat(emptyLength)}] ${value}%`;
}

// Function to decrease hunger
function decreaseHunger() {
  for (const ownerId in petData) {
    if (petData[ownerId].hunger > 0) {
      petData[ownerId].hunger -= 10;
      if (petData[ownerId].hunger < 0) petData[ownerId].hunger = 0;
      if (petData[ownerId].hunger <= 10) petData[ownerId].isSick = true; // Pet becomes sick if hunger is 10 or below
      if (petData[ownerId].hunger === 0) {
        // Pet dies if hunger reaches 0
        sendMessage(ownerId, { text: `💀 Oh no! ${petData[ownerId].name} has died of hunger.` }, petData[ownerId].pageAccessToken);
        delete petData[ownerId]; // Remove the pet data
        continue; // Move to the next pet
      }
    }
  }
  savePetData();
}

// Function to check if the pet needs sleep
function checkSleep() {
  for (const ownerId in petData) {
    if (petData[ownerId].energy <= 0) {
      petData[ownerId].isSick = true;
      sendMessage(ownerId, { text: `😴 ${petData[ownerId].name} is very tired and got sick. Please let it sleep.` }, petData[ownerId].pageAccessToken);
    }
  }
  savePetData();
}

// Function to send messages in chunks
async function sendResponseInChunks(senderId, text, pageAccessToken, sendMessage) {
  const maxMessageLength = 2000;
  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

// Function to split a message into chunks
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let chunk = '';
  const words = message.split(' ');

  for (const word of words) {
    if ((chunk + word).length > chunkSize) {
      chunks.push(chunk.trim());
      chunk = '';
    }
    chunk += `${word} `;
  }

  if (chunk) {
    chunks.push(chunk.trim());
  }

  return chunks;
}

// Map of food emojis to hunger values
const emojiHungerMap = {
  '🍓': 10, '🍒': 10, '🍎': 10, '🍉': 10, '🍑': 10,
  '🍊': 15, '🥭': 10, '🍍': 19, '🍋': 12, '🍈': 10,
  '🍏': 14, '🍐': 10, '🥝': 10, '🫒': 10, '🫐': 10,
  '🍇': 11, '🥥': 10, '🍅': 10, '🌶️': -10, '🫚': 10,
  '🥕': 10, '🧅': 10, '🌽': 10, '🥦': 10, '🥒': 4,
  '🥬': 10, '🫛': 10, '🫑': 10, '🥑': 10, '🍠': 10,
  '🍆': 6, '🧄': 10, '🥔': 10, '🍄': 10, '🫘': 10,
  '🌰': 10, '🥜': 3, '🍞': 10, '🫓': 10, '🥐': 10,
  '🥖': 10, '🥯': 10, '🧇': 10, '🥞': 10, '🍳': 10,
  '🥚': 10, '🧀': 10, '🥓': 10, '🥩': 10, '🍗': 10,
  '🍖': 10, '🍔': 10, '🌭': 10, '🥪': 10, '🥨': 10,
  '🍟': 10, '🍕': 10, '🫔': 10, '🌮': 10, '🌯': 10,
  '🥙': 10, '🧆': 10, '🥘': 10, '🍝': 10, '🥫': 10,
  '🫕': 10, '🥗': 10, '🥣': 10, '🍲': 10, '🍛': 10,
  '🍜': 10, '🦪': 10, '🦞': 10, '🍣': 10, '🍤': 10,
  '🥠': 10, '🍚': 10, '🍱': 10, '🥟': 10, '🥡': 10,
  '🍢': 10, '🍙': 10, '🍘': 10, '🍥': 10, '🍡': 10,
  '🥮': 10, '🍧': 10, '🍨': 10, '🍦': 10, '🥧': 10,
  '🍰': 10, '🍮': 10, '🎂': 10, '🧁': 10, '🍭': 10,
  '🍫': 10, '🍩': 10, '🍪': 10, '🍯': 10, '🧂': 10,
  '🧈': 10, '🍿': 10, '🧊': 10, '🫙': 10, '🥤': 10,
  '🧋': 10, '🧃': 10, '🥛': 10, '🍼': 10, '🥃': 10,
  '☕': 10, '🫗': 10, '🫖': 10, '🍵': 10, '🍸': 10,
  '🍹': 10, '🧉': 10, '🍺': 10, '🍶': 10, '🍷': 10,
  '🍾': 10, '🥂': 10, '🍻': 10, '🥃': 10, '🩹': 0,
  '💊': 0, '💉': 0 // Medicine emojis for curing sickness
};

module.exports = {
  name: 'pet',
  description: 'Interact with your virtual pet',
  author: 'Adrian',
  role: 1,
  async execute(senderId, args, pageAccessToken, sendMessage) {
    loadPetData();

    const action = args[0] ? args[0].toLowerCase() : '';
    const petName = petData[senderId] ? petData[senderId].name : 'your pet';

    async function performAction(action, senderId, args) {
      switch (action) {
        case 'new':
          if (!args[1]) {
            sendMessage(senderId, { text: 'Please provide a name for your new pet.' }, pageAccessToken);
            return;
          }
          petData[senderId] = {
            name: args[1],
            hunger: 100,
            energy: 100,
            isSick: false,
            owner: senderId,
            pageAccessToken: pageAccessToken
          };
          savePetData();
          sendMessage(senderId, { text: `Congratulations! You have a new pet named ${args[1]}.` }, pageAccessToken);
          break;

        case 'feed':
          if (!petData[senderId]) {
            sendMessage(senderId, { text: 'You do not have a pet yet. Please create one with the "new" command.' }, pageAccessToken);
            return;
          }

          if (!args[1]) {
            sendMessage(senderId, { text: 'Please provide a food emoji to feed your pet.' }, pageAccessToken);
            return;
          }

          const foodEmoji = args[1];
          const hungerIncrease = emojiHungerMap[foodEmoji];

          if (hungerIncrease !== undefined) {
            petData[senderId].hunger += hungerIncrease;
            if (petData[senderId].hunger > 100) petData[senderId].hunger = 100;
            savePetData();
            sendMessage(senderId, { text: `${petName} enjoyed the ${foodEmoji}!` }, pageAccessToken);
          } else {
            sendMessage(senderId, { text: 'That is not a valid food emoji.' }, pageAccessToken);
          }
          break;

        case 'status':
          if (!petData[senderId]) {
            sendMessage(senderId, { text: 'You do not have a pet yet. Please create one with the "new" command.' }, pageAccessToken);
            return;
          }

          const hungerBar = generateStatusBar('Hunger', petData[senderId].hunger);
          const energyBar = generateStatusBar('Energy', petData[senderId].energy);
          const statusMessage = `${petName}'s status:\n\n${hungerBar}\n${energyBar}`;
          sendResponseInChunks(senderId, statusMessage, pageAccessToken, sendMessage);
          break;

        case 'play':
          if (!petData[senderId]) {
            sendMessage(senderId, { text: 'You do not have a pet yet. Please create one with the "new" command.' }, pageAccessToken);
            return;
          }

          if (petData[senderId].energy > 0) {
            petData[senderId].energy -= 10;
            if (petData[senderId].energy < 0) petData[senderId].energy = 0;
            savePetData();
            sendMessage(senderId, { text: `${petName} had fun playing!` }, pageAccessToken);
          } else {
            sendMessage(senderId, { text: `${petName} is too tired to play. Let it rest first.` }, pageAccessToken);
          }
          break;

        case 'sleep':
          if (!petData[senderId]) {
            sendMessage(senderId, { text: 'You do not have a pet yet. Please create one with the "new" command.' }, pageAccessToken);
            return;
          }

          petData[senderId].energy = 100;
          savePetData();
          sendMessage(senderId, { text: `${petName} had a good rest and is now full of energy!` }, pageAccessToken);
          break;

        case 'heal':
          if (!petData[senderId]) {
            sendMessage(senderId, { text: 'You do not have a pet yet. Please create one with the "new" command.' }, pageAccessToken);
            return;
          }

          if (petData[senderId].isSick) {
            petData[senderId].isSick = false;
            savePetData();
            sendMessage(senderId, { text: `${petName} has been healed!` }, pageAccessToken);
          } else {
            sendMessage(senderId, { text: `${petName} is not sick.` }, pageAccessToken);
          }
          break;

        default:
          sendMessage(senderId, { text: 'Unknown command. Available commands are: new, feed, status, play, sleep, heal.' }, pageAccessToken);
          break;
      }
    }

    await performAction(action, senderId, args);

    // Start intervals for decreasing hunger and checking sleep
    setInterval(decreaseHunger, hungerDecreaseInterval);
    setInterval(checkSleep, sleepCheckInterval);
  }
};