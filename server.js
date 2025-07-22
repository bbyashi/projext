const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend from public/
app.use(express.static(path.join(__dirname, 'public')));

// Telegram auth route
app.get('/auth/telegram', (req, res) => {
  const { id, first_name, username } = req.query;

  if (!id || !username) {
    return res.status(400).send('Missing Telegram user data');
  }

  console.log('Logged in Telegram user:', { id, first_name, username });

  // Redirect after login
  res.redirect('/');
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
