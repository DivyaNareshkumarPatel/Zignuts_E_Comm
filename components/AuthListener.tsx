'use client';
import {useEffect} from 'react';
import { useDispatch} from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase_auth';
import { setUser, clearUser, setLoadingComplete } from '@/store/authSlice';

export default function AuthListener({children}:{children: React.ReactNode}){
    const dispatch = useDispatch();
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, async (user)=>{
            if(user){
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const role = userDoc.exists() ? userDoc.data().role : 'user';
                dispatch(setUser({uid: user.uid, email: user.email || '', role}));
            } else{
                dispatch(clearUser())
            }
            dispatch(setLoadingComplete());
        })
        return () => unsubscribe();
    }, [dispatch]);
    return <>{children}</>
}