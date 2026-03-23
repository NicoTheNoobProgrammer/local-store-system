"use client";

import { useState } from "react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const handleAdd = async () => {
    await fetch("/api/product/create", {
      method: "POST",
      body: JSON.stringify({
        name,
        price: Number(price),
        image,
      }),
    });

    alert("Product added!");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">
        ➕ Add Product
      </h1>

      <input
        placeholder="Product name"
        className="w-full p-2 border mb-3"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Price"
        className="w-full p-2 border mb-3"
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        placeholder="Image URL"
        className="w-full p-2 border mb-3"
        onChange={(e) => setImage(e.target.value)}
      />

      <button
        onClick={handleAdd}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Add Product
      </button>
    </div>
  );
}