"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoginLogo from "@/components/LoginLogo";
import Link from "next/link";


export default function ForgetPwd() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");

    useEffect(() => {
    async function fetchSettings() {
        try {
        const res = await fetch("/api/data");
        const db = await res.json();
        setSettings(db.settings || {});
        } catch (err) {
        console.error("Failed to load settings:", err);
        }
    }
    fetchSettings();
    }   , []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("email", email);

    const res = await fetch("/api/forgot-password", {
        method: "POST",
        body: formData,
    });
    const data = await res.json();
    if (data.success) {
        alert("Password reset link sent to your email");
        router.push("/login");
    }
    else {       
        setMessage("Email not found! In Our System");
    }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow w-full max-w-sm">
            <div className="flex flex-col items-center mb-6">
            <LoginLogo settings={settings} />
            <h1 className="text-2xl font-bold mt-4 text-black text-center">Forgot Password</h1>
            </div>
            {message && <p className="text-red-500 text-sm mb-4 text-center">{message}</p>}
            <input className="w-full p-3 border text-black rounded mb-4"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <button className="w-full bg-black text-white p-3 rounded">
            Send Reset Link
            </button>
            <Link href="/login" className="text-sm text-blue-500 mt-4 block text-center">
            Back to Login
            </Link>
        </form>
        </div>
    );
}   