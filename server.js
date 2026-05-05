require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- 1. IMPORT FUNCTIONS ---
const { getFinalUrlAndStatus } = require('./functions/get_url');
const { checkPardDomain } = require('./functions/get_url_parddomain');
const { getPathSuffix, getSubdomain } = require('./functions/check_path_suffix'); 

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
mongoose.connect(mongoURI)
    .then(() => console.log('✅ เชื่อมต่อ MongoDB สำเร็จ!'))
    .catch(err => console.error('❌ Error:', err));

// --- 3. DATABASE SCHEMA ---
const domainSchema = new mongoose.Schema({
    domain: String,
    sup_domain: String,
    url: String,
    status_domain: Number,
    parddomain: String,
    pard: String,
    url_parddomain: String,
    status_parddomain: Number,
    pard_after: String,
    subdomain_after: String 
});

const Domain = mongoose.model('Domain', domainSchema, 'testdata');

// --- 4. API ROUTES ---

// ดึงข้อมูลไปโชว์หน้า Dashboard
app.get('/api/domains', async (req, res) => {
    try {
        const data = await Domain.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ฟังก์ชันหลักในการสแกน
app.get('/api/scan-urls', async (req, res) => {
    try {
        const domains = await Domain.find();
        console.log("🚀 Starting Deep Scan (Final URL + Subdomain + Suffix)...");

        for (let doc of domains) {
            try {
                // 1. ตรวจสอบ Final URL หลัก
                const { finalUrl, finalStatus } = await getFinalUrlAndStatus(doc.domain);
                
                // 2. ตรวจสอบ URL ปลายทางของ Pard (ไปที่หน้าจริงเพื่อดู URL ล่าสุด)
                const { url_parddomain, status_parddomain } = await checkPardDomain(finalUrl, doc.parddomain);

                // 3. วิเคราะห์สัญลักษณ์ท้าย URL (/) หรือ (.html) หรือ (-)
                let pard_after = "-"; 
                if (url_parddomain && url_parddomain !== '-') {
                    pard_after = getPathSuffix(url_parddomain); 
                }

                // 4. ดึง Subdomain จาก URL ปลายทางที่เจอจริงๆ
                const urlToExtract = (url_parddomain && url_parddomain !== '-') ? url_parddomain : finalUrl;
                const subdomain_after = getSubdomain(urlToExtract);

                // 5. อัปเดตข้อมูลทั้งหมดลง Database
                await Domain.findByIdAndUpdate(doc._id, { 
                    url: finalUrl,
                    status_domain: finalStatus,
                    url_parddomain: url_parddomain, // เก็บ URL เต็มปลายทาง
                    status_parddomain: status_parddomain,
                    pard_after: pard_after, // เก็บแค่สัญลักษณ์ / หรือ .html
                    subdomain_after: subdomain_after
                });
                
                console.log(`✅ Checked: ${doc.domain} | Sub: ${subdomain_after || '-'} | Suffix: ${pard_after}`);

            } catch (loopErr) {
                console.error(`❌ Error scanning ${doc.domain}:`, loopErr.message);
            }

            // หน่วงเวลาเล็กน้อยเพื่อป้องกันการโดนบล็อก
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        res.json({ message: "ตรวจสอบข้อมูลเสร็จสิ้น!" });
    } catch (err) {
        console.error("Scan Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 5. START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});