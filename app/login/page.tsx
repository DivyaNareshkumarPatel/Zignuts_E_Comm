"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase_auth";
import { setUser } from "@/store/authSlice";

// Schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["user", "admin"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
  });

  const onSubmit = async (data: any) => {
    setError("");
    setLoading(true);

    try {
      if (!isLogin) {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        await setDoc(doc(db, "users", userCred.user.uid), {
          email: userCred.user.email,
          role: data.role,
          createdAt: Date.now(),
        });

        dispatch(
          setUser({
            uid: userCred.user.uid,
            email: userCred.user.email || "",
            role: data.role,
          })
        );
      } else {
        const userCred = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
        const fetchedRole = userDoc.exists()
          ? userDoc.data().role
          : "user";

        dispatch(
          setUser({
            uid: userCred.user.uid,
            email: userCred.user.email || "",
            role: fetchedRole,
          })
        );
      }

      router.push("/dashboard");
      reset();
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already registered");
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password");
      } else if (err.code === "auth/weak-password") {
        setError("Weak password");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <div>
              <input
                {...register("name")}
                placeholder="Full Name"
                className="w-full border rounded-lg p-2"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
          )}

          <div>
            <input
              {...register("email")}
              placeholder="Email"
              className="w-full border rounded-lg p-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              {...register("password")}
              placeholder="Password"
              className="w-full border rounded-lg p-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {!isLogin && (
            <>
              <div>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirm Password"
                  className="w-full border rounded-lg p-2"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div>
                <select
                  {...register("role")}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2"
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              reset();
            }}
            className="ml-1 text-blue-600"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
