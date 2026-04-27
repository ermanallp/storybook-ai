const fs = require('fs');
const https = require('https');

// Load API Key
const envContent = fs.readFileSync('c:\\Users\\ermma\\.gemini\\antigravity\\scratch\\storybook-ai\\.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

const modelName = 'gemini-2.5-flash-image'; 
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

console.log(`Testing model: ${modelName} via generateContent...`);

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
        console.log(`HTTP Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(output);
                console.log("\nSuccess! Response structure:");
                if (json.candidates && json.candidates[0].content.parts) {
                    const parts = json.candidates[0].content.parts;
                    console.log("Parts array length:", parts.length);
                    for (let i = 0; i < parts.length; i++) {
                        if (parts[i].inlineData) {
                            console.log(`- Part ${i}: Image found! Mime type:`, parts[i].inlineData.mimeType);
                        } else if (parts[i].text) {
                            console.log(`- Part ${i}: Text found:`, parts[i].text);
                        } else {
                            console.log(`- Part ${i}: Other format:`, Object.keys(parts[i]));
                        }
                    }
                } else {
                    console.log("Unexpected successful JSON format:", JSON.stringify(json, null, 2).substring(0, 1000));
                }
            } catch (e) {
                console.log("Error parsing JSON:", e.message);
                console.log("Raw output snippet:", output.substring(0, 500));
            }
        } else {
            console.log("\nError Response:");
            console.log(output);
        }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e.message);
});

req.write(payload);
req.end();
