"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("auth")) {
      router.push("/login");
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}