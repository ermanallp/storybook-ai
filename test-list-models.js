const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : '';

const https = require('https');

async function listModelsRest() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    https.get(url, (res) => {
        let output = '';
        res.on('data', d => output += d);
        res.on('end', () => {
            const data = JSON.parse(output);
            if (data.models) {
                const names = data.models.map(m => m.name);
                console.log('Available models:', names.filter(n => n.includes('flash') || n.includes('image') || n.includes('nano')));
            } else {
                console.log('Error listing models:', data);
            }
        });
    });
}

listModelsRest();
