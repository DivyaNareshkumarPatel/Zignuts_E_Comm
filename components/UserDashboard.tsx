'use client'

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: string;
    createdAt: string;
}

export default function UserDashboard() {
    const { uid } = useSelector((state: any) => state.auth);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;

        const fetchUserOrders = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/orders?userId=${uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to fetch order history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserOrders();
    }, [uid]);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-black">Order History</h2>
                        <p className="text-sm text-gray-500 mt-1">Review your past purchases and track deliveries.</p>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                            <svg className="animate-spin h-8 w-8 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Loading your orders...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <h3 className="text-lg font-bold text-black mb-2">No orders yet</h3>
                            <p className="text-gray-500 mb-6">When you purchase items, they will appear here.</p>
                            <Link href="/" className="bg-black text-white px-6 py-2.5 font-medium rounded-md hover:bg-gray-800 transition-colors">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200">
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                                                <p className="text-sm font-medium text-black">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total</p>
                                                <p className="text-sm font-medium text-black">${order.total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                                            <p className="text-xs font-mono text-gray-600">{order.id}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                                        
                                        <div className="flex-grow space-y-3 w-full">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 font-bold rounded text-xs border border-gray-200">
                                                            {item.quantity}
                                                        </span>
                                                        <span className="font-medium text-gray-900">{item.name}</span>
                                                    </div>
                                                    <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="w-full md:w-auto md:border-l border-gray-200 md:pl-8 flex flex-col items-start md:items-end gap-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</p>
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                                                order.status === 'Delivered' 
                                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                                : 'bg-black text-white'
                                            }`}>
                                                {order.status === 'Processing' ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                                        Processing
                                                    </span>
                                                ) : (
                                                    order.status
                                                )}
                                            </span>
                                        </div>
                                        
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}