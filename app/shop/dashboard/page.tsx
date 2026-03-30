"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import DesignCard from "@/components/DesignCard";
import type { Design, Selection } from "@/lib/types";

export default function ShopDashboard() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/designs").then((r) => r.json()),
      fetch("/api/selections").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([designData, selData, meData]) => {
      setDesigns(designData.designs || []);
      setSelections(selData.selections || []);
      if (meData.user) setUserEmail(meData.user.email);
      setLoading(false);
    });
  }, []);

  const handleSelect = async (designId: string) => {
    const res = await fetch("/api/selections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ designId }),
    });

    if (res.ok) {
      const data = await res.json();
      setSelections((prev) => [...prev, data.selection]);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to select");
    }
  };

  const selectedIds = new Set(selections.map((s) => s.designId));

  const filtered = designs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute requiredRole="shopkeeper">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Designs</h1>
            <p className="text-sm text-gray-500 mt-1">
              {designs.length} designs assigned to you &middot; {selections.length} selected
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search designs..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>
        </div>

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
            <h3 className="text-lg font-medium text-gray-900">No designs available</h3>
            <p className="text-sm text-gray-500 mt-1">
              {search
                ? "Try a different search term"
                : "No designs have been assigned to you yet. Check back later."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((design) => (
              <DesignCard
                key={design.id}
                {...design}
                watermarkText={userEmail}
                showSelect
                isSelected={selectedIds.has(design.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
