"use client";

import { useState } from "react";

interface DesignCardProps {
  id: string;
  title: string;
  image: string;
  createdAt: string;
  watermarkText?: string;
  showSelect?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  assignedTo?: string[];
  shopkeeperNames?: Record<string, string>;
}

export default function DesignCard({
  id,
  title,
  image,
  createdAt,
  watermarkText,
  showSelect,
  isSelected,
  onSelect,
  showActions,
  onEdit,
  onDelete,
  assignedTo,
  shopkeeperNames,
}: DesignCardProps) {
  const [selecting, setSelecting] = useState(false);

  const isNew = Date.now() - new Date(createdAt).getTime() < 48 * 60 * 60 * 1000;

  const handleSelect = async () => {
    if (!onSelect || selecting) return;
    setSelecting(true);
    await onSelect(id);
    setSelecting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Image container with protections */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-gray-100"
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* Watermark overlay */}
        {watermarkText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rotate-[-30deg] opacity-20">
              {[...Array(3)].map((_, i) => (
                <p
                  key={i}
                  className="text-white text-xl font-bold whitespace-nowrap mb-16 tracking-widest"
                  style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                >
                  {watermarkText}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Transparent overlay to prevent image interaction */}
        <div className="absolute inset-0 bg-transparent" onContextMenu={(e) => e.preventDefault()} />

        {/* NEW badge */}
        {isNew && (
          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            NEW
          </span>
        )}

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Selected
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        {/* Assigned shopkeepers (admin view) */}
        {assignedTo && shopkeeperNames && (
          <div className="mt-2 flex flex-wrap gap-1">
            {assignedTo.map((shopId) => (
              <span
                key={shopId}
                className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full"
              >
                {shopkeeperNames[shopId] || shopId}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {showSelect && !isSelected && (
            <button
              onClick={handleSelect}
              disabled={selecting}
              className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              {selecting ? "Selecting..." : "Select Design"}
            </button>
          )}
          {showSelect && isSelected && (
            <span className="flex-1 text-center text-sm font-medium text-blue-600 py-2">
              Already Selected
            </span>
          )}

          {showActions && (
            <>
              <button
                onClick={() => onEdit?.(id)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
