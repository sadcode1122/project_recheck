const axios = require('axios');

/**
 * ฟังก์ชันสำหรับสแกนหา URL ปลายทางจริงและตรวจสอบ Status
 * @param {string} domain - ชื่อโดเมนที่ต้องการตรวจสอบ
 * @returns {Object} - ผลลัพธ์ประกอบด้วย url ปลายทาง และ status
 */
const getFinalUrlAndStatus = async (domain) => {
    const protocols = [`https://${domain}`, `http://${domain}`];
    let finalUrl = `https://${domain}`; // ค่าเริ่มต้นถ้าเกิดข้อผิดพลาด
    let finalStatus = 404;

    for (let targetUrl of protocols) {
        try {
            const response = await axios.get(targetUrl, {
                timeout: 8000,
                maxRedirects: 10,
                validateStatus: false,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            // ดึง URL ปลายทางสุดท้ายหลังจาก Redirect
            finalUrl = response.request.res.responseUrl || targetUrl;
            finalStatus = response.status;

            // ถ้าเจอ 200 แล้วให้หยุดลอง protocol อื่นทันที
            if (finalStatus === 200) break;
        } catch (err) {
            // หาก Protocol นี้มีปัญหา (เช่น https ล่ม) จะวนไปลอง http ต่อ
            continue;
        }
    }

    return { finalUrl, finalStatus };
};

module.exports = { getFinalUrlAndStatus };