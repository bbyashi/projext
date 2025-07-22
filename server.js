const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

function checkTelegramAuth(data) {
  const { hash, ...fields } = data;
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const sorted = Object.keys(fields).sort().map(k => `${k}=${fields[k]}`).join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(sorted).digest('hex');
  return hmac === hash;
}

app.get('/auth/telegram', (req, res) => {
  if (!checkTelegramAuth(req.query)) {
    return res.status(403).send('Invalid Telegram login.');
  }

  const user = {
    id: req.query.id,
    first_name: req.query.first_name,
    last_name: req.query.last_name,
    username: req.query.username,
    photo_url: req.query.photo_url
  };

  const script = `
    <script>
      window.opener.onTelegramAuth(${JSON.stringify(user)});
      window.close();
    </script>
  `;
  res.send(script);
});

// Placeholder API endpoints
app.get('/user/:id', (req, res) => {
  res.json({
    walletBalance: 10.5,
    airdropsLeft: 2,
    transactions: [
      { type: 'buy', amount: 5, date: new Date().toISOString() },
      { type: 'claim', amount: 2, date: new Date().toISOString() }
    ]
  });
});

app.post('/create-order', (req, res) => {
  const amount = (req.body.amount || 1) * 100;
  res.json({ id: 'order_123', amount, currency: 'INR' });
});

app.post('/verify-payment', (req, res) => {
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
