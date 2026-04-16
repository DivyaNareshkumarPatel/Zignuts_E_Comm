'use client'

import { useState, useEffect } from 'react';

interface Product { id: string; name: string; price: number; stock: number; }
interface OrderItem { id: string; name: string; price: number; quantity: number; }
interface Order { id: string; userId: string; items: OrderItem[]; total: number; status: string; createdAt: string; }

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const res = await fetch('/api/products');
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const res = await fetch('/api/orders');
            if (res.ok) setOrders(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !stock) return;
        setIsSubmitting(true);
        
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price, stock })
            });

            if (!res.ok) throw new Error('Failed to save product');

            setName('');
            setPrice('');
            setStock('');
            
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
                await fetch(`/api/products/${id}`, { method: 'DELETE' });
                showNotification('Product deleted', 'success');
                fetchProducts();
            } catch (error) {
                console.error(error);
                showNotification('Error deleting product', 'error');
            }
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            showNotification(`Order marked as ${newStatus}`, 'success');
            fetchOrders(); 
        } catch (error) {
            console.error(error);
            showNotification('Error updating order', 'error');
        }
    };

    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-end pb-2">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-black">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your store operations.</p>
                </div>
                {notification && (
                    <div className={`px-4 py-2 rounded shadow-sm text-sm font-medium ${notification.type === 'success' ? 'bg-black text-white' : 'bg-gray-100 text-black border border-gray-300'}`}>
                        {notification.message}
                    </div>
                )}
            </div>

            <div className="flex gap-8 border-b border-gray-200">
                <button onClick={() => setActiveTab('products')} className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'products' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
                    Inventory {activeTab === 'products' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></span>}
                </button>
                <button onClick={() => setActiveTab('orders')} className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'orders' ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
                    Customer Orders {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></span>}
                </button>
            </div>

            {activeTab === 'products' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Form Panel - Image Input Removed */}
                    <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-medium text-black">Add New Product</h2>
                        </div>
                        <form onSubmit={handleAddProduct} className="p-5 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="e.g. Minimalist Watch" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                        <input type="number" required min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input type="number" required min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="0" />
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50">
                                {isSubmitting ? 'Publishing...' : 'Publish Product'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-medium text-black">All Products</h2>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{products.length} items</span>
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
                                    {isLoadingProducts ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading inventory...</td></tr>
                                    ) : products.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No products found.</td></tr>
                                    ) : (
                                        products.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-gray-900 text-white flex items-center justify-center rounded-md font-bold text-xs tracking-wider">
                                                            {getInitials(product.name)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-black">{product.name}</div>
                                                            <div className="text-xs text-gray-400 mt-0.5">ID: {product.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.stock > 10 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><span className="w-1.5 h-1.5 rounded-full bg-black"></span>In Stock ({product.stock})</span>
                                                    ) : product.stock > 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Low Stock ({product.stock})</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white text-gray-500 line-through">Out of Stock</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-black">${product.price.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-all">
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
            )}

            {activeTab === 'orders' && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-medium text-black">Customer Orders</h2>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{orders.length} orders</span>
                    </div>
                    <div className="p-6">
                        {isLoadingOrders ? (
                            <div className="py-12 text-center text-gray-500">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">No orders have been placed yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 flex flex-col h-full">
                                        <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                                                <p className="font-mono text-sm font-medium text-black">{order.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Date</p>
                                                <p className="text-sm font-medium text-black">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-6 flex-grow">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="bg-gray-200 text-gray-600 font-medium px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                                                        <span className="text-gray-800">{item.name}</span>
                                                    </div>
                                                    <span className="font-medium text-black">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-black text-white'}`}>{order.status}</span>
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-0.5">Total Paid</p>
                                                    <p className="text-xl font-bold text-black">${order.total.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            {order.status !== 'Delivered' && (
                                                <button onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')} className="w-full py-2 bg-white border border-gray-300 text-sm font-bold uppercase tracking-wider text-black rounded hover:bg-black hover:text-white transition-colors">Mark as Delivered</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}