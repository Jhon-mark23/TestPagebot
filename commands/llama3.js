const axios = require('axios');

module.exports = {
  name: 'llama3',
  description: 'Ask a question to LLaMA-3 AI',
  author: 'Deku (rest api)',
  role: 1,
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');

    try {
      const apiUrl = `https://joshweb.click/api/llama-3-70b?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);

      // Extracting relevant data from the response
      const { status, result, author } = response.data;

      if (status) {
        // Send the response, split into chunks if necessary
        await sendResponseInChunks(senderId, result, pageAccessToken, sendMessage);
      } else {
        console.error('Error: Unsuccessful response from LLaMA-3 API.');
        sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling LLaMA-3 API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

async function sendResponseInChunks(senderId, text, pageAccessToken, sendMessage) {
  const maxMessageLength = 2000;
  if (text.length > maxMessageLength) {
    const chunks = splitMessageIntoChunks(text, maxMessageLength);
    for (const chunk of chunks) {
      await sendMessage(senderId, { text: chunk }, pageAccessToken);
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