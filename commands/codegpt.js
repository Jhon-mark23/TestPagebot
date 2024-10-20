const axios = require('axios');

module.exports = {
  name: 'codegpt',
  description: 'Get code snippet from Codegpt API',
  author: 'Deku (rest api)',
  role: 1,
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');
    const apiUrl = `https://joshweb.click/api/codegpt?type=code&lang=nodejs?q=${encodeURIComponent(query)}`;
    
    try {
      const response = await axios.get(apiUrl);

      if (response.data.status) {
        const codeSnippet = response.data.result;

        // Send the response, split into chunks if necessary
        await sendResponseInChunks(senderId, codeSnippet, pageAccessToken, sendMessage);
      } else {
        sendMessage(senderId, { text: '❌ | API Error: Unable to fetch code snippet.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Codestral API:', error);
      sendMessage(senderId, { text: '❌ | An error occurred while processing your request.' }, pageAccessToken);
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