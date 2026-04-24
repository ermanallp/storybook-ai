import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        // Simulate AI delay - removed as real API call will take time
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // Use a separate API key for images if provided, to avoid quota clashes with text generation
        const apiKey = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error('API Key is missing (checked GEMINI_IMAGE_API_KEY, GEMINI_API_KEY and GOOGLE_API_KEY)');
            throw new Error('API Key is missing');
        }

        // Use Gemini 2.5 Flash Image via REST API
        // Model: gemini-2.5-flash-image
        // We rely on the strong "Pixar style" prompt to maintain quality
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

        // The prompt already contains the style instructions from the story generator
        // We append a strong negative prompt to prevent Gemini Flash Image from adding text/letters
        const stylePrompt = prompt + " IMPORTANT: DO NOT include any text, letters, numbers, words, watermarks, or signatures in the image. The image must be completely free of any typography or writing.";

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
        let returnedText = '';
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                // The image might not be in the very first part (e.g. Gemini 2.5 Flash Image returns text then image)
                for (const part of candidate.content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        base64Image = part.inlineData.data;
                        if (part.inlineData.mimeType) {
                            mimeType = part.inlineData.mimeType;
                        }
                        break; // Stop looking once we find the image
                    } else if (part.text) {
                        returnedText += part.text + ' ';
                    }
                }
                
                // If we went through all parts and found no image but did find text
                if (!base64Image && returnedText.trim()) {
                    console.error('Model returned text but no image. Text:', returnedText);
                    throw new Error(`Yapay zeka görsel oluşturmak yerine yanıt verdi: "${returnedText.substring(0, 100).trim()}"`);
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
