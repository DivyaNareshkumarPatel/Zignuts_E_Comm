'use client'
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';


export default function AuthGuard({ children }: { children: React.ReactNode }) {

    const { uid, loading } = useSelector((state: any) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !uid) {
            router.push('/login');
        }
    }, [uid, loading, router]);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-sm">Loading...</p>
                </div>
            </div>
        );
    }
    if (!uid) {
        return null;
    }
    return <>{children}</>;
}