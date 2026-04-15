import { createSlice, PayloadAction } from '@reduxjs/toolkit'
interface AuthState {
    uid: string | null;
    email: string | null;
    role: 'admin' | 'user' | null,
    loading: boolean
}

const initialState: AuthState = {
    uid: null,
    email: null,
    role: null,
    loading: true
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ uid: string; email: string; role: 'admin' | 'user' }>) => {
            state.uid = action.payload.uid;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.loading = false;
        },
        clearUser: (state) => {
            state.uid = null;
            state.email = null;
            state.role = null;
            state.loading = false;
        },
        setLoadingComplete: (state) => {
            state.loading = false;
        }
    }
})

export const {setUser, clearUser, setLoadingComplete} = authSlice.actions;
export default authSlice.reducer;
