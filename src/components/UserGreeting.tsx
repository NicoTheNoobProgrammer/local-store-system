"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserGreeting() {
  const [user, setUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return; // Prevent double logout
    setLoggingOut(true);
    
    // Immediately clear UI (remove username and role from display)
    setUser(null);
    
    try {
      // Call logout API to clear server-side cookie
      await fetch("/api/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    // Clear local storage
    localStorage.removeItem("user");
    
    // Redirect to login
    router.push("/login");
  };

  if (!user) return null;

  const roleLabel = user.role === "SELLER" ? "Seller" : "User";

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">
        <span className="text-gray-600 dark:text-gray-400">Welcome, </span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {user.username || user.email?.split("@")[0]} ({roleLabel})
        </span>
      </div>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="ml-2 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition font-medium"
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
