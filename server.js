const express = require('express'); 
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files
app.use(express.static('public'));

// Telegram bot setup
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome to the bot!');
});

// Test route
app.get('/auth/telegram', (req, res) => {
  const { id, username, first_name } = req.query;
  if (!id || !username || !first_name) {
    return res.status(400).send('Missing parameters');
  }

  // Just confirm the backend receives it
  console.log(`Telegram login: ${first_name} (@${username}), id: ${id}`);
  res.redirect('/'); // ✅ Send user back to index.html after login
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
