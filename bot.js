require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Bot DB connected'))
  .catch(err => console.error(err));

// User Model
const User = mongoose.model('User', new mongoose.Schema({
  telegramId: String,
  username: String,
  walletBalance: { type: Number, default: 0 },
  tasksCompleted: { type: Object, default: {} },
  transactions: [{
    type: { type: String },
    amount: Number,
    date: { type: Date, default: Date.now }
  }]
}));

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id.toString();
  const username = msg.from.username;

  let user = await User.findOne({ telegramId: chatId });
  if (!user) {
    user = new User({ telegramId: chatId, username });
    await user.save();
  }

  await bot.sendMessage(chatId, `Hello ${username || 'friend'}! 👋\nWelcome to the Airdrop Bot.\nUse /verify to complete your tasks.`);
});

bot.onText(/\/verify/, async (msg) => {
  const chatId = msg.chat.id.toString();
  const user = await User.findOne({ telegramId: chatId });
  if (!user) return bot.sendMessage(chatId, 'User not found.');

  user.tasksCompleted.telegramJoined = true;
  await user.save();

  bot.sendMessage(chatId, '✅ Verified Telegram join! You can now return to the site.');
});

