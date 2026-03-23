"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Login failed");
        return;
      }

      const data = await res.json();

      if (!data.user) {
        alert(data.error || "Invalid credentials");
        return;
      }

      // 🔥 Role check
      if (data.user.role !== role) {
        alert("Wrong role selected");
        return;
      }

      // ✅ Save session (client side)
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect immediately (router.push doesn't return a resolvable Promise)
      if (role === "SELLER") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Network error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🔐 Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
          </div>

          <div className="space-y-4">
            <input
              placeholder="📧 Email"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 outline-none transition"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="🔑 Password"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 outline-none transition"
              onChange={(e) => setPassword(e.target.value)}
            />

            <select
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 outline-none transition"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="USER">👤 User (Buyer)</option>
              <option value="SELLER">🏪 Seller (Business)</option>
            </select>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition font-semibold shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-gray-600 dark:text-gray-400">Don't have an account?</p>
            <Link href="/signup">
              <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-2">
                Create one now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}