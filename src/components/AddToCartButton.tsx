"use client";

import { useState } from "react";

export default function AddToCartButton({ productId }: any) {
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition active:scale-95"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}