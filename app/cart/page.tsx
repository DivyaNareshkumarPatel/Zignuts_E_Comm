'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { removeFromCart, clearCart, setCart } from '@/store/cartSlice';

export default function CartPage() {
    const { items } = useSelector((state: any) => state.cart);
    const { uid, role, loading } = useSelector((state: any) => state.auth); 
    const dispatch = useDispatch();
    const router = useRouter();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        if (!loading && (!uid || role !== 'user')) {
            router.push('/login');
        }
    }, [uid, role, loading, router]);

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans text-gray-500">
                <svg className="animate-spin h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Loading your cart...
            </div>
        );
    }

    if (!uid || role !== 'user') return null;

    const calculateTotal = () => {
        return items.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
    };

    const handleRemoveItem = async (id: string) => {
        dispatch(removeFromCart(id));
        const updatedItems = items.filter((item: any) => item.id !== id);
        try {
            await fetch('/api/cart', {
                method: 'POST',
                body: JSON.stringify({ userId: uid, items: updatedItems })
            });
        } catch (error) {
            console.error("Failed to update cart in DB", error);
        }
    };

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;
        setIsProcessing(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: uid,
                    items: items,
                    total: calculateTotal()
                })
            });

            if (!res.ok) throw new Error('Checkout failed');

            dispatch(clearCart());
            setOrderSuccess(true);
            
        } catch (error) {
            console.error(error);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center justify-center p-6">
                <div className="border-2 border-black p-12 text-center max-w-lg w-full">
                    <h1 className="text-3xl font-bold mb-4">Order Confirmed</h1>
                    <p className="text-gray-600 mb-8">Thank you for your purchase. Your order is being processed.</p>
                    <Link href="/" className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors">
                        Return to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col">
            <nav className="border-b border-gray-200 py-4 px-6 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold tracking-tight">Shopping.</Link>
                <Link href="/dashboard" className="text-sm font-medium hover:underline">Account</Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-grow">
                <h1 className="text-3xl font-bold mb-8 border-b border-gray-200 pb-4">Your Cart</h1>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-500 mb-4">Your cart is currently empty.</p>
                        <Link href="/" className="text-black font-medium underline underline-offset-4 hover:text-gray-600">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        
                        <div className="md:col-span-2 space-y-6">
                            {items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 border border-gray-200 p-4 rounded-lg">
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            <button 
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-sm text-red-600 hover:underline font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="md:col-span-1 h-fit bg-gray-50 border border-gray-200 p-6 rounded-lg">
                            <h2 className="text-xl font-bold mb-6">Summary</h2>
                            <div className="flex justify-between mb-4 text-gray-600">
                                <span>Subtotal</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-6 text-gray-600 border-b border-gray-200 pb-6">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between mb-8 text-xl font-bold">
                                <span>Total</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                className="w-full bg-black text-white py-4 font-bold tracking-wide uppercase hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                            >
                                {isProcessing ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}