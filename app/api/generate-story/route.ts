import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StoryRequest, Story } from '@/types';

export async function POST(request: Request) {
    try {
        const body: StoryRequest = await request.json();
        const { name, age, interests, theme } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        console.log('API Key present:', !!apiKey);
        if (apiKey) console.log('API Key starts with:', apiKey.substring(0, 4));

        if (!apiKey) {
            console.error('API Key is missing in process.env');
            return NextResponse.json(
                { error: 'API key is missing.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
        Create a children's story for a ${age} year old child named ${name}.
        Theme: ${theme}
        Interests: ${interests}
        
        The story should be engaging, age-appropriate, and educational.
        It must be exactly 5 pages long.
        
        Return the response ONLY as a valid JSON object with the following structure:
        {
            "title": "Story Title",
            "pages": [
                {
                    "text": "Page text here...",
                    "imagePrompt": "A detailed image generation prompt for this page, describing the scene, characters, and style (cartoon, vibrant colors)."
                }
            ]
        }
        
        Do not include any markdown formatting or code blocks. Just the raw JSON string.
        Language: Turkish
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown formatting if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const story: Story = JSON.parse(text);

        return NextResponse.json(story);
    } catch (error) {
        console.error('Story generation error:', error);
        return NextResponse.json(
            { error: 'Hikaye oluşturulurken bir hata oluştu.' },
            { status: 500 }
        );
    }
}
