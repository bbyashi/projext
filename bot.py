
from flask import Flask, request, redirect, render_template
from pymongo import MongoClient
import requests
import random
import string
import os

app = Flask(__name__)

# === Configuration ===
BOT_TOKEN = os.getenv("BOT_TOKEN", "7638559011:AAGkFj4RqFobjdCyIZFQf0JFpgyJU_9Awf0")
BOT_USERNAME = "@babyusbot"
ASSIGNER_USERNAME = "@icrescentdivine"
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "-1002606760848")  # Telegram group ID
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://codexkairnex:gm6xSxXfRkusMIug@cluster0.bplk1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DB_NAME = "job_app_db"

# === MongoDB Setup ===
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users = db["submissions"]

# === Helpers ===
def generate_work_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def send_message(chat_id, text, parse_mode=None, reply_markup=None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    if reply_markup:
        payload["reply_markup"] = reply_markup

    response = requests.post(url, json=payload)
    print("Telegram response:", response.json())  # For debug

# === Routes ===

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/apply", methods=["POST"])
def apply():
    form = request.form
    name = form.get('name')
    country_code = form.get('country_code')
    phone = form.get('phone')
    telegram = form.get('telegram').lower().lstrip('@')
    gender = form.get('gender')
    age = form.get('age')
    email = form.get('email')
    full_number = country_code + phone

    if not all([name, country_code, phone, telegram, gender, age, email]):
        return "❌ Missing required fields", 400

    user = users.find_one({"telegram": telegram})
    if user:
        work_code = user["work_code"]
    else:
        work_code = generate_work_code()
        users.insert_one({
            "name": name,
            "phone": full_number,
            "telegram": telegram,
            "gender": gender,
            "age": age,
            "email": email,
            "work_code": work_code
        })

    # ✅ Always notify admin group
    admin_message = (
        f"📝 New Job Application\n\n"
        f"👤 Name: {name}\n"
        f"📱 Telegram: @{telegram}\n"
        f"📞 Phone: {full_number}\n"
        f"⚧ Gender: {gender}\n"
        f"🎂 Age: {age}\n"
        f"✉️ Email: {email}\n"
        f"🔐 Work Code: {work_code}\n"
        f"👤 Assigned To: {ASSIGNER_USERNAME}"
    )
    send_message(ADMIN_CHAT_ID, admin_message)

    return redirect(f"https://t.me/{BOT_USERNAME[1:]}")

@app.route(f"/{BOT_TOKEN}", methods=["POST"])
def telegram_webhook():
    data = request.get_json()
    message = data.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    from_user = message.get("from", {})
    username = from_user.get("username", "").lower()

    text = message.get("text", "")

    # Handle /start command
    if text == "/start":
        send_message(chat_id,
            "👋 Welcome! Please share your contact to verify.\nTap below 👇",
            reply_markup={
                "keyboard": [[{"text": "📲 Send My Number", "request_contact": True}]],
                "one_time_keyboard": True,
                "resize_keyboard": True
            })
        return "ok"

    if 'contact' in message:
        phone_number = message['contact'].get('phone_number', '')
        user = users.find_one({"telegram": username})

        if user and user["phone"].endswith(phone_number[-10:]):
            send_message(chat_id,
                f"✅ Verified!\nHere is your work code: `{user['work_code']}`\nContact: {ASSIGNER_USERNAME}",
                parse_mode='Markdown')
        else:
            send_message(chat_id, "❌ Your number does not match what you submitted on the website.")
    else:
        send_message(chat_id,
            "👋 Please share your contact to proceed.\nTap below 👇",
            reply_markup={
                "keyboard": [[{"text": "📲 Send My Number", "request_contact": True}]],
                "one_time_keyboard": True,
                "resize_keyboard": True
            })

    return "ok"


# === Run Server ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
