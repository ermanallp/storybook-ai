const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

const modelName = 'gemini-3.1-flash-image-preview';

async function testPredict() {
    return new Promise((resolve) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;
        const pData = JSON.stringify({
            instances: [{ prompt: "A 3d render of a cute red car in a sunny field" }],
            parameters: { sampleCount: 1, aspectRatio: "1:1" }
        });

        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': pData.length }
        }, (res) => {
            let output = '';
            res.on('data', chunk => { output += chunk; });
            res.on('end', () => {
                console.log(`Predict 1 - ${res.statusCode} - ${output.substring(0, 100).replace(/\s+/g, ' ')}`);
                resolve();
            });
        });
        
        req.write(pData);
        req.end();
    });
}

async function testGenerateContent() {
    return new Promise((resolve) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const pData = JSON.stringify({
            contents: [{ parts: [{ text: "Generate an image of a red car" }] }]
        });

        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': pData.length }
        }, (res) => {
            let output = '';
            res.on('data', chunk => { output += chunk; });
            res.on('end', () => {
                console.log(`generateContent 1 - ${res.statusCode} - ${output.substring(0, 100).replace(/\s+/g, ' ')}`);
                resolve();
            });
        });
        
        req.write(pData);
        req.end();
    });
}

async function runTest() {
    await testPredict();
    await testGenerateContent();
}

runTest();
