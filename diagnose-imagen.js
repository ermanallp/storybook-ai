const fs = require('fs');
const path = require('path');
const https = require('https');

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

// const modelName = 'imagen-4.0-fast-generate-001';
const modelName = 'imagen-3.0-generate-001'; // Retrying just in case, nah let's go for 4.0
const modelsToTest = [
    'imagen-4.0-fast-generate-001',
    'imagen-4.0-generate-001'
];

async function testModel(modelName) {
    console.log(`\n--- Testing ${modelName} ---`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;

    // Format for 'predict' usually requires instances
    // https://cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-api#generate-image-rest
    const payload = JSON.stringify({
        instances: [
            { prompt: "A cute cartoon cat" }
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1"
        }
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`SUCCESS: ${modelName} is working!`);
                    try {
                        const json = JSON.parse(data);
                        console.log('Response keys:', Object.keys(json));
                        if (json.predictions) {
                            console.log('Predictions count:', json.predictions.length);
                            if (json.predictions[0].bytesBase64Encoded) {
                                console.log('Has bytesBase64Encoded');
                            }
                        }
                    } catch (e) {
                        console.log('Response not JSON:', data.substring(0, 100));
                    }
                    resolve(true);
                } else {
                    console.error(`FAILED: ${modelName} returned status ${res.statusCode}`);
                    console.error('Error body:', data);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`ERROR: Request failed for ${modelName}`, e);
            resolve(false);
        });

        req.write(payload);
        req.end();
    });
}

async function run() {
    for (const model of modelsToTest) {
        await testModel(model);
    }
}

run();
