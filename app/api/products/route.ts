// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase_auth';
import { writeFile, mkdir } from 'fs/promises'; // ADDED mkdir
import path from 'path';

export async function GET() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return NextResponse.json(products);
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const stock = formData.get('stock') as string;
        const image = formData.get('image') as File | null;

        let imageUrl = '';

        if (image && image.name) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const cleanFileName = image.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
            const uniqueFilename = `${Date.now()}-${cleanFileName}`;
            
            const uploadDir = path.join(process.cwd(), 'public/uploads');
            
            // FIX: Automatically create the public/uploads directory if it doesn't exist
            await mkdir(uploadDir, { recursive: true });
            
            const filepath = path.join(uploadDir, uniqueFilename);
            await writeFile(filepath, buffer);
            
            imageUrl = `/uploads/${uniqueFilename}`;
        }

        const docRef = await addDoc(collection(db, "products"), {
            name,
            price: Number(price),
            stock: Number(stock),
            imageUrl: imageUrl || null,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, name, price, stock, imageUrl }, { status: 201 });
    } catch (error) {
        // IMPORTANT: If it fails again, look in your VS Code terminal for this exact log
        console.error("--- BACKEND POST ERROR ---");
        console.error(error);
        return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
    }
}