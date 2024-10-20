const axios = require('axios');

module.exports = {
  name: 'lyrics',
  description: 'Fetch song lyrics',
  author: 'Deku (rest api)',
  role: 1,
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');
    try {
      const apiUrl = `https://joshweb.click/search/lyrics?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const result = response.data.result;

      if (result && result.lyrics) {
        const lyricsMessage = `Title: ${result.title}\nArtist: ${result.artist}\n\n${result.lyrics}`;

        // Send the lyrics message, split into chunks if necessary
        await sendResponseInChunks(senderId, lyricsMessage, pageAccessToken, sendMessage);

        // Optionally send an image if available
        if (result.image) {
          sendMessage(senderId, {
            attachment: {
              type: 'image',
              payload: {
                url: result.image,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        }
      } else {
        console.error('Error: No lyrics found in the response.');
        sendMessage(senderId, { text: 'Sorry, no lyrics were found for your query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Lyrics API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

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