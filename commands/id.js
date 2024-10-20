module.exports = {
  name: 'id',
  description: 'Show sender ID',
  author: 'System',
  role: 1,
  execute(senderId, args, pageAccessToken, sendMessage) {
    // Construct the response message
    const response = `senderId: ${senderId}`;
    
    // Send the message
    sendMessage(senderId, { text: response }, pageAccessToken);
  }
};