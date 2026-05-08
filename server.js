const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ ১. আপনার কানেকশন স্ট্রিং (পাসওয়ার্ড এনকোড করা)
const mongoURI = "mongodb+srv://nexthiddenelite:xnazim%40%23%23123@nexthiddenelite.igyxjs9.mongodb.net/NHE_DATABASE?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected!"))
    .catch(err => console.log("❌ DB Error:", err));

// ✅ ২. ডাটা মডেল তৈরি
const User = mongoose.model('User', new mongoose.Schema({
    uid: { type: String, unique: true, required: true },
    date: { type: Date, default: Date.now }
}));

const BOT_TOKEN = "8475138855:AAFQMWnAHUJqGsx06QZFw60lXugY15ynkig";
const CHAT_ID = "8135816344";

// ✅ ৩. মেইন ফাংশন (ডুপ্লিকেট চেক করবে)
app.post("/send", async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.json({ status: "no uid" });

    try {
        // ডুপ্লিকেট চেক
        const exists = await User.findOne({ uid });
        if (exists) return res.json({ status: "already_added" });

        // ডাটাবেসে সেভ
        await new User({ uid }).save();

        // টেলিগ্রামে সেন্ড
        await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            params: { chat_id: CHAT_ID, text: `🔥 NEW TRIAL REQUEST\nUID: ${uid}` }
        });

        res.json({ status: "sent" });
    } catch (err) {
        res.json({ status: "error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Server Active!"));
