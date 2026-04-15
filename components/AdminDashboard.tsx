'use client'

import { useState, useEffect } from 'react';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string;
}

export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    
    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error(error);
            showNotification('Failed to load products', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !stock) return;
        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', price);
            formData.append('stock', stock);
            if (image) formData.append('image', image);

            const res = await fetch('/api/products', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Failed to save product');

            setName('');
            setPrice('');
            setStock('');
            setImage(null);
            setPreviewUrl(null);
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
            showNotification('Product published successfully', 'success');
            fetchProducts(); 
        } catch (error) {
            console.error(error);
            showNotification('Error saving product', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete');
                showNotification('Product deleted', 'success');
                fetchProducts();
            } catch (error) {
                console.error(error);
                showNotification('Error deleting product', 'error');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header & Notifications */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-black">Inventory</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your store products and stock levels.</p>
                </div>
                {notification && (
                    <div className={`px-4 py-2 rounded shadow-sm text-sm font-medium ${notification.type === 'success' ? 'bg-black text-white' : 'bg-gray-100 text-black border border-gray-300'}`}>
                        {notification.message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Form Panel */}
                <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-medium text-black">Add New Product</h2>
                    </div>
                    <form onSubmit={handleAddProduct} className="p-5 space-y-5">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                placeholder="e.g. Minimalist Watch"
                            />
                        </div>
                        
                        {/* Price & Stock Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <input 
                                        type="number" 
                                        required min="0" step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input 
                                    type="number" 
                                    required min="0"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Image Upload Area */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors relative">
                                <div className="space-y-1 text-center">
                                    {previewUrl ? (
                                        <div className="relative w-32 h-32 mx-auto mb-4">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md grayscale" />
                                        </div>
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none underline">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Publishing...
                                </span>
                            ) : 'Publish Product'}
                        </button>
                    </form>
                </div>

                {/* Right Column: Products Table */}
                <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-medium text-black">All Products</h2>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                            {products.length} items
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Product</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Price</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            <svg className="animate-spin h-6 w-6 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Loading inventory...
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No products found. Add your first product to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md border border-gray-200 overflow-hidden">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt="" className="h-full w-full object-cover grayscale" />
                                                        ) : (
                                                            <svg className="h-full w-full text-gray-300 p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-black">{product.name}</div>
                                                        <div className="text-xs text-gray-400 mt-0.5">ID: {product.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.stock > 10 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                                                        In Stock ({product.stock})
                                                    </span>
                                                ) : product.stock > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                        Low Stock ({product.stock})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white text-gray-500 border border-gray-200 line-through">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-black">
                                                ${product.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                                    title="Delete Product"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
            </div>
        </div>
    );
}