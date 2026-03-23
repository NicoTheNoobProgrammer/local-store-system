"use client";

import { useState, useEffect, useRef } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  store: {
    name: string;
  };
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "bot", text: "👋 Hi! I can help you find products. What are you looking for?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const searchProducts = async (query: string) => {
    try {
      setLoading(true);

      // Try dashboard API first (for sellers), fallback to stores API (for everyone)
      let allProducts: Product[] = [];

      const dashboardRes = await fetch("/api/dashboard");
      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        if (data.stores && Array.isArray(data.stores)) {
          allProducts = data.stores.flatMap((store: any) =>
            store.products.map((p: any) => ({
              ...p,
              store: { name: store.name },
            }))
          );
        }
      }

      // Fallback: If no products from dashboard, fetch from stores API
      if (allProducts.length === 0) {
        const storesRes = await fetch("/api/stores");
        if (storesRes.ok) {
          const stores = await storesRes.json();
          if (Array.isArray(stores)) {
            allProducts = stores.flatMap((store: any) =>
              (store.products || []).map((p: any) => ({
                ...p,
                store: { name: store.name },
              }))
            );
          }
        }
      }

      // If still no products, return empty results
      if (allProducts.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "No products found. Try again later.",
          },
        ]);
        return null;
      }

      // Search products by name or store
      const queryLower = query.toLowerCase();
      const results = allProducts.filter((p: Product) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.store.name.toLowerCase().includes(queryLower)
      );

      return results;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    // Search products
    const products = await searchProducts(input);

    if (!products || products.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `❌ Sorry, I didn't find any products matching "${input}". Try searching for something else!`,
        },
      ]);
    } else {
      // Format product suggestions
      const productList = products
        .slice(0, 3)
        .map((p: Product) => `🛍️ ${p.name} - ₱${p.price} (${p.store.name})`)
        .join("\n");

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `✅ Found ${products.length} product(s)! Here are the top matches:\n\n${productList}\n\n💡 Browse our marketplace to see more!`,
        },
      ]);
    }
  };

  return (
    <>
      {/* Chat Bot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 z-40"
        title="Chat Bot"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-40 border-2 border-blue-300 dark:border-blue-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
            <h3 className="font-bold text-lg">🤖 Product Assistant</h3>
            <p className="text-xs opacity-90">Ask me what you're looking for!</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                  } whitespace-pre-wrap text-sm`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  ⏳ Searching...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-300 dark:border-gray-700 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Search products..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold text-sm transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
