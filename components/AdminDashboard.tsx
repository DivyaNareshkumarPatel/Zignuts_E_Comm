// components/AdminDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase_auth";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const onSubmitProduct = async (data: ProductFormValues) => {
    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      
      setProducts([{ id: docRef.id, ...data }, ...products]);
      reset(); 
      setIsAddingProduct(false); 
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Failed to add product.");
    }
  };

  const NavButton = ({ label, tab }: { label: string; tab: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`text-left px-4 py-2 rounded-lg transition ${
        activeTab === tab
          ? "bg-black text-white"
          : "hover:bg-gray-200 text-gray-700"
      }`}
    >
      {label}
    </button>
  );

  const Card = ({ title, value }: { title: string; value: string | number }) => (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <NavButton label="Dashboard" tab="dashboard" />
          <NavButton label="Products" tab="products" />
          <NavButton label="Orders" tab="orders" />
          <NavButton label="Users" tab="users" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Total Sales" value="₹45,000" />
              <Card title="Total Products" value={products.length} />
              <Card title="Users" value="80" />
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Manage Products</h1>
              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
              >
                {isAddingProduct ? "Cancel" : "Add Product"}
              </button>
            </div>

            {/* Add Product Form */}
            {isAddingProduct && (
              <form
                onSubmit={handleSubmit(onSubmitProduct)}
                className="bg-white p-6 rounded-xl shadow mb-6 max-w-xl"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input
                    {...register("name")}
                    className="w-full border rounded-lg p-2"
                    placeholder="e.g., Wireless Headphones"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input
                    type="number"
                    {...register("price")}
                    className="w-full border rounded-lg p-2"
                    placeholder="999"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full border rounded-lg p-2"
                    placeholder="Product details..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Product"}
                </button>
              </form>
            )}

            {/* Product List Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              {isLoading ? (
                <p className="p-6 text-gray-500">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="p-6 text-gray-500">No products yet. Click "Add Product" to create one.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₹{product.price}</td>
                        <td className="px-6 py-4 truncate max-w-xs text-gray-500">{product.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Placeholders for other tabs */}
        {activeTab === "orders" && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Orders</h1>
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Order management backend integration pending...</p>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Users</h1>
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">User management backend integration pending...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}