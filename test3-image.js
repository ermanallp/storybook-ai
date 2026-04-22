const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

const modelName = 'gemini-3.1-flash-image-preview';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

const pData = JSON.stringify({
    contents: [
        {
            role: "user",
            parts: [
                { text: "Generate an image of a red car in a sunny field" }
            ]
        }
    ]
});

const req = https.request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(pData) }
}, (res) => {
    let output = '';
    res.on('data', chunk => { output += chunk; });
    res.on('end', () => {
        console.log(`generateContent - HTTP ${res.statusCode}`);
        if(res.statusCode === 200) {
            const json = JSON.parse(output);
            console.log('Success! Output snippet:', JSON.stringify(json).substring(0, 300));
        } else {
            console.log('Output error:', output);
        }
    });
});

req.write(pData);
req.end();
