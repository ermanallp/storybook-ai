import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StoryRequest, Story } from '@/types';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function logToFile(message: string, data?: any) {
    try {
        const logPath = path.join(process.cwd(), 'server-debug.log');
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
        fs.appendFileSync(logPath, logEntry);
    } catch (e) {
        // ignore logging errors
    }
}

export async function POST(request: Request) {
    logToFile('Story generation API called');
    try {
        const body = await request.json(); // Don't type assert yet to be safe
        logToFile('Request body received', body);

        const { name, age, interests, theme } = body;

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        logToFile('API Key check', { exists: !!apiKey });

        if (!apiKey) {
            logToFile('Error: API Key missing');
            return new Response(JSON.stringify({ error: 'API Key is missing or invalid' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Trying a specific known model, or stick to pro
        // Actually, let's try gemini-1.5-flash which SHOULD work, or fallback to pro.
        // User feedback suggested 404 on flash-001.
        // Let's try 'gemini-1.5-flash' again but maybe the issue was transient or key-related?
        // Let's go with 'gemini-pro' as it was the last "safe" attempt, but user said it failed?
        // Wait, user said "Errors dropped to 2" then "Up to 3".
        // Let's log 'gemini-1.5-flash' to see the REAL error in the log file.
        // Switching to 'gemini-flash-latest' as it was explicitly in the available list
        const modelToUse = 'gemini-flash-latest';
        logToFile(`Initializing model: ${modelToUse}`);

        const model = genAI.getGenerativeModel({ model: modelToUse });

        const prompt = `
        Visual Art Director System Instructions
        ROLE: You are both a creative children's story writer and a professional visual art director. While creating a story based on user input, you must generate specific "Image Prompts" for each scene, optimized for the Google Imagen model to achieve the highest quality results.

        VISUAL GUIDELINES:
        Language: Always write image prompts in English, as Imagen performs best with English descriptions.
        Consistency: At the beginning of the story, define the main character's physical traits (hair color, clothing, age, etc.) and strictly repeat these details in every single scene's prompt to ensure character continuity.
        Art Style: Unless otherwise specified, use the following style: "Digital art, 3D render, Pixar-style animation, vibrant colors, soft cinematic lighting, high detail, friendly and whimsical atmosphere."
        Prompt Structure: Formulate prompts using this template: [Art Style] + [Specific Character Details] + [Setting/Action] + [Lighting/Atmosphere]
        Negative Constraints: Implicitly ensure clean visuals by avoiding text, distorted limbs, or scary elements through precise positive descriptions.

        STORY PARAMETERS:
        Child's Name: ${name}
        Age: ${age}
        Theme: ${theme}
        Interests: ${interests}
        
        OUTPUT FORMAT:
        The story should be engaging, age-appropriate, and educational.
        It must be exactly 5 pages long.
        Language: Turkish (for the story text only)

        Return the response ONLY as a valid JSON object with the following structure:
        {
            "title": "Story Title",
            "pages": [
                {
                    "text": "Page text here (Turkish)...",
                    "imagePrompt": "IMAGE_PROMPT: Digital art, 3D render, Pixar-style animation... (English)"
                }
            ]
        }
        
        Do not include any markdown formatting or code blocks. Just the raw JSON string.
        `;

        logToFile('Sending prompt to Gemini...');
        const result = await model.generateContent(prompt);
        logToFile('Gemini response received');

        const response = await result.response;
        let text = response.text();
        logToFile('Raw text length', text.length);

        // Clean up markdown formatting if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const story: Story = JSON.parse(text);
            return NextResponse.json(story);
        } catch (parseError) {
            logToFile('JSON Parse Error', { text, error: String(parseError) });
            return new Response(JSON.stringify({ error: 'Failed to parse story JSON', raw: text }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error: any) {
        logToFile('CRITICAL ERROR', {
            message: error.message,
            stack: error.stack,
            details: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });

        // Ensure we handle objects that don't stringify well
        const errorMessage = error?.message || String(error);

        return new Response(JSON.stringify({
            error: 'Hikaye oluşturulurken bir hata oluştu.',
            details: errorMessage
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
