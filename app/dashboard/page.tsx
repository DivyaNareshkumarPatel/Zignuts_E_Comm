'use client'

import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
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
        return (
            <div className="min-h-screen flex items-center justify-center font-sans text-gray-500">
                Loading account details...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white p-8 border border-gray-200 rounded-lg flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">My Account</h1>
                        <p className="text-gray-600">
                            Signed in as <span className="font-semibold text-black">{email}</span>
                        </p>
                        <div className="mt-4">
                            <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-sm">
                                Role: {role || 'Guest'}
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout} 
                        className="w-full md:w-auto border border-black text-black px-6 py-2.5 font-semibold hover:bg-black hover:text-white transition-colors rounded-md"
                    >
                        Sign Out
                    </button>
                </div>

                {role === 'admin' ? (
                    <AdminDashboard /> 
                ) : (
                    <UserDashboard />
                )}
                
            </div>
        </div>
    )
}