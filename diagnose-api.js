const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env.local manually
let apiKey = '';
try {
    const envPath = path.resolve('.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/(?:GEMINI_API_KEY|GOOGLE_API_KEY)=([^\r\n]+)/);
        if (match) {
            apiKey = match[1].trim();
            // Remove quotes if present
            if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
                apiKey = apiKey.slice(1, -1);
            }
        }
    }
} catch (e) {
    console.error('Error reading env:', e);
}

if (!apiKey) {
    console.error('Could not find API key in .env.local');
    process.exit(1);
}

console.log('Using API Key starts with:', apiKey.substring(0, 4));

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error('API Returned Error:', JSON.stringify(json.error, null, 2));
            } else if (json.models) {
                console.log('Available Models:');
                json.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`));
            } else {
                console.log('Unexpected response:', data.substring(0, 500));
            }
        } catch (e) {
            console.error('Failed to parse response:', data);
        }
    });
}).on('error', (e) => {
    console.error('Request error:', e);
});
