const https = require('https');
const fs = require('fs');
const path = require('path');

// Robust env loading
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const lines = envConfig.split(/\r?\n/);
    lines.forEach(line => {
        const match = line.match(/^\s*([^=]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.length > 0 && value[0] === '"' && value[value.length - 1] === '"') {
                value = value.substring(1, value.length - 1);
            }
            process.env[key] = value;
        }
    });
}

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('No API Key found!');
    process.exit(1);
}

async function listModels() {
    console.log(`\n--- Listing Available Models ---`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        if (json.models) {
                            console.log(`Found ${json.models.length} models.`);
                            console.log('--- Models supporting image generation (guessing) ---');
                            json.models.forEach(m => {
                                // console.log(m.name);
                                if (m.name.includes('imagen') || m.supportedGenerationMethods.includes('predict') || m.supportedGenerationMethods.includes('image')) {
                                    console.log(`Name: ${m.name}`);
                                    console.log(`Methods: ${m.supportedGenerationMethods.join(', ')}`);
                                    console.log('---');
                                }
                            });
                        } else {
                            console.log('No models list found in response.');
                        }
                    } catch (e) {
                        console.log('Response not JSON:', data.substring(0, 100));
                    }
                    resolve(true);
                } else {
                    console.error(`FAILED: returned status ${res.statusCode}`);
                    console.error('Error body:', data);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`ERROR: Request failed`, e);
            resolve(false);
        });
    });
}

listModels();
