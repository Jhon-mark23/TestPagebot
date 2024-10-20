const axios = require('axios');

module.exports = {
  name: 'lyrics2',
  description: 'Fetch song lyrics',
  author: 'New API (rest api)',
  role: 1,
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');
    try {
      const apiUrl = `https://lyricsapi-1ays.onrender.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const result = response.data;

      if (result && result.lyrics) {
        // Remove "Read more" part from the lyrics
        const lyricsWithoutReadMore = result.lyrics.split('Read more:')[0].trim(); 

        const lyricsMessage = `Title: ${result.title}\nArtist: ${result.artist}\nAlbum: ${result.album}\n\n${lyricsWithoutReadMore}`;

        // Send the lyrics message, split into chunks if necessary
        await sendResponseInChunks(senderId, lyricsMessage, pageAccessToken, sendMessage);

        // Send the image if available
        if (result.image) {
          await sendMessage(senderId, {
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
        await sendMessage(senderId, { text: 'Sorry, no lyrics were found for your query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Lyrics API:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

async function sendResponseInChunks(senderId, text, pageAccessToken, sendMessage) {
  const maxMessageLength = 2000;
  const messages = splitMessageIntoChunks(text, maxMessageLength);
  for (const message of messages) {
    await sendMessage(senderId, { text: message }, pageAccessToken);
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