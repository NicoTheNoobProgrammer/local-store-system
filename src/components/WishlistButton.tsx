"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function WishlistButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      <Heart
        className={`${
          liked ? "text-red-500 fill-red-500" : "text-gray-400"
        }`}
      />
    </button>
  );
}