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

    const commands = commandFiles.map(file => {
      const command = require(path.join(commandsDir, file));
      return `╰┈➤ ${command.name} ✧˚\n  ❃ ${command.description}`;
    });

    const totalCommands = commandFiles.length;
    const commandsPerPage = 7;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    const currentPage = parseInt(args[0], 10) || 1;

    // Ensure currentPage is within valid range
    const page = Math.min(Math.max(currentPage, 1), totalPages);

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = Math.min(startIndex + commandsPerPage, totalCommands);

    const paginatedCommands = commands.slice(startIndex, endIndex);
    const helpMessage = `《 ✦ Here are the available commands (Page ${page}/${totalPages}): ✦ 》\n\n${paginatedCommands.join('\n\n')}\n\n╰┈➤ ❝ Total commands: ${totalCommands} ❞\n\n「✦ Use "help [page]" to see more commands. ✦」`;

    sendMessage(senderId, { text: helpMessage }, pageAccessToken);
  }
};