const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { processPrompt } = require('./warpAgent');
const { previewWarp } = require('./warpAgent');
const config = require('./configs/config');
const { isAliasAvailable } = require('./utils/warpManager');

// Create a temporary directory for QR code images if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

/**
 * Initialize and start the Telegram bot
 * @param {string} token - Telegram bot token
 * @returns {TelegramBot} - The initialized bot instance
 */
function startTelegramBot(token) {
  // Create a bot instance
  const bot = new TelegramBot(token, { polling: true });
  
  // Command to start the bot and show help
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    
    const welcomeMessage = `
Hello ${username}! 👋 I'm the MultiversX Warp Generator Bot.

I can help you create blockchain transactions using simple commands. Here's how to use me:

🔹 *Create a Warp*
Send: \`/warp stake 10 EGLD\`
I'll generate a warp link for staking 10 EGLD.

🔹 *Create a Warp with Alias*
Send: \`/warp swap 1 EGLD for USDC alias=my-swap\`
I'll create a warp with the alias "my-swap".

🔹 *Preview a Warp*
Send: \`/preview lend 100 USDC\`
I'll show you what the warp will look like without creating it.

🔹 *Check Alias Availability*
Send: \`/check-alias my-alias\`
I'll tell you if the alias is available.

🔹 *Get Help*
Send: \`/help\`
I'll show this message again.

Try it now by sending a command! 🚀
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  });
  
  // Help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `
*MultiversX Warp Generator Bot Commands*

🔹 *Basic Commands*
\`/warp [prompt]\` - Create a warp from your prompt
\`/warp [prompt] alias=[name]\` - Create a warp with a custom alias
\`/preview [prompt]\` - Preview a warp without creating it
\`/check-alias [name]\` - Check if an alias is available

🔹 *Example Prompts*
\`stake 10 EGLD\`
\`swap 1 EGLD for USDC\`
\`lend 100 USDC\`
\`borrow 500 USDC with 2 EGLD as collateral\`
\`send 0.5 EGLD to erd1...\`

🔹 *Group Usage*
In groups, you must use the commands with a / prefix.
Example: \`/warp stake 10 EGLD\`

Need more help? Visit our website or contact support.
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  });
  
  // Command to check alias availability
  bot.onText(/\/check-alias (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const alias = match[1].trim();
    
    bot.sendMessage(chatId, `Checking availability of alias: "${alias}"...`);
    
    try {
      const isAvailable = await isAliasAvailable(alias);
      
      if (isAvailable) {
        bot.sendMessage(chatId, `✅ Good news! The alias "${alias}" is available and can be used for your warp.`);
      } else {
        bot.sendMessage(chatId, `❌ The alias "${alias}" is already taken. Please try a different one.`);
      }
    } catch (error) {
      console.error('Error checking alias availability:', error);
      bot.sendMessage(chatId, `Error checking alias availability: ${error.message}`);
    }
  });
  
  // Command to preview a warp
  bot.onText(/\/preview (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const prompt = match[1].trim();
    
    bot.sendMessage(chatId, `Previewing warp for: "${prompt}"...`);
    
    try {
      const preview = await previewWarp(prompt);
      
      let previewMessage = `
*Warp Preview for:* "${prompt}"

*Name:* ${preview.warp.name}
*Title:* ${preview.warp.title}
*Description:* ${preview.warp.description || 'None'}

*Actions:*
`;
      
      preview.warp.actions.forEach((action, index) => {
        previewMessage += `\n*Action ${index + 1}:* ${action.label}\n`;
        previewMessage += `Type: ${action.type}\n`;
        
        if (action.type === 'contract') {
          previewMessage += `Contract: \`${action.address}\`\n`;
          previewMessage += `Function: \`${action.func}\`\n`;
          previewMessage += `Value: ${action.value || '0'} EGLD\n`;
        } else if (action.type === 'transfer') {
          previewMessage += `Destination: \`${action.destination}\`\n`;
          previewMessage += `Value: ${action.value || '0'} EGLD\n`;
        }
      });
      
      previewMessage += `\n*To create this warp, use:* \`/warp ${prompt}\``;
      
      bot.sendMessage(chatId, previewMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error previewing warp:', error);
      bot.sendMessage(chatId, `Error previewing warp: ${error.message}`);
    }
  });
  
  // Command to create a warp
  bot.onText(/\/warp (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const fullPrompt = match[1].trim();
    
    // Check if an alias is specified
    let prompt = fullPrompt;
    let alias = null;
    
    const aliasMatch = fullPrompt.match(/alias=([a-zA-Z0-9-_]+)/);
    if (aliasMatch) {
      alias = aliasMatch[1];
      // Remove the alias part from the prompt
      prompt = fullPrompt.replace(/\s*alias=[a-zA-Z0-9-_]+\s*/, ' ').trim();
    }
    
    bot.sendMessage(chatId, `Creating warp for: "${prompt}"${alias ? ` with alias: "${alias}"` : ''}...`);
    
    try {
      const result = await processPrompt(prompt, alias);
      
      // Generate a QR code image
      const qrImagePath = path.join(tempDir, `qr-${Date.now()}.png`);
      await qrcode.toFile(qrImagePath, result.fallbackLink || result.link);
      
      // Prepare the message
      let warpMessage = `
*Your Warp is Ready!* 🚀

*Transaction Hash:* \`${result.txHash}\`
`;

      if (result.alias) {
        warpMessage += `*Alias:* \`${result.alias}\`\n\n`;
        warpMessage += `*Alias Link:*\n${result.link}\n`;
        warpMessage += `_(This link uses your alias and may take a few minutes to work properly)_\n\n`;
      }
      
      warpMessage += `*Hash Link (Always Works):*\n${result.fallbackLink || result.link}\n`;
      warpMessage += `_(This link uses the transaction hash directly and will always work)_\n\n`;
      
      if (result.explorerLink) {
        warpMessage += `*View on Explorer:*\n${result.explorerLink}\n\n`;
      }
      
      if (result.aliasError) {
        warpMessage += `⚠️ *Alias Registration Issue:* ${result.aliasError}\n`;
        warpMessage += `Don't worry! You can still use your warp with the Hash Link provided above.\n\n`;
      }
      
      warpMessage += `*Scan the QR code below to access your warp:*`;
      
      // Send the message with the QR code
      bot.sendMessage(chatId, warpMessage, { parse_mode: 'Markdown' })
        .then(() => {
          // Send the QR code as a photo
          bot.sendPhoto(chatId, qrImagePath)
            .then(() => {
              // Delete the temporary file after sending
              fs.unlinkSync(qrImagePath);
            });
        });
      
    } catch (error) {
      console.error('Error creating warp:', error);
      
      let errorMessage = `Error creating warp: ${error.message}`;
      
      if (error.helpfulTips && error.helpfulTips.length > 0) {
        errorMessage += '\n\nHelpful Tips:';
        error.helpfulTips.forEach(tip => {
          errorMessage += `\n• ${tip}`;
        });
      }
      
      bot.sendMessage(chatId, errorMessage);
    }
  });
  
  // Handle inline queries (for future expansion)
  bot.on('inline_query', async (query) => {
    const results = [];
    
    // For now, just provide some example commands
    if (query.query.length === 0) {
      results.push({
        type: 'article',
        id: 'help',
        title: 'How to use this bot',
        description: 'Click here to learn how to use the MultiversX Warp Generator Bot',
        input_message_content: {
          message_text: 'Use /warp [prompt] to create a warp. For example: /warp stake 10 EGLD'
        }
      });
      
      // Add some example commands
      const examples = [
        { id: 'stake', prompt: 'stake 10 EGLD' },
        { id: 'swap', prompt: 'swap 1 EGLD for USDC' },
        { id: 'send', prompt: 'send 0.5 EGLD to erd1...' }
      ];
      
      examples.forEach(example => {
        results.push({
          type: 'article',
          id: example.id,
          title: `Example: ${example.prompt}`,
          description: `Create a warp to ${example.prompt}`,
          input_message_content: {
            message_text: `/warp ${example.prompt}`
          }
        });
      });
    }
    
    bot.answerInlineQuery(query.id, results);
  });
  
  // Log errors
  bot.on('polling_error', (error) => {
    console.error('Telegram bot polling error:', error);
  });
  
  console.log('Telegram bot started successfully!');
  return bot;
}

module.exports = { startTelegramBot }; 