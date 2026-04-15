'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string;
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col">
            
            {/* Simple Navigation */}
            <nav className="border-b border-gray-200 py-4 px-6 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Shopping.
                </Link>
                <div className="flex gap-6 text-sm font-medium">
                    <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                    <Link href="/login" className="hover:underline">Account</Link>
                    <button className="hover:underline">Cart (0)</button>
                </div>
            </nav>

            {/* Simple Hero Section */}
            <header className="py-16 px-6 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Everyday Essentials
                </h1>
                <p className="text-gray-600 mb-8 text-lg">
                    Discover our collection of quality minimalist goods.
                </p>
            </header>

            {/* Simple Product Grid */}
            <main id="products" className="max-w-6xl mx-auto px-6 py-12 w-full flex-grow">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
                    <h2 className="text-2xl font-bold">Latest Arrivals</h2>
                    <span className="text-gray-500 text-sm">{products.length} Items</span>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-gray-500">
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 border rounded-lg bg-gray-50">
                        <p className="text-gray-500 mb-4">No products available.</p>
                        <Link href="/dashboard" className="text-blue-600 hover:underline">
                            Add items in the Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex flex-col">
                                
                                {/* Image Placeholder */}
                                <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden flex items-center justify-center">
                                    {product.imageUrl ? (
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-sm">No Image</span>
                                    )}
                                </div>

                                {/* Product Info */}
                                <h3 className="font-semibold text-lg truncate" title={product.name}>
                                    {product.name}
                               </h3>
                                <p className="text-gray-700 mt-1">${product.price.toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-1 mb-4">
                                    Stock: {product.stock}
                                </p>

                                {/* Action Button */}
                                <button 
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

            {/* Simple Footer */}
            <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 mt-12">
                <p>© {new Date().getFullYear()} Shopping. All rights reserved.</p>
            </footer>
            
        </div>
    );
}