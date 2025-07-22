const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Root route -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Example Telegram auth handler (you can customize)
app.get("/auth/telegram", (req, res) => {
  const { id, first_name, username } = req.query;

  if (!id || !username) {
    return res.status(400).send("Missing Telegram data");
  }

  // ✅ TODO: Save user to DB or session here

  // For now: redirect to dashboard or home
  res.redirect("/");
});

// Buy Airdrop endpoint (if Razorpay or backend logic exists)
app.post("/buy-airdrop", (req, res) => {
  // You’ll implement Razorpay payment creation here
  res.json({ message: "Payment process will go here." });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
