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

const LANGUAGE_MAP: Record<string, string> = {
    'en': 'English',
    'tr': 'Turkish',
    'fr': 'French',
    'de': 'German',
    'es': 'Spanish',
    'it': 'Italian',
    'zh': 'Chinese (Simplified)',
    'ja': 'Japanese',
    'ko': 'Korean'
};

export async function POST(request: Request) {
    logToFile('Story generation API called');
    try {
        const body = await request.json(); // Don't type assert yet to be safe
        logToFile('Request body received', body);

        const { name, age, interests, theme, locale = 'en' } = body;
        const targetLanguage = LANGUAGE_MAP[locale] || 'English';

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
        const modelToUse = 'gemini-2.0-flash';
        logToFile(`Initializing model: ${modelToUse}`);

        const model = genAI.getGenerativeModel({ model: modelToUse });

        const prompt = `
        Visual Art Director System Instructions
        ROLE: You are a professional children's book illustrator and writer. 
        
        CRITICAL GOAL: You must maintain PERFECT CHARACTER CONSISTENCY while generating unique scenes.

        1. **Define the Character**: First, create a short, distinctive description of the main character (e.g., "A 5-year-old girl with curly red hair, blue overalls, and a star patch").
        2. **Generate Image Prompts**: For EACH scene, you must combine the *fixed character description* with the *current scene action*.
        
        STRICT PROMPT TEMPLATE:
        "[Pixar-style 3D animation] + [Fixed Character Description] doing [Specific Scene Action] in [Setting/Lighting]."

        RULES:
        - NEVER change the character's core features (hair, clothes, age).
        - ALWAYS describe the specific action/object happening in the current page (e.g., if page says "she found a key", prompt must say "holding a golden key").
        - If the character is NOT in the scene (rare), strictly describe the scene objects.

        STORY PARAMETERS:
        Child's Name: ${name}
        Age: ${age}
        Theme: ${theme}
        Interests: ${interests}
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "title": "Story Title",
            "pages": [
                {
                    "text": "Page text here...",
                    "imagePrompt": "IMAGE_PROMPT: Pixar-style 3D animation. A 5-year-old girl with curly red hair and blue overalls holding a glowing golden key in a dark mysterious cave. Soft blue lighting."
                }
            ]
        }
        
        Return ONLY valid JSON. No markdown.
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
