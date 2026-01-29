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

        Visual Art Director System Instructions
        ROLE: You are both a creative children's story writer and a professional visual art director. While creating a story based on user input, you must generate specific "Image Prompts" for each scene.

        VISUAL GUIDELINES:
        1. ** Content Priority **: The image prompt MUST describe the specific action, objects, and setting occurring in the * current page's text*. If the text mentions a lamb, the image prompt MUST describe a lamb. Do not just describe the main character if they are not the sole focus.
        2. ** Character Consistency **: Define the main character's appearance (age, hair, clothes) once and naturally incorporate these details into the scene description *only when the character is present*.
        3. ** Style **: Use "Pixar-style 3D animation, vibrant colors, soft lighting, cute and friendly".
        4. ** Structure **: [Scene Description & Action] + [Character Appearance(if present)]+[Environment / Lighting].
        5. ** Negative Constraints **: No text, no scary elements, no distorted figures.

        STORY PARAMETERS:
        Child's Name: ${name}
        Age: ${ age }
        Theme: ${ theme }
        Interests: ${ interests }
        
        OUTPUT FORMAT:
        The story should be engaging, age - appropriate, and educational.
        It must be exactly 5 pages long.
            Language: ${ targetLanguage } (for the story text only)

        Return the response ONLY as a valid JSON object with the following structure:
        {
            "title": "Story Title",
                "pages": [
                    {
                        "text": "Page text here (${targetLanguage})...",
                        "imagePrompt": "IMAGE_PROMPT: A cute lamb standing in a green meadow, looking at the camera, sunlight streaming down. Pixar-style 3D animation..."
                    }
                ]
        }
        
        Do not include any markdown formatting or code blocks.Just the raw JSON string.
        `;

        logToFile('Sending prompt to Gemini...');
        const result = await model.generateContent(prompt);
        logToFile('Gemini response received');

        const response = await result.response;
        let text = response.text();
        logToFile('Raw text length', text.length);

        // Clean up markdown formatting if present
        text = text.replace(/```json / g, '').replace(/```/g, '').trim();

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
