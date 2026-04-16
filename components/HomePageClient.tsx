'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addToCart, setCart } from '@/store/cartSlice';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string;
}

export default function HomePageClient({ initialProducts }: { initialProducts: Product[] }) {
    const { role, uid } = useSelector((state: any) => state.auth);
    const cartItems = useSelector((state: any) => state.cart?.items || []);
    const dispatch = useDispatch();
    const router = useRouter();

    const [notification, setNotification] = useState<string | null>(null);

    const cartCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

    useEffect(() => {
        if (uid && role === 'user') {
            const loadCartFromDB = async () => {
                try {
                    const res = await fetch(`/api/cart?userId=${uid}`);
                    if (res.ok) {
                        const dbCart = await res.json();
                        dispatch(setCart(dbCart));
                    }
                } catch (error) {
                    console.error("Failed to load cart", error);
                }
            };
            loadCartFromDB();
        }
    }, [uid, role, dispatch]);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddToCart = async (product: Product) => {
        if (!uid || role !== 'user') {
            router.push('/login');
            return;
        }
        
        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl
        };

        dispatch(addToCart(newItem));

        showNotification(`${product.name} added to cart`);

        const existingItemIndex = cartItems.findIndex((item: any) => item.id === product.id);
        let updatedCart = [...cartItems];
        
        if (existingItemIndex >= 0) {
            updatedCart[existingItemIndex] = {
                ...updatedCart[existingItemIndex],
                quantity: updatedCart[existingItemIndex].quantity + 1
            };
        } else {
            updatedCart.push(newItem);
        }

        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: uid, items: updatedCart })
            });
        } catch (error) {
            console.error("Failed to sync cart to DB", error);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col relative">

            {notification && (
                <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-md shadow-2xl z-50 flex items-center gap-3 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm font-medium">{notification}</span>
                </div>
            )}

            <nav className="border-b border-gray-200 py-4 px-6 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Shopping.
                </Link>
                <div className="flex gap-6 text-sm font-medium">
                    <Link href="/dashboard" className="hover:underline">Account</Link>
                    <Link href="/cart" className="hover:underline font-bold">
                        Cart ({cartCount})
                    </Link>
                </div>
            </nav>

            <header className="py-16 px-6 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Everyday Essentials
                </h1>
                <p className="text-gray-600 mb-8 text-lg">
                    Discover our collection of quality minimalist goods.
                </p>
            </header>

            <main id="products" className="max-w-6xl mx-auto px-6 py-12 w-full flex-grow">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
                    <h2 className="text-2xl font-bold">Latest Arrivals</h2>
                    <span className="text-gray-500 text-sm">{initialProducts.length} Items</span>
                </div>

                {initialProducts.length === 0 ? (
                    <div className="text-center py-20 border rounded-lg bg-gray-50">
                        <p className="text-gray-500 mb-4">No products available.</p>
                        {role === 'admin' && (
                            <Link href="/dashboard" className="text-blue-600 hover:underline">
                                Add items in the Dashboard
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {initialProducts.map((product) => (
                            <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col">

                                <h3 className="font-semibold text-lg truncate" title={product.name}>
                                    {product.name}
                               </h3>
                                <p className="text-gray-700 mt-1">${product.price.toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-1 mb-4">
                                    Stock: {product.stock}
                                </p>

                                <button 
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock === 0}
                                    className="mt-auto w-full py-2 rounded-md font-medium text-sm transition-colors bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}