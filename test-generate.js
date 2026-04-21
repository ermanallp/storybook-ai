const fs = require('fs');
const https = require('https');

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

console.log('Testing with API Key ending in:', apiKey.substring(apiKey.length - 4));

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

const data = JSON.stringify({
    contents: [{ parts: [{ text: "Write a 10 word story about a cat." }] }]
});

const req = https.request(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let output = '';
    res.on('data', chunk => { output += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        const json = JSON.parse(output);
        if (json.error) {
            console.error('Error Details:', JSON.stringify(json.error, null, 2));
        } else {
            console.log('Success - Story Generated!');
        }
    });
});

req.write(data);
req.end();
