import { NextResponse } from 'next/server';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase_auth';

export async function POST(request: Request) {
    try {
        const { userId, items } = await request.json();
        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        await setDoc(doc(db, 'carts', userId), { 
            items, 
            updatedAt: new Date().toISOString() 
        });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cart POST Error:", error);
        return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    try {
        const docSnap = await getDoc(doc(db, 'carts', userId));
        if (docSnap.exists()) {
            return NextResponse.json(docSnap.data().items || []);
        }
        return NextResponse.json([]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }
}