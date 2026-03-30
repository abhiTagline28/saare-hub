"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import DesignCard from "@/components/DesignCard";
import type { Design } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [shopkeeperNames, setShopkeeperNames] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/designs").then((r) => r.json()),
      fetch("/api/shopkeepers").then((r) => r.json()),
    ]).then(([designData, shopData]) => {
      setDesigns(designData.designs || []);
      const names: Record<string, string> = {};
      (shopData.shopkeepers || []).forEach((s: { id: string; name: string }) => {
        names[s.id] = s.name;
      });
      setShopkeeperNames(names);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this design?")) return;
    const res = await fetch("/api/designs/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const filtered = designs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Design Library</h1>
            <p className="text-sm text-gray-500 mt-1">{designs.length} total designs</p>
          </div>
          <button
            onClick={() => router.push("/admin/upload")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Design
          </button>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designs..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No designs found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {search ? "Try a different search term" : "Upload your first saree design to get started"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((design) => (
              <DesignCard
                key={design.id}
                {...design}
                showActions
                onEdit={(id) => router.push(`/admin/designs/edit?id=${id}`)}
                onDelete={handleDelete}
                assignedTo={design.assignedTo}
                shopkeeperNames={shopkeeperNames}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((design) => (
              <div
                key={design.id}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div
                  className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img
                    src={design.image}
                    alt={design.title}
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{design.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(design.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {design.assignedTo.map((shopId) => (
                      <span
                        key={shopId}
                        className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full"
                      >
                        {shopkeeperNames[shopId] || shopId}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/admin/designs/edit?id=${design.id}`)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(design.id)}
                    className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
