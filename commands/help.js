const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'System',
  role: 1,
  execute(senderId, args, pageAccessToken, sendMessage) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return ` | ${String(index + 1).padStart(2, '0')}. ${command.name}`;
    });

    const totalCommands = commandFiles.length;
    const commandsPerPage = 10;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    const currentPage = parseInt(args[0], 10) || 1;

    const page = Math.min(Math.max(currentPage, 1), totalPages);

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = Math.min(startIndex + commandsPerPage, totalCommands);

    const paginatedCommands = commands.slice(startIndex, endIndex);
    const helpMessage = `📖 𝙲𝚘𝚖𝚖𝚊𝚗𝚍 𝙻𝚒𝚜𝚝\n╭─────────────⭓\n${paginatedCommands.join('\n')}\n├─────────────⭓\n |◉ 𝙿𝚊𝚐𝚎𝚜 ${String(page).padStart(2, '0')} of ${String(totalPages).padStart(2, '0')}\n╰─────────────⭓`;

    const quickReplies = {
      text: helpMessage,
      quick_replies: []
    };

    if (page < totalPages) {
      quickReplies.quick_replies.push({
        content_type: 'text',
        title: 'Next Page',
        payload: `help ${page + 1}`
      });
    }

    if (page > 1) {
      quickReplies.quick_replies.push({
        content_type: 'text',
        title: 'Previous Page',
        payload: `help ${page - 1}`
      });
    }

    sendMessage(senderId, quickReplies, pageAccessToken);
  }
};
      
