"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageInput from "@/components/ImageInput";

export default function DashboardClient() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [data, setData] = useState<any>(null);
  const [productImage, setProductImage] = useState("");
  const [storeIndex, setStoreIndex] = useState(0);

  const fetchData = () => {
    fetch("/api/dashboard")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => setData(data))
      .catch(() => setData(null));
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      alert("Login required");
      router.push("/login");
      return;
    }

    if (user.role !== "SELLER") {
      alert("Access denied");
      router.push("/");
      return;
    }

    setAuthorized(true);
    fetchData();

    // ✅ Auto-refresh dashboard every 2 seconds for real-time updates
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!authorized || !data) {
    return <div className="p-5">Loading dashboard...</div>;
  }

  // ✅ Delete product
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch("/api/products/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (res.ok) {
      alert("✅ Product deleted");
      fetchData();
    } else {
      alert("❌ Failed to delete product");
    }
  };

  // ✅ Delete store
  const handleDeleteStore = async (storeId: number) => {
    if (!confirm("Are you sure? This will delete the store and ALL its products!")) return;

    const res = await fetch("/api/stores/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    });

    if (res.ok) {
      alert("✅ Store deleted");
      fetchData();
    } else {
      alert("❌ Failed to delete store");
    }
  };

  return (
    <div className="p-5 space-y-6">
      <h1 className="text-3xl font-bold">🏪 Seller Dashboard</h1>

      {/* ➕ CREATE STORE */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
        <h2 className="font-bold mb-3 text-lg">➕ Create Store</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as any;

            const res = await fetch("/api/stores", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: form.name.value,
                category: form.category.value,
                latitude: Number(form.latitude.value),
                longitude: Number(form.longitude.value),
              }),
            });

            const result = await res.json();
            if (!res.ok) {
              alert(`❌ Error: ${result.error || "Failed to create store"}`);
            } else {
              alert("✅ Store created successfully!");
              form.reset();
              fetchData(); // Refresh after successful creation
            }
          }}
        >
          <input name="name" placeholder="Store Name" className="border p-2 w-full mb-2" required />
          <input name="category" placeholder="Category" className="border p-2 w-full mb-2" required />
          <input name="latitude" placeholder="Latitude" className="border p-2 w-full mb-2" type="number" step="any" required />
          <input name="longitude" placeholder="Longitude" className="border p-2 w-full mb-2" type="number" step="any" required />

          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Create Store
          </button>
        </form>
      </div>

      {/* 📊 STORES */}
      {data.stores.map((store: any) => (
        <div key={store.id} className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{store.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">🏷️ {store.category}</p>
            </div>
            <button
              onClick={() => handleDeleteStore(store.id)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition font-semibold"
            >
              🗑️ Delete Store
            </button>
          </div>

          {/* ➕ ADD PRODUCT */}
          <div className="bg-white dark:bg-gray-700 p-5 rounded-xl mb-6 shadow-md">
            <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white">➕ Add New Product</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as any;

                const res = await fetch("/api/products", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: form.name.value,
                    price: Number(form.price.value),
                    image: productImage,
                    storeId: store.id,
                  }),
                });

                const result = await res.json();
                if (!res.ok) {
                  alert(`❌ Error: ${result.error || "Failed to add product"}`);
                } else {
                  alert("✅ Product added successfully!");
                  form.reset();
                  setProductImage("");
                  fetchData();
                }
              }}
            >
              <input name="name" placeholder="Product name" className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg dark:bg-gray-600 dark:text-white focus:border-blue-500 outline-none" required />
              <input name="price" placeholder="Price (₱)" type="number" step="0.01" className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg dark:bg-gray-600 dark:text-white focus:border-green-500 outline-none" min="0" required />
              
              <div className="mb-3">
                <ImageInput value={productImage} onChange={setProductImage} />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 font-semibold transition shadow-md">
                ➕ Add Product
              </button>
            </form>
          </div>

          {/* PRODUCTS */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              📦 Products ({store.products.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {store.products.map((p: any) => (
                <div key={p.id} className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-md hover:shadow-lg transition border-t-2 border-blue-400">
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden mb-3">
                    <img 
                      src={p.image || "https://via.placeholder.com/300x200?text=No+Image"} 
                      alt={p.name}
                      className="w-full h-full object-cover" 
                      onError={(e: any) => e.target.src = "https://via.placeholder.com/300x200?text=No+Image"}
                    />
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{p.name}</p>
                  <p className="text-green-600 dark:text-green-400 font-bold">₱{p.price}</p>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="mt-2 w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition font-semibold"
                  >
                    🗑️ Delete Product
                  </button>
                </div>
              ))}
            </div>
            {store.products.length === 0 && (
              <p className="text-center text-gray-400 py-8">No products added yet</p>
            )}
          </div>
        </div>
      ))}

      {/* 💬 CHAT-LIKE ORDERS */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
        <h2 className="text-2xl font-bold mb-5 text-gray-800 dark:text-white flex items-center gap-2">
          💬 Orders (Live Feed)
        </h2>

        {data.orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No orders yet</p>
            <p className="text-gray-500 mt-2">Orders will appear here once customers start buying</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.orders.map((order: any) => (
              <div key={order.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border-l-4 border-purple-400 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">📥 Order #{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total: ₱{order.total}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold ${
                    order.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    order.status === 'CONFIRMED' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                    order.status === 'PROCESSING' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                    order.status === 'SHIPPED' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                    'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* CUSTOMER CONTACT */}
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-500">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">📮 Customer Info:</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">📧 {order.email}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">📱 {order.phone}</p>
                </div>

                {/* ITEMS */}
                <div className="mt-2 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                  {order.items.map((item: any) => (
                    <p key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
                      • {item.product.name} x {item.quantity}
                    </p>
                  ))}
                </div>

                {/* STATUS BUTTONS */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={async () => {
                        if (confirm("Confirm order as received?")) {
                          const res = await fetch("/api/orders", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: order.id, action: "confirm" }),
                          });
                          if (res.ok) {
                            fetchData();
                          } else {
                            alert("❌ Failed to confirm order");
                          }
                        }
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition font-semibold"
                    >
                      ✅ Confirm
                    </button>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/orders", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: order.id, action: "processing" }),
                        });
                        if (res.ok) {
                          fetchData();
                        } else {
                          alert("❌ Failed to start processing");
                        }
                      }}
                      className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition font-semibold"
                    >
                      👨‍🍳 Start Processing
                    </button>
                  )}

                  {order.status === 'PROCESSING' && (
                    <button
                      onClick={async () => {
                        if (confirm("Mark as shipped/out for delivery?")) {
                          const res = await fetch("/api/orders", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: order.id, action: "shipped" }),
                          });
                          if (res.ok) {
                            fetchData();
                          } else {
                            alert("❌ Failed to mark as shipped");
                          }
                        }
                      }}
                      className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition font-semibold"
                    >
                      🚚 Delivery Sent
                    </button>
                  )}

                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/orders", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: order.id, action: "delivered" }),
                        });
                        if (res.ok) {
                          fetchData();
                        } else {
                          alert("❌ Failed to mark as delivered");
                        }
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition font-semibold"
                    >
                      📦 Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}