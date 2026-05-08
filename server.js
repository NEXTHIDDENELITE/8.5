const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB কানেকশন স্ট্রিং (আপনারটা এখানে বসানো হয়েছে)
const mongoURI = "mongodb+srv://nexthiddenelite:xnazim%40%23%23123.@nexthiddenelite.igyxjs9.mongodb.net/NHE_DATABASE?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.error("❌ Connection Error:", err));

// ✅ ডাটা স্কিমা (UID কে unique করা হয়েছে যাতে ডুপ্লিকেট না হয়)
const userSchema = new mongoose.Schema({
    uid: { type: String, unique: true, required: true },
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const BOT_TOKEN = "8475138855:AAFQMWnAHUJqGsx06QZFw60lXugY15ynkig";
const CHAT_ID = "8135816344";

app.post("/send", async (req, res) => {
    let uid = req.body.uid;
    if (!uid) return res.json({ status: "no uid" });

    try {
        // ১. ডাটাবেসে চেক করবে UID আগে থেকে আছে কি না
        const existingUser = await User.findOne({ uid });
        if (existingUser) {
            return res.json({ status: "already_added" }); // ডুপ্লিকেট পেলে এখানেই থেমে যাবে
        }

        // ২. নতুন হলে ডাটাবেসে সেভ করবে
        const newUser = new User({ uid });
        await newUser.save();

        // ৩. টেলিগ্রামে মেসেজ পাঠাবে
        await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            params: {
                chat_id: CHAT_ID,
                text: `🔥 NEW TRIAL REQUEST\nUID: ${uid}`
            }
        });

        res.json({ status: "sent" });
    } catch (err) {
        console.log(err);
        res.json({ status: "error" });
    }
});

// ✅ ড্যাশবোর্ড রেন্ডার করার জন্য সব ডাটা পাওয়ার API
app.get("/all-data", async (req, res) => {
    const data = await User.find().sort({ date: -1 });
    res.json(data);
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Server running...");
});
