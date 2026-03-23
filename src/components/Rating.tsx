"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function Rating() {
  const [rating, setRating] = useState(0);

  return (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          onClick={() => setRating(i)}
          className={`cursor-pointer ${
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}