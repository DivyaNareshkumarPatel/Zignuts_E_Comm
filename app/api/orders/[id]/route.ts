import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase_auth';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const { status }: { status: string } = await request.json();

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, { status });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH Order Error:", error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}