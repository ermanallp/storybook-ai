const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

const modelName = 'gemini-3.1-flash-image-preview';

async function testGenerateContent() {
    return new Promise((resolve) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;
        const pData = JSON.stringify({
            instances: [{ prompt: "A 3d render of a cute red car in a sunny field" }],
            parameters: { sampleCount: 1, aspectRatio: "1:1" }
        });

        // Let's also check if it uses predict with a different payload format
        const pData2 = JSON.stringify({
            instances: [{ prompt: "A 3d render of a cute red car in a sunny field" }],
            parameters: { }
        });

        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': pData2.length }
        }, (res) => {
            let output = '';
            res.on('data', chunk => { output += chunk; });
            res.on('end', () => {
                console.log(`Predict 2 - ${res.statusCode} - ${output.substring(0, 150).replace(/\s+/g, ' ')}`);
                resolve();
            });
        });
        
        req.write(pData2);
        req.end();
    });
}

testGenerateContent();
