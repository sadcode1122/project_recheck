const mongoose = require('mongoose');

// นิยามโครงสร้างข้อมูล (The Blueprint)
const domainSchema = new mongoose.Schema({
    
    domain: { type: String, required: true },
    sup_domain: String,
    url: String,           // URL หลักที่สแกนเจอ
    status_domain: Number, // Status ของ URL หลัก
    parddomain: String,    // Path ที่มีมาให้แต่แรก
    url_parddomain: String, // URL ที่พ่วง Path แล้ว
    status_parddomain: Number, // Status ของ URL ที่พ่วง Path
    pard: String,    // ส่วนท้าย (.html, /, -) ที่สกัดออกมา
    pard_after: String,    // ส่วนท้าย (.html, /, -) ที่สกัดออกมา
    subdomain_after: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now } // บันทึกเวลาที่อัปเดตล่าสุด
    
});

// ส่งออก Model เพื่อนำไปใช้งานในไฟล์อื่น
// 'Domain' คือชื่อเรียก Model, 'testdata' คือชื่อ Collection ใน MongoDB
module.exports = mongoose.model('Domain', domainSchema, 'testdata');