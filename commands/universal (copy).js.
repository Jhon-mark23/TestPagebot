const axios = require('axios');

// API URLs
const apiUrlGpt4 = 'https://deku-rest-api-ywad.onrender.com/gpt4';
const apiUrlPinterest = 'https://deku-rest-api-ywad.onrender.com/api/pinterest';
const apiUrlSpotify = 'https://deku-rest-api-ywad.onrender.com/spotify';

module.exports = {
  name: 'universal',
  description: 'Process user input and route to the appropriate API',
  author: 'Deku & Adrian',
  role: 1,
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const input = args.join(' ').toLowerCase();

    if (checkPinterest(input)) {
      await sendMessage(senderId, { text: 'Please wait while we process your request...' }, pageAccessToken);
      await handlePinterest(senderId, args, pageAccessToken, sendMessage);
    } else if (checkSpotify(input)) {
      await sendMessage(senderId, { text: 'Please wait while we process your request...' }, pageAccessToken);
      await handleSpotify(senderId, args, pageAccessToken, sendMessage);
    } else {
      // No specific command found, default to GPT-4
      await handleGpt4(senderId, args, pageAccessToken, sendMessage);
    }
  }
};

// Function to check if input contains Pinterest-related keywords
function checkPinterest(input) {
  const pinterestKeywords = ['pinterest', 'picture', 'send me a picture', 'photo', 'photos', 'pictures', 'image', 'photograph', 'artwork', 'snapshot', 'portrait', 'painting', 'drawing'];
  const regex = new RegExp(`\\b(${pinterestKeywords.join('|')})\\b`, 'i');
  return regex.test(input);
}

// Function to check if input contains Spotify-related keywords
function checkSpotify(input) {
  const spotifyKeywords = ['spotify', 'song', 'music', 'sing', 'melody', 'tune', 'track', 'composition', 'rhythm', 'harmony'];
  const regex = new RegExp(`\\b(${spotifyKeywords.join('|')})\\b`, 'i');
  return regex.test(input);
}

// Handler for Pinterest API request
async function handlePinterest(senderId, args, pageAccessToken, sendMessage) {
  const query = args.join(' ');

  try {
    const response = await axios.get(apiUrlPinterest, {
      params: { q: query }
    });
    const images = response.data.result;

    if (images && images.length > 0) {
      for (const imageUrl of images) {
        const imageMessage = {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true
            }
          }
        };
        await sendMessage(senderId, imageMessage, pageAccessToken);
      }
    } else {
      await sendMessage(senderId, { text: 'No images found for your query.' }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error fetching Pinterest images:', error);
    await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
  }
}

// Handler for Spotify API request
async function handleSpotify(senderId, args, pageAccessToken, sendMessage) {
  const query = args.join(' ');

  try {
    const response = await axios.get(apiUrlSpotify, {
      params: { q: query }
    });

    const spotifyLink = response.data.result;

    if (spotifyLink) {
      sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: spotifyLink,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } else {
      sendMessage(senderId, { text: 'Sorry, no Spotify link found for that query.' }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error retrieving Spotify link:', error);
    sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
  }
}

// Handler for GPT-4 API request
async function handleGpt4(senderId, args, pageAccessToken, sendMessage) {
  const prompt = args.join(' ');
  try {
    const response = await axios.get(apiUrlGpt4, {
      params: { prompt, uid: senderId }
    });
    let text = response.data.gpt4;

    // Remove initial 'Please wait...' message if present
    text = text.replace('Please wait while we process your request...', '');

    await sendResponseInChunks(senderId, text, pageAccessToken, sendMessage);
  } catch (error) {
    console.error('Error calling GPT-4 API:', error);
    await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
  }
}

// Function to send response with an image
async function sendResponseWithImage(senderId, message, imageUrl, pageAccessToken, sendMessage) {
  const imageMessage = {
    attachment: {
      type: 'image',
      payload: {
        url: imageUrl,
        is_reusable: true
      }
    }
  };

  await sendMessage(senderId, imageMessage, pageAccessToken);
  await sendResponseInChunks(senderId, message, pageAccessToken, sendMessage);
}

// Function to send response in chunks if necessary
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

// Function to split message into chunks
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