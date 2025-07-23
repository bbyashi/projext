const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Telegram bot setup
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome to the bot!');
});

// Your routes
app.get('/', (req, res) => {
  res.send('Server and bot are running.');
});

app.get('/auth/telegram', (req, res) => {
  const { id, username, first_name } = req.query;
  res.send(`Hello ${first_name} (@${username}), your ID is ${id}`);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
