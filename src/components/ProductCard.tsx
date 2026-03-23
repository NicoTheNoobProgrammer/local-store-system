"use client";

import { useState } from "react";
import WishlistButton from "./WishlistButton";
import Rating from "./Rating";

export default function ProductCard({ product }: any) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    setLoading(true);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        quantity: qty,
      }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      setQty(1); // reset
    }

    setLoading(false);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden group">
      
      {/* IMAGE */}
      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            onError={(e: any) => {
              e.target.style.display = "none";
              const parent = e.target.parentElement;
              if (parent) {
                const fallback = parent.querySelector("[data-fallback]");
                if (fallback) fallback.style.display = "flex";
              }
            }}
          />
        ) : null}

        {/* FALLBACK IF IMAGE FAILS */}
        <div
          data-fallback
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
          style={{ display: product.image ? "none" : "flex" }}
        >
          <div className="text-center">
            <p className="text-5xl">📸</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">No image</p>
          </div>
        </div>

        <div className="absolute top-2 right-2">
          <WishlistButton />
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 bg-gradient-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{product.name}</h3>

        <p className="text-green-600 dark:text-green-400 font-bold text-lg mt-2">
          ₱{product.price}
        </p>

        <Rating />

        {/* 🔢 QUANTITY */}
        <div className="flex items-center gap-3 mt-3 bg-gray-100 dark:bg-gray-600 p-2 rounded-lg">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-3 py-1 bg-gray-400 dark:bg-gray-500 text-white rounded hover:bg-gray-500 transition"
          >
            −
          </button>

          <span className="font-semibold text-gray-800 dark:text-white flex-1 text-center">{qty}</span>

          <button
            onClick={() => setQty(qty + 1)}
            className="px-3 py-1 bg-gray-400 dark:bg-gray-500 text-white rounded hover:bg-gray-500 transition"
          >
            +
          </button>
        </div>

        {/* 🛒 ADD */}
        <button
          onClick={addToCart}
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition active:scale-95 font-semibold shadow-md"
        >
          {loading ? "Adding..." : `Add ${qty} to Cart`}
        </button>
      </div>
    </div>
  );
}