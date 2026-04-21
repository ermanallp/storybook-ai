const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`;

const data = JSON.stringify({
    instances: [{ prompt: "A 3d render of a cute red car in a sunny field" }],
    parameters: { sampleCount: 1, aspectRatio: "1:1" }
});

const req = https.request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, (res) => {
    let output = '';
    res.on('data', chunk => { output += chunk; });
    res.on('end', () => {
        console.log('Imagen Status:', res.statusCode);
        const json = JSON.parse(output);
        if (json.error) console.error('Imagen Error:', JSON.stringify(json.error, null, 2));
        else console.log('Imagen Success! Image bytes length:', json.predictions?.[0]?.bytesBase64Encoded?.length || json.images?.[0]?.image64?.length);
    });
});
req.write(data);
req.end();
