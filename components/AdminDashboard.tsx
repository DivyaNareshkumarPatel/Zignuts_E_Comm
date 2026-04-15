"use client";

import { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const Card = ({ title, value }: { title: string; value: string }) => (
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
              <Card title="Orders" value="120" />
              <Card title="Users" value="80" />
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Manage Products</h1>
            <button className="mb-4 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90">
              Add Product
            </button>
            <div className="bg-white p-4 rounded-xl shadow">
              <p>No products yet...</p>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Orders</h1>
            <div className="bg-white p-4 rounded-xl shadow">
              <p>No orders found...</p>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Users</h1>
            <div className="bg-white p-4 rounded-xl shadow">
              <p>No users yet...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
