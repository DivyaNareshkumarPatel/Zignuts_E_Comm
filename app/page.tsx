import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase_auth';
import HomePageClient from '@/components/HomePageClient'

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    let products: any[] = [];
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            price: doc.data().price,
            stock: doc.data().stock,
            imageUrl: doc.data().imageUrl || null,
        }));
    } catch (error) {
        console.error("Server Fetch Error:", error);
    }
    return <HomePageClient initialProducts={products} />;
}