import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        // Simulate AI delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TODO: Implement actual Image Generation call here (e.g. via Gemini Imagen or other provider)
        // For now, we use a consistent placeholder based on the prompt

        // Use Pollinations.ai for free AI image generation based on prompt
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

        return NextResponse.json({ imageUrl });
    } catch (error) {
        console.error('Image generation error:', error);
        return NextResponse.json(
            { error: 'Görsel oluşturulurken bir hata oluştu.' },
            { status: 500 }
        );
    }
}
