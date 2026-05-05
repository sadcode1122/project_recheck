/**
 * ฟังก์ชันวิเคราะห์ส่วนท้ายของ URL
 * คืนค่า: '/' หรือ '.html' หรือ '-'
 */
const getPathSuffix = (urlString) => {
    try {
        if (!urlString || urlString === '-' || urlString.trim() === '') return '-';
        
        const url = new URL(urlString);
        const pathname = url.pathname;

        // 1. ถ้าลงท้ายด้วย /
        if (pathname.endsWith('/')) {
            return '/';
        }
        
        // 2. ถ้าลงท้ายด้วย .html (เช็คแบบไม่สนตัวพิมพ์เล็กใหญ่)
        if (pathname.toLowerCase().endsWith('.html')) {
            return '.html';
        }

        // 3. ถ้าไม่มีทั้งคู่ (เป็นชื่อไฟล์เฉยๆ หรือไม่มี / ปิดท้าย)
        return '-';
    } catch (e) {
        return '-';
    }
};

const getSubdomain = (urlString) => {
    // ... ฟังก์ชันเดิมที่คุณมี ...
    try {
        if (!urlString || urlString === '-' || urlString.trim() === '') return '';
        const url = new URL(urlString);
        const hostParts = url.hostname.split('.');
        if (hostParts.length > 2) return hostParts[0];
        return ''; 
    } catch (e) { return ''; }
};

module.exports = { getPathSuffix, getSubdomain };