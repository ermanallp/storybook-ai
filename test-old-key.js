const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testOldKey() {
    const apiKey = 'AIzaSyCgMtkUaTu-vKilijGASmgLJbNraA1g3lU';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    try {
        console.log("Testing gemini-2.0-flash with old key...");
        const result = await model.generateContent("Merhaba, nasılsın? Sadece 'İyiyim' diye cevap ver.");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testOldKey();
