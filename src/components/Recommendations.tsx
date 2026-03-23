"use client";

import { useEffect, useState } from "react";

export default function Recommendations() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommend")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mt-8 text-gray-500">
        Loading recommendations...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mt-8 text-gray-500">
        No recommendations yet. Add items to cart.
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white shadow rounded p-4">
      <h2 className="text-lg font-bold mb-2">
        🤖 Recommended for You
      </h2>

      <p className="text-xs text-gray-500 mb-3">
        Based on your cart and browsing behavior
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded p-2 hover:shadow transition"
          >
            <p className="font-semibold">{item.name}</p>
            <p className="text-green-600">₱{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}