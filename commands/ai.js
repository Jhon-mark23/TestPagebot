const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'heru',
  description: 'Talking to heru bot ai',
  author: 'heru',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const input = (args.join(' ') || 'hi').trim();
    const modifiedPrompt = `${input}`;

    try {
      const response = await axios.get(`https://heru-ai-1kgm.vercel.app/heru?prompt=${encodeURIComponent(modifiedPrompt)}`);
      const data = response.data;
      const formattedMessage = `${response.data.response}`;

      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};