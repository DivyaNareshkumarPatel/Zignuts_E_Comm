import { NextResponse } from 'next/server';
import { collection, addDoc, doc, updateDoc, increment, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase_auth';

export async function POST(request: Request) {
    try {
        const { userId, items, total } = await request.json();
        
        if (!userId || !items || items.length === 0) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
        }

        const orderRef = await addDoc(collection(db, 'orders'), {
            userId,
            items,
            total,
            status: 'Processing',
            createdAt: new Date().toISOString()
        });

        for (const item of items) {
            const productRef = doc(db, 'products', item.id);
            await updateDoc(productRef, {
                stock: increment(-item.quantity) 
            });
        }

        await setDoc(doc(db, 'carts', userId), { items: [] });

        return NextResponse.json({ success: true, orderId: orderRef.id }, { status: 201 });
    } catch (error) {
        console.error("Order POST Error:", error);
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(orders);
    } catch (error) {
        console.error("GET Orders Error:", error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}