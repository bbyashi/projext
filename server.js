const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Fake in-memory database
const users = {};

// Telegram bot setup
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🎉 Welcome to the bot! Visit our site to join the airdrop.');
});

// Telegram login handler
app.get('/auth/telegram', (req, res) => {
  const { id, username, first_name, photo_url } = req.query;

  if (!id) return res.status(400).send('❌ Missing Telegram ID');

  // Save the user in memory (replace with DB in production)
  users[id] = {
    id,
    username,
    first_name,
    photo_url,
    walletBalance: 10,
    transactions: [],
    airdropsLeft: 3
  };

  // Redirect to frontend with Telegram ID
  res.redirect(`https://projext-f7gs.onrender.com/?id=${id}`);
});

// Endpoint to fetch user data
app.get('/user/:id', (req, res) => {
  const user = users[req.params.id];
  if (!user) return res.status(404).send({ error: 'User not found' });
  res.send(user);
});

// Home check
app.get('/', (req, res) => {
  res.send('✅ Backend is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
