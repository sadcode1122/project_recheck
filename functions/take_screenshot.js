const puppeteer = require('puppeteer');

const takeScreenshot = async (url) => {
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--ignore-certificate-errors' // ข้ามหน้าแจ้งเตือน SSL หมดอายุ
            ] 
        });
        const page = await browser.newPage();
        
        // ตั้งค่า User-Agent ให้เหมือนคนใช้งานจริง (กันโดนบล็อก)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        await page.setViewport({ width: 1280, height: 720 });

        // ปรับการโหลด: รอแค่ให้มีข้อมูลชุดแรกโผล่มา (domcontentloaded) จะเร็วกว่า networkidle2
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
        
        // รอเพิ่มอีกนิดเพื่อให้หน้าจอหายขาว
        await new Promise(r => setTimeout(r, 3000));

        const imageBuffer = await page.screenshot({ type: 'png' }); 
        
        await browser.close();
        return imageBuffer;
    } catch (err) {
        console.error(`❌ Puppeteer Error: ${err.message}`);
        if (browser) await browser.close();
        return null;
    }
};

module.exports = { takeScreenshot };