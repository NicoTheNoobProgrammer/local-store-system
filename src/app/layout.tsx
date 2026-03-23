import "./globals.css";
import Link from "next/link";
import FloatingCart from "@/components/FloatingCart";
import ThemeToggle from "@/components/ThemeToggle";
import UserGreeting from "@/components/UserGreeting";
import UnifiedChat from "@/components/ConversationAI";
import NavAuth from "@/components/NavAuth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">

        {/* 🔥 NAVBAR */}
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 shadow">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

            {/* 🛒 LOGO */}
            <Link href="/">
              <h1 className="font-bold text-lg flex items-center gap-2 cursor-pointer">
                🛒 <span>Local Marketplace</span>
              </h1>
            </Link>

            {/* 🔗 CENTER NAV */}
            <div className="hidden md:flex gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-blue-500 transition">
                Home
              </Link>

              <Link href="/map" className="hover:text-blue-500 transition">
                Map
              </Link>

              <Link href="/cart" className="hover:text-blue-500 transition">
                Cart
              </Link>

              {/* 🆕 DASHBOARD HERE */}
              <Link href="/dashboard" className="hover:text-blue-500 transition">
                Dashboard
              </Link>
            </div>

            {/* ⚙ RIGHT SIDE */}
            <div className="flex items-center gap-4">

              {/* 👤 USER GREETING & LOGOUT */}
              <UserGreeting />

              {/* Optional: duplicate for mobile visibility */}
              <Link href="/dashboard" className="text-sm hover:text-blue-500 md:hidden">
                Dashboard
              </Link>

              {/* 🔐 LOGIN/SIGNUP (shown when not logged in) */}
              <NavAuth />

              {/* 🌙 DARK MODE */}
              <ThemeToggle />
            </div>

          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* 🛒 FLOATING CART */}
        <FloatingCart />

        {/* 🤖 UNIFIED CHAT (BUYERS & SELLERS) */}
        <UnifiedChat />

      </body>
    </html>
  );
}