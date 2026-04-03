'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoginLogo from "@/components/LoginLogo";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/data");
        const db = await res.json();
        setSettings(db.settings || {});
      } catch (err) {
        setMessage("Failed to load settings");
      }
    }
    fetchSettings();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("auth", "true");
      router.push("/dashboard");
    } else {
      setMessage("Invalid username or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <LoginLogo settings={settings} />
          <h1 className="text-2xl font-bold mt-4 text-black text-center">
            {settings?.shopName || "TechNinja"}
          </h1>
          <h3 className="text-sm text-gray-500 mt-1 text-center">
            Welcome back! Please login to your account.
          </h3>  
        </div>

        {message && (
          <p className="text-red-500 text-sm mb-4 text-center">{message}</p>
        )}

        <input
          className="w-full p-3 border text-black rounded mb-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full p-3 border text-black rounded mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Link href="/forgetPwd" className="text-sm text-blue-500 mb-4 block text-right">
          Forgot Password?
        </Link>

        <button className="w-full bg-black text-white p-3 rounded">
          Login
        </button>
      </form>
    </div>
  );
}