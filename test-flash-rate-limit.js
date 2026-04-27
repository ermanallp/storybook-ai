const fs = require('fs');
const https = require('https');

// Load API Key
const envContent = fs.readFileSync('c:\\Users\\ermma\\.gemini\\antigravity\\scratch\\storybook-ai\\.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

const modelName = 'gemini-3.1-flash-image-preview'; 
const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

const payload = JSON.stringify({
    contents: [
        {
            role: "user",
            parts: [
                { text: "A 3d render of a cute red car in a sunny field, Pixar style" }
            ]
        }
    ]
});

async function testRequest(index) {
    return new Promise((resolve) => {
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let output = '';
            res.on('data', chunk => { output += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`[Req ${index}] HTTP 200 - Success`);
                } else {
                    console.log(`[Req ${index}] HTTP ${res.statusCode} - Error`);
                }
                resolve();
            });
        });
        req.on('error', () => resolve());
        req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log("Testing 3 rapid requests to check rate limits...");
    await Promise.all([testRequest(1), testRequest(2), testRequest(3)]);
    console.log("Done.");
}

runTests();
