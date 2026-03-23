import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id: Number(id) },
    include: { products: true },
  });

  if (!store) {
    return <div className="p-5">Store not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* 🔥 HERO */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 text-white p-8 rounded-2xl shadow-lg mb-10 mt-6">
          <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
          <p className="text-lg opacity-90 flex items-center gap-2">
            🏷️ Category: <span className="bg-white/20 px-3 py-1 rounded-full">{store.category}</span>
          </p>
        </div>

        {/* 🛍 PRODUCTS */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            🛍️ Available Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {store.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* EMPTY STATE */}
        {store.products.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">📭 No products available yet</p>
            <p className="text-gray-400 mt-2">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}