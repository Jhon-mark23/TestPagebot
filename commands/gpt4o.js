const axios = require('axios');

module.exports = {
  name: 'gpt4o',
  description: 'Conversational GPT-4 with attachments support',
  role: 1,
  author: 'Jay',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    if (!prompt) {
      sendMessage(senderId, { text: '🌟 Hello, I\'m GPT-4o, How may I assist you today?' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://rest-api-production-5054.up.railway.app/ai?prompt=${encodeURIComponent(prompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);

      const text = response.data.message || 'No response received from GPT-4o. Please try again later.';
      const attachments = response.data.attachments || [];

      sendMessage(senderId, { text }, pageAccessToken);

      if (attachments.length > 0) {
        const attachmentMessages = attachments.map(att => {
          if (att.type === 'image') {
            return {
              attachment: {
                type: 'image', // Use the image type for Messenger
                payload: {
                  url: att.url, // Send the image URL directly
                  is_reusable: true // Optionally mark as reusable to avoid re-uploading the same image
                }
              }
            };
          }
          return null; // Handle other attachment types if needed
        }).filter(msg => msg !== null); // Filter out null values

        for (let attachmentMessage of attachmentMessages) {
          sendMessage(senderId, attachmentMessage, pageAccessToken);
        }
      }

    } catch (error) {
      console.error('Error calling GPT-4 API with attachments:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
