const axios = require('axios');

// API URLs
const apiUrlHeruai = 'https://heru-ai-1kgm.vercel.app/heru?prompt=';
const apiUrlPinterest = 'https://joshweb.click/api/pinterest';
const apiUrlSpotify = 'https://joshweb.click/spotify';

// Backup GPT API URL
const apiUrlBackup = 'https://joshweb.click/gpt4?prompt=';

module.exports = {
  name: 'universal',
  description: 'Random api by Jay Mar',
  author: 'Jay Mar',
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
      // No specific command found, default to Heruai API
      await handleHeruai(senderId, args, pageAccessToken, sendMessage);
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

// Handler for Pinterest API request (Limit to 5 images)
async function handlePinterest(senderId, args, pageAccessToken, sendMessage) {
  const query = args.join(' ');

  try {
    const response = await axios.get(apiUrlPinterest, {
      params: { q: query }
    });
    const images = response.data.result;

    if (images && images.length > 0) {
      const limitedImages = images.slice(0, 5); // Limit to 5 images
      for (const imageUrl of limitedImages) {
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

// Handler for Heruai API request (no user ID, using response.data.response)
async function handleHeruai(senderId, args, pageAccessToken, sendMessage) {
  const prompt = args.join(' ');
  const url = `${apiUrlHeruai}${encodeURIComponent(prompt)}`;

  try {
    const response = await axios.get(url);
    const text = response.data.response || 'No response received from Heruai. Please try again later.';

    await sendResponseInChunks(senderId, text, pageAccessToken, sendMessage);
  } catch (error) {
    console.error('Error calling Heruai API:', error);

    // If primary API fails, use the backup API
    const backupUrl = `${apiUrlBackup}${encodeURIComponent(prompt)}`;

    try {
      const backupResponse = await axios.get(backupUrl);
      const text = backupResponse.data.gpt4;

      await sendResponseInChunks(senderId, text, pageAccessToken, sendMessage);
    } catch (backupError) {
      console.error('Error calling backup GPT API:', backupError);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
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
    
