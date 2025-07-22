// server.js (Express Backend for Telegram + Razorpay)
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN || "your_bot_token_here";

// Telegram Auth Route
app.get("/auth/telegram", (req, res) => {
  const data = req.query;

  const checkString = Object.keys(data)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const secret = crypto
    .createHash("sha256")
    .update(TELEGRAM_BOT_TOKEN)
    .digest();

  const hash = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  if (hash !== data.hash) {
    return res.status(401).send("Unauthorized: Invalid Telegram login");
  }

  // Send script to call onTelegramAuth in parent window
  return res.send(`
    <script>
      window.opener.onTelegramAuth(${JSON.stringify(data)});
      window.close();
    </script>
  `);
});

// Dummy Routes for other features (replace with real logic)
app.get("/user/:id", (req, res) => {
  const id = req.params.id;
  res.json({
    walletBalance: 25.75,
    airdropsLeft: 4,
    transactions: [],
  });
});

app.post("/complete-task", (req, res) => {
  res.sendStatus(200);
});

app.post("/create-order", (req, res) => {
  const { amount } = req.body;
  const order = {
    id: "order_ABC123",
    amount: amount * 100,
    currency: "INR",
  };
  res.json(order);
});

app.post("/verify-payment", (req, res) => {
  res.sendStatus(200);
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
