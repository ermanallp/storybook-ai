import { NextResponse } from 'next/server';
import { app } from '@/app/lib/firebase';
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { locale = 'en', eventType = 'generate_click' } = body;

        // Extract Vercel headers for location
        const country = request.headers.get('x-vercel-ip-country') || 'Unknown Country';
        const city = request.headers.get('x-vercel-ip-city') || 'Unknown City';
        const ip = request.headers.get('x-forwarded-for') || 'Unknown IP';

        if (!app) {
            console.error("Firebase app is not initialized in API route.");
            return NextResponse.json({ error: 'Firebase not initialized' }, { status: 500 });
        }

        const db = getFirestore(app);

        // 1. Store a granular record
        const trackingCol = collection(db, 'tracking_events');
        await addDoc(trackingCol, {
            eventType,
            locale,
            country,
            city,
            ip,
            timestamp: serverTimestamp(),
            userAgent: request.headers.get('user-agent') || 'Unknown'
        });

        // 2. Update aggregate stats safely
        const statsDocName = eventType === 'story_completed' ? 'completions' : 'clicks';
        const statsDocRef = doc(db, 'stats', statsDocName);
        
        try {
            const safeCountry = country.replace(/\./g, '_');
            const safeCity = city.replace(/\./g, '_');
            
            await setDoc(statsDocRef, {
                totalCount: increment(1),
                byCountry: { [safeCountry]: increment(1) },
                byCity: { [safeCity]: increment(1) },
                byLocale: { [locale]: increment(1) }
            }, { merge: true });
            
        } catch (aggError) {
            console.error("Failed to update aggregate stats. Saving granular was successful.", aggError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Tracking error:', error);
        return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
}
