"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

  const handleSignup = async () => {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password, role }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(data));

    // Redirect based on role
    if (role === "SELLER") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-500 to-blue-500 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">✨ Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join our marketplace today</p>
          </div>

          <div className="space-y-4">
            <input
              placeholder="📧 Email"
              type="email"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-green-500 outline-none transition"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              placeholder="👤 Username (display name)"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-green-500 outline-none transition"
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="🔑 Password"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-green-500 outline-none transition"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-green-500 outline-none transition"
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="USER">👤 User (Buyer)</option>
              <option value="SELLER">🏪 Seller (Business)</option>
            </select>

            <button
              onClick={handleSignup}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-600 transition font-semibold shadow-lg mt-6"
            >
              Create Account
            </button>
          </div>

          <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-gray-600 dark:text-gray-400">Already have an account?</p>
            <Link href="/login">
              <button className="text-green-600 dark:text-green-400 font-semibold hover:underline mt-2">
                Sign in here
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}