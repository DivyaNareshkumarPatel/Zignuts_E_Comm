'use client'
 import { UseSelector, UseDispatch, useSelector, useDispatch } from "react-redux"
 import { useRouter } from "next/router"
 import { auth } from "@/lib/firebase_auth"
 import { clearUser } from "@/store/authSlice"
 import AdminDashboard from "@/components/AdminDashboard"
 import UserDashboard from "@/components/UserDashboard"

 export default function DashboardPage(){
    const {email, role} = useSelector((state:any)=>state.auth);
    const dispatch = useDispatch();
    const router = useRouter();
    const handleLogout = async () =>{
        await auth.signOut();
        dispatch(clearUser());
        router.push('/login')
    }
    return(
        <div>

        </div>
    )
 }