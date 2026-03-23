"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NavAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  if (isLoggedIn) return null;

  return (
    <>
      <Link href="/login" className="hover:text-blue-500 text-sm">
        Login
      </Link>

      <Link href="/signup" className="hover:text-green-500 text-sm font-medium">
        Sign Up
      </Link>
    </>
  );
}
