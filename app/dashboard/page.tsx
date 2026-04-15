'use client'

import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation" // Fixed import for App Router
import { auth } from "@/lib/firebase_auth"
import { clearUser } from "@/store/authSlice"
import AdminDashboard from "@/components/AdminDashboard"
import UserDashboard from "@/components/UserDashboard"

export default function DashboardPage() {
    const { email, role, loading } = useSelector((state: any) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        await auth.signOut();
        dispatch(clearUser());
        router.push('/login');
    }

    if (loading) {
        return <div className="p-8 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-sm text-gray-500">Logged in as: {email} ({role})</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Render Dashboard based on role */}
                {role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
            </div>
        </div>
    )
}