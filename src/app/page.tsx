"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, ShoppingCart, Store, LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetch("/api/stores")
      .then(async (res) => {
        if (!res.ok) return []; // ✅ prevent crash
        return res.json();
      })
      .then((data) => setStores(data || []))
      .catch(() => setStores([])); // ✅ fallback
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* HEADER with Logout */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🏪 Local Store System</h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            )}
            {!user && (
              <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-blue-600 text-white p-12 rounded-3xl mb-10 shadow-2xl mx-4 mt-4">
        <h1 className="text-5xl font-bold flex items-center gap-3 mb-3">
          <ShoppingCart size={40} /> Discover Stores in Butuan
        </h1>
        <p className="text-lg opacity-95 mb-6">Find local businesses and support your community</p>

        <Link href="/map">
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
            🗺️ View on Map
          </button>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="max-w-6xl mx-auto px-4 mb-10">
        <input
          placeholder="🔍 Search stores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 mb-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-lg focus:border-blue-500 outline-none shadow-md"
        />
        {filtered.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">📍 Found {filtered.length} store{filtered.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      {/* STORES */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2 text-gray-800 dark:text-white">
          <Store size={32} /> Available Stores
        </h2>

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No stores found</p>
            <p className="text-gray-400 mt-2">Try searching with different keywords</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((store) => (
            <div
              key={store.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-blue-500 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white group-hover:text-blue-600 transition">{store.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin size={16} /> Butuan City
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full font-semibold">
                  {store.category}
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                📦 {store.products?.length || 0} products available
              </div>

              <Link href={`/stores/${store.id}`}>
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition font-semibold shadow-md">
                  View Store →
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}