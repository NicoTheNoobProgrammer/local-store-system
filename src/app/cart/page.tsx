"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const loadCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return setItems([]);
      const data = await res.json();
      setItems(data || []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    // Check if user is seller - sellers cannot use cart
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.role === "SELLER") {
      alert("❌ Sellers cannot use the cart");
      router.push("/dashboard");
      return;
    }

    loadCart();
    const interval = setInterval(loadCart, 2000);
    return () => clearInterval(interval);
  }, [router]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  const deliveryFee = items.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const updateQty = async (id: number, type: string) => {
    await fetch("/api/cart/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId: id, type }),
    });

    loadCart();
  };

  const handleCheckout = async () => {
    if (!email.trim() || !phone.trim()) {
      alert("❌ Please enter your email and phone number");
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`❌ ${data.error || "Checkout failed"}`);
      return;
    }

    alert("✅ Order placed! Seller will contact you soon");
    setEmail("");
    setPhone("");
    loadCart();
    router.push("/");
  };

  const cancelCart = async () => {
    await fetch("/api/cart/clear", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">🛒 Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          Your cart is empty 🛒
        </p>
      ) : (
        <>
          {/* ITEMS */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 p-4 shadow rounded-xl flex justify-between"
              >
                <div>
                  <p className="font-semibold">{item.product.name}</p>

                  <div className="flex gap-2 mt-2 items-center">
                    <button
                      onClick={() => updateQty(item.id, "decrease")}
                      className="px-2 bg-gray-300 rounded"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => updateQty(item.id, "increase")}
                      className="px-2 bg-gray-300 rounded"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm text-gray-500">
                    ₱{item.product.price}
                  </p>
                </div>

                <p className="font-bold">
                  ₱{item.product.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          {/* CONTACT INFO */}
          <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <h2 className="font-bold mb-4 text-lg">📮 Delivery Contact Info</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">📧 Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">📱 Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full p-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="mt-6 p-5 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <h2 className="font-semibold mb-3">🧾 Order Summary</h2>

            {items.map((item) => (
              <p key={item.id}>
                {item.product.name} x{item.quantity}
              </p>
            ))}

            <p className="mt-2">Subtotal: ₱{subtotal}</p>
            <p>Delivery Fee: ₱{deliveryFee}</p>

            <p className="font-bold mt-2 text-lg">
              Total: ₱{total}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between mt-5">
            <button
              onClick={cancelCart}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancel Cart
            </button>

            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}