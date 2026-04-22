const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

const modelsToTest = [
    'gemini-3.1-flash-image-001',
    'gemini-3.1-flash-image',
    'nano-banana-2',
    'gemini-3.1-flash'
];

async function testModel(modelName) {
    return new Promise((resolve) => {
        let url;
        let pData;
        if (modelName === 'gemini-3.1-flash') {
            url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            pData = JSON.stringify({
                contents: [{ parts: [{ text: "Generate an image of a red car" }] }]
            });
        } else {
            url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;
            pData = JSON.stringify({
                instances: [{ prompt: "A 3d render of a cute red car in a sunny field" }],
                parameters: { sampleCount: 1, aspectRatio: "1:1" }
            });
        }

        const req = https.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': pData.length }
        }, (res) => {
            let output = '';
            res.on('data', chunk => { output += chunk; });
            res.on('end', () => {
                let status = 'Failed';
                if (res.statusCode === 200) {
                    status = 'Success';
                }
                console.log(`${modelName}: ${res.statusCode} - ${output.substring(0, 100).replace(/\s+/g, ' ')}`);
                resolve();
            });
        });
        
        req.on('error', (e) => {
            console.error(`${modelName} error: ${e.message}`);
            resolve();
        });

        req.write(pData);
        req.end();
    });
}

async function runTests() {
    for (const model of modelsToTest) {
        await testModel(model);
    }
}

runTests();
