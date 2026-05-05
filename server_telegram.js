require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

// --- 1. IMPORT MODELS & FUNCTIONS ---
// ใช้ Model เดียวกันกับที่ใช้ใน server.js เพื่อให้ฐานข้อมูลเป็นก้อนเดียวกัน
const Domain = require('./models/Domain'); 
const { getFinalUrlAndStatus } = require('./functions/get_url');
const { checkPardDomain } = require('./functions/get_url_parddomain');
const { getPathSuffix } = require('./functions/check_path_suffix');

// --- 2. SETTINGS ---
const token = process.env.TELEGRAM_BOT_TOKEN; // ใส่ Token ในไฟล์ .env
const mongoURI = process.env.MONGODB_URI;

const bot = new TelegramBot(token, { polling: true });

// เชื่อมต่อ MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Telegram Bot connected to MongoDB!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 3. BOT LOGIC ---

bot.onText(/\/recheckall/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const domains = await Domain.find();
        if (domains.length === 0) {
            return bot.sendMessage(chatId, "⚠️ ไม่พบข้อมูลโดเมนในระบบ");
        }

        bot.sendMessage(chatId, `🚀 เริ่มต้นการตรวจสอบโดเมนทั้งหมด ${domains.length} รายการ... (โปรดรอสักครู่)`);

        let failList = [];
        let successCount = 0;

        for (let doc of domains) {
            // รัน Logic เหมือนใน server.js
            const { finalUrl, finalStatus } = await getFinalUrlAndStatus(doc.domain);
            const { url_parddomain, status_parddomain } = await checkPardDomain(finalUrl, doc.parddomain);
            
            let pard_after = "";
            if (doc.parddomain && doc.parddomain !== '-' && doc.parddomain.trim() !== '') {
                pard_after = getPathSuffix(doc.parddomain);
            }

            // อัปเดตลง Database
            await Domain.findByIdAndUpdate(doc._id, {
                url: finalUrl,
                status_domain: finalStatus,
                url_parddomain: url_parddomain,
                status_parddomain: status_parddomain,
                pard_after: pard_after
            });

            // ตรวจสอบว่ารันไม่ได้ (404) หรือไม่
            // เราจะเช็คทั้ง status_domain และ status_parddomain
            if (finalStatus === 404 || status_parddomain === 404) {
                failList.push(doc.domain);
            } else {
                successCount++;
            }

            // หน่วงเวลาเล็กน้อยกันโดนบล็อก
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // --- 4. สรุปผลและส่งข้อความ ---
        let responseMessage = `✅ ตรวจสอบเสร็จสิ้น!\n\n`;
        responseMessage += `📊 ทั้งหมด: ${domains.length} โดเมน\n`;
        responseMessage += `🟢 ผ่าน: ${successCount} โดเมน\n`;
        responseMessage += `🔴 ไม่ผ่าน (404): ${failList.length} โดเมน\n`;

        if (failList.length > 0) {
            responseMessage += `\n❌ รายชื่อโดเมนที่รันไม่ได้:\n`;
            failList.forEach((name, index) => {
                responseMessage += `${index + 1}. ${name}\n`;
            });
        }

        bot.sendMessage(chatId, responseMessage);

    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, `❌ เกิดข้อผิดพลาด: ${err.message}`);
    }
});

console.log("🤖 Telegram Bot is running...");