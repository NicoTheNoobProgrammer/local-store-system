"use client";

import { useState } from "react";

export default function ImageInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [preview, setPreview] = useState<string>(value);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ✅ Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("❌ Only JPG, JPEG, and PNG files are allowed!");
        return;
      }

      // ✅ Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("❌ File too large! Maximum 2MB allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onChange(base64);
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden shadow-md">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setPreview("")}
          />
          <button
            onClick={() => {
              setPreview("");
              onChange("");
            }}
            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            ✕ Remove
          </button>
        </div>
      )}

      {/* FILE UPLOAD */}
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
        <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          🖼️ Upload Image (JPG, JPEG, PNG)
        </h4>

        <label className="flex items-center gap-2 cursor-pointer p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition border-2 border-dashed border-blue-300 dark:border-blue-600">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="text-2xl">📁</span>
          <div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold block">
              Click to Upload Image
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              JPG, JPEG, PNG (Max 2MB)
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
