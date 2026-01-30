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

        // Use Google Gemini (Imagen 4 Fast) via REST API
        // Model: imagen-4.0-fast-generate-001 for better speed/quota
        // We rely on the strong "Pixar style" prompt to maintain quality even on the fast model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`;

        // The prompt already contains the style instructions from the story generator
        const stylePrompt = prompt;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instances: [
                    { prompt: stylePrompt }
                ],
                parameters: {
                    sampleCount: 1,
                    // aspect_ratio is often supported in parameters for some versions, 
                    // but for basic predict it might just be sampleCount. 
                    // Keeping it simple as tested.
                    aspectRatio: "1:1"
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini Imagen API error:', response.status, errorText);
            throw new Error(`Gemini Imagen API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        let base64Image = '';
        // Handle standard Gemini API response format
        if (data.images && data.images.length > 0 && data.images[0].image64) {
            base64Image = data.images[0].image64;
        }
        // Fallback for potential variations
        else if (data.predictions && data.predictions.length > 0 && data.predictions[0].bytesBase64Encoded) {
            base64Image = data.predictions[0].bytesBase64Encoded;
        }

        if (!base64Image) {
            console.error('Unexpected Gemini response structure:', JSON.stringify(data).substring(0, 500));
            throw new Error('No image found in usage response');
        }

        const imageUrl = `data:image/png;base64,${base64Image}`;

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
