import { NextResponse } from 'next/server';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase_auth';

export async function DELETE(
    request: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const productId = resolvedParams.id;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is missing' }, { status: 400 });
        }
        await deleteDoc(doc(db, "products", productId));

        return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("DELETE Product Error:", error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}