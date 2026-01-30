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
        ROLE: You are a professional lead CGI artist and storyteller for a high-end animation studio (like Pixar or Dreamworks).
        
        CRITICAL GOAL: You must maintain PERFECT CHARACTER CONSISTENCY while generating unique scenes.
        
        1. **Define the Character**: Create a HIGHLY DETAILED, distinctive description of the main character. 
           - MUST INCLUDE: Hair style/color, specific clothing items (color/texture), distinctive features (freckles, glasses, hat).
           - Example: "A cute 5-year-old boy, round face, messy brown curly hair, wearing a red hoodie with a dinosaur logo, denim shorts, and white sneakers."
        
        2. **Generate Image Prompts**: For EACH scene, you must combine the *fixed character description* with the *current scene action*.
        
        STRICT PROMPT TEMPLATE:
        "3D render, Pixar style animation, 8k resolution, charming character design, [Fixed Character Description] [Specific Scene Action] in [Setting/Lighting]. Soft cinematic lighting, high fidelity."

        RULES:
        - NEVER change the character's core features. COPY-PASTE the character description exactly for every page.
        - ALWAYS describe the specific action/object happening in the current page.
        - NO 2D styles. NO "illustration" or "drawing" keywords. ONLY "3D render", "CGI", "Pixar style".
        - WRITE THE STORY TEXT IN: ${targetLanguage}.
        - KEEP IMAGE PROMPTS IN ENGLISH (for better generation results).
        
        STORY PARAMETERS:
        Child's Name: ${name}
        Age: ${age}
        Theme: ${theme}
        Interests: ${interests}
        Language: ${targetLanguage}
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "title": "Story Title (in ${targetLanguage})",
            "pages": [
                {
                    "text": "Page text here (in ${targetLanguage})...",
                    "imagePrompt": "3D render, Pixar style animation, 8k resolution, charming character design, A cute 5-year-old boy with messy brown curly hair wearing a red hoodie... [doing action] in [setting]."
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
