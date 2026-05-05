const axios = require('axios');

/**
 * ฟังก์ชันสำหรับเช็ค URL ปลายทางของ Pard Domain
 * @param {string} finalUrl - URL หลักที่ได้จากการเช็คครั้งแรก
 * @param {string} parddomain - ค่าซับพาธที่ต้องการเช็ค (เช่น /promo)
 * @returns {object} - คืนค่า url ปลายทางจริงๆ และ status code
 */
const checkPardDomain = async (finalUrl, parddomain) => {
    // ถ้าไม่มีค่า parddomain ให้ส่งค่าว่างกลับไป
    if (!parddomain || parddomain === '-' || parddomain.trim() === '') {
        return { url_parddomain: "-", status_parddomain: 0 };
    }

    try {
        // สร้าง URL เต็มโดยรวม URL หลักกับ Pard เข้าด้วยกัน
        // ลบ / ที่อาจจะซ้ำซ้อนออกก่อนรวม
        const baseUrl = finalUrl.endsWith('/') ? finalUrl.slice(0, -1) : finalUrl;
        const subPath = parddomain.startsWith('/') ? parddomain : `/${parddomain}`;
        const targetUrl = `${baseUrl}${subPath}`;

        // ใช้ axios ยิงไปที่ URL นั้นเพื่อดูปลายทางสุดท้าย
        const response = await axios.get(targetUrl, {
            maxRedirects: 5, // รองรับการกระโดดของ URL 5 ครั้ง
            timeout: 10000,   // รอไม่เกิน 10 วินาที
            validateStatus: function (status) {
                return status >= 200 && status < 500; // ยอมรับ status 200-499 ไม่ให้พังที่ 404
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
            }
        });

        // ดึง URL สุดท้ายที่ระบบไปถึง (Final Destination)
        const finalPardUrl = response.request.res.responseUrl || targetUrl;

        return {
            url_parddomain: finalPardUrl, // เอา URL ปลายทางจริงๆ มากรอก
            status_parddomain: response.status // เก็บ Status จริง (เช่น 200 หรือ 404)
        };

    } catch (error) {
        console.error(`❌ Pard Check Error (${parddomain}):`, error.message);
        return {
            url_parddomain: "-", 
            status_parddomain: error.response ? error.response.status : 500
        };
    }
};

module.exports = { checkPardDomain };