const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend files (from public folder)
app.use(express.static(path.join(__dirname, 'public')));

// Add Telegram Auth handler
app.get('/auth/telegram', (req, res) => {
  const { id, first_name, username } = req.query;

  if (!id || !username) {
    return res.status(400).send('Missing Telegram user data');
  }

  console.log('✅ Telegram login:', { id, first_name, username });

  // You can store user info in DB or session here if needed

  // Redirect to homepage/dashboard
  res.redirect('/');
});

// Fallback route if nothing matches (optional)
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
