// server.js (working backend with Telegram auth route)
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Telegram auth route
app.get('/auth/telegram', (req, res) => {
  const { id, first_name, username } = req.query;

  if (!id || !first_name || !username) {
    return res.status(400).send('Missing required Telegram auth data');
  }

  // Example logic: create session, check database, etc.
  // Here, we just return a success message
  res.send(`<h2>Welcome, ${first_name} (@${username})! Your ID is ${id}</h2>`);
});

// Default 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
