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
        const modelToUse = 'gemini-2.5-flash';
        logToFile(`Initializing model: ${modelToUse}`);

        const model = genAI.getGenerativeModel({
            model: modelToUse,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
        Visual Art Director & Expert Children's Book Author System Instructions
        ROLE: You are an acclaimed, highly-experienced children's book author whose stories are loved worldwide, and a professional lead CGI artist for a high-end animation studio. 
        INSPIRATION: Draw inspiration from the greatest children's literature classics (e.g. Roald Dahl, Maurice Sendak, Julia Donaldson).

        CRITICAL STORYTELLING GOALS:
        - Craft an organic, rich, and emotionally resonant narrative. Do not use repetitive gimmicks (like ending every page with a question).
        - Use sensory language (sights, sounds, smells, textures) to immerse the child in the world. 
        - Build genuine anticipation and curiosity through the natural unfolding of the mystery, adventure, or emotional journey.
        - The story must feel authentic, heartwarming, and structurally sound, with a clear beginning, middle, and satisfying resolution across the 7 pages.
        - Write noticeably longer, richer paragraphs. EXACTLY 7-9 RICH, DESCRIPTIVE SENTENCES PER PAGE (about 100-140 words per page to make it a fulfilling read).
        - Make the story educational/informative where natural, subtly teaching the child about the world, nature, friendship, or science without sounding like a textbook.
        
        CRITICAL ART GOAL: You must maintain PERFECT CHARACTER CONSISTENCY.

        SAFETY & ETHICAL GUIDELINES (NON-NEGOTIABLE):
        - **AUDIENCE**: Content MUST be suitable for children under 8 years old (G-rated).
        - **ZERO TOLERANCE**: NO sexual content, nudity, violence, blood, weapons, fighting, scares, mild or strong language, drugs, alcohol, or smoking.
        - **INCLUSIVITY**: Promote kindness, empathy, and diversity.
        - **TONE**: Enthusiastic, positive, safe, educational, and heartwarming. Avoid scary or distressing situations.
        - If the requested theme/interest implies violence (e.g. "war"), reframe it to be playful and safe (e.g. "water balloon fun").
        
        1. **Define the Character**: Create a HIGHLY DETAILED, distinctive description of the main character. 
           - MUST INCLUDE: Hair style/color, specific clothing items (color/texture), distinctive features (freckles, glasses, hat).
           - This description will be used programmatically for every image.
           - Example: "A cute 5-year-old boy, round face, messy brown curly hair, wearing a red hoodie with a dinosaur logo."
        
        2. **Storytelling**: Write an exciting, educational, and heartwarming story based on the inputs.
           - WRITE THE STORY TEXT IN: ${targetLanguage}.
           - WRITE 7-9 RICH, ENGAGING SENTENCES PER PAGE (approx. 100-140 words per page).
           - Let the story flow beautifully and organically from one page to the next.
           - **CRITICAL: The story MUST have exactly 7 distinct pages/segments.**
        
        STORY PARAMETERS:
        Child's Name: ${name}
        Age: ${age}
        Theme: ${theme}
        Interests: ${interests}
        Language: ${targetLanguage}
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "title": "Story Title (in ${targetLanguage})",
            "characterDescription": "The full detailed character description in English",
            "pages": [
                {
                    "text": "Long, immersive paragraph with 7-9 beautifully woven sentences here (in ${targetLanguage})...",
                    "sceneAction": "Specific action and setting description for this page in English (e.g. 'laughing while swinging on a swing set in a sunny park looking at a bright blue butterfly')."
                },
                // ... exactly 7 page objects ...
            ]
        }
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
            const storyData = JSON.parse(text);

            // Enforce Style and Consistency Programmatically
            const STYLE_PREFIX = "3D render, Pixar style animation, 8k resolution, charming character design, ";
            const STYLE_SUFFIX = ", soft cinematic lighting, high fidelity, 3d render, cgi, cartoon style";

            const characterDesc = storyData.characterDescription || `A cute ${age} year old child`;

            const processedPages = storyData.pages.map((page: any) => {
                // Construct the full prompt: Style + Character + Action + Suffix
                // We ensure the character description is always included exactly the same way.
                const fullImagePrompt = `${STYLE_PREFIX}${characterDesc}, ${page.sceneAction} in the scene${STYLE_SUFFIX}`;

                return {
                    text: page.text,
                    imagePrompt: fullImagePrompt,
                    // We can keep sceneAction for potential debugging or display if needed, 
                    // but the types interface expects imagePrompt to be present.
                };
            });

            const finalStory: Story = {
                title: storyData.title,
                characterDescription: characterDesc,
                pages: processedPages
            };

            return NextResponse.json(finalStory);
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
