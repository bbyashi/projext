require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Schema & Model
const userSchema = new mongoose.Schema({
  telegramId: String,
  username: String,
  walletBalance: { type: Number, default: 0 },
  tasksCompleted: { type: Object, default: {} },
  transactions: [{
    type: { type: String },
    amount: Number,
    date: { type: Date, default: Date.now }
  }]
});
const User = mongoose.model('User', userSchema);

// Create or find user
app.post('/auth/telegram', async (req, res) => {
  const { id, username } = req.body;
  let user = await User.findOne({ telegramId: id });
  if (!user) {
    user = new User({ telegramId: id, username });
    await user.save();
  }
  res.status(200).json({ message: 'User authenticated' });
});

// Fetch user data
app.get('/user/:telegramId', async (req, res) => {
  const user = await User.findOne({ telegramId: req.params.telegramId });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    walletBalance: user.walletBalance,
    transactions: user.transactions
  });
});

// Complete task
app.post('/complete-task', async (req, res) => {
  const { telegramId, task } = req.body;
  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.tasksCompleted[task] = true;
  await user.save();
  res.json({ message: 'Task completed' });
});

// Buy airdrop
app.post('/buy-airdrop', async (req, res) => {
  const { telegramId, amount } = req.body;
  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.walletBalance += amount;
  user.transactions.push({ type: 'airdrop', amount });
  await user.save();

  res.json({ message: 'Airdrop purchased' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

