import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        // Simulate AI delay - removed as real API call will take time
        // await new Promise(resolve => setTimeout(resolve, 1000));

        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('API Key is missing (checked GOOGLE_API_KEY and GEMINI_API_KEY)');
            throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is missing');
        }

        // Use Nano Banana 2 (Gemini 3.1 Flash Image) via REST API
        // Model: gemini-3.1-flash-image-preview
        // We rely on the strong "Pixar style" prompt to maintain quality
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`;

        // The prompt already contains the style instructions from the story generator
        const stylePrompt = prompt;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: stylePrompt }
                        ]
                    }
                ]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini Flash Image API error:', response.status, errorText);
            throw new Error(`Gemini Flash Image API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        let base64Image = '';
        let mimeType = 'image/jpeg'; // default for flash image

        // Handle standard Gemini API response format for image models
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                const part = candidate.content.parts[0];
                
                if (part.inlineData && part.inlineData.data) {
                    base64Image = part.inlineData.data;
                    if (part.inlineData.mimeType) {
                        mimeType = part.inlineData.mimeType;
                    }
                } else if (part.text) {
                    // This is the safety/error case: The model returned text instead of an image
                    console.error('Model returned text instead of an image. Text:', part.text);
                    throw new Error(`Yapay zeka bu hikaye için görsel oluşturmayı reddetti: "${part.text.substring(0, 100)}"`);
                }
            }
        }

        if (!base64Image) {
            console.error('Unexpected Gemini response structure:', JSON.stringify(data).substring(0, 500));
            throw new Error('No image found in usage response');
        }

        const imageUrl = `data:${mimeType};base64,${base64Image}`;

        return NextResponse.json({ imageUrl });
    } catch (error: any) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            {
                error: 'Görsel oluşturulurken bir hata oluştu.',
                details: error.message || String(error)
            },
            { status: 500 }
        );
    }
}
