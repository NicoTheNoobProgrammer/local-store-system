"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function FloatingCart() {
  const [items, setItems] = useState<any[]>([]);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    // Check if user is seller
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.role === "SELLER") {
      setIsSeller(true);
      return;
    }

    const loadCart = async () => {
      try {
        const res = await fetch("/api/cart");

        if (!res.ok) {
          setItems([]);
          return;
        }

        const text = await res.text();

        // 🔥 FIX: prevent JSON crash
        if (!text) {
          setItems([]);
          return;
        }

        const data = JSON.parse(text);
        setItems(data || []);
      } catch {
        setItems([]);
      }
    };

    loadCart();

    const interval = setInterval(loadCart, 2000);
    return () => clearInterval(interval);
  }, []);

  // Hide cart for sellers
  if (isSeller) return null;

  // Hide cart when empty
  if (items.length === 0) return null;

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  return (
    <div className="fixed right-5 bottom-5 bg-white dark:bg-gray-800 shadow-xl p-4 rounded-xl w-64 border dark:border-gray-700">
      <h3 className="font-semibold mb-2 dark:text-white">Cart</h3>

      <div className="max-h-48 overflow-y-auto mb-3">
        {items.map((item) => (
          <p key={item.id} className="text-sm dark:text-gray-300">
            {item.product.name} x {item.quantity}
          </p>
        ))}
      </div>

      <p className="font-bold mt-2 dark:text-white">₱{total}</p>

      <Link href="/cart">
        <button className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition text-sm">
          Go to Cart →
        </button>
      </Link>
    </div>
  );
}