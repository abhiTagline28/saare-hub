"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Design } from "@/lib/types";

interface Shopkeeper {
  id: string;
  name: string;
  email: string;
}

function EditDesignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");

  const [design, setDesign] = useState<Design | null>(null);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!designId) return;

    Promise.all([
      fetch("/api/designs").then((r) => r.json()),
      fetch("/api/shopkeepers").then((r) => r.json()),
    ]).then(([designData, shopData]) => {
      const found = (designData.designs || []).find((d: Design) => d.id === designId);
      if (found) {
        setDesign(found);
        setTitle(found.title);
        setPreview(found.image);
        setSelectedShops(found.assignedTo);
      }
      setShopkeepers(shopData.shopkeepers || []);
      setLoading(false);
    });
  }, [designId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleShop = (id: string) => {
    setSelectedShops((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || selectedShops.length === 0) {
      setError("Please fill all fields and select at least one shopkeeper");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("id", designId!);
    formData.append("title", title);
    formData.append("assignedTo", JSON.stringify(selectedShops));
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/designs/update", { method: "POST", body: formData });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Update failed");
      }
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium text-gray-900">Design not found</h3>
        <button onClick={() => router.push("/admin/dashboard")} className="mt-4 text-rose-600 hover:text-rose-700 text-sm font-medium">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Design Image</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-rose-400 transition-colors cursor-pointer"
          onClick={() => document.getElementById("image-input")?.click()}
        >
          {preview && (
            <img src={preview} alt="Preview" className="max-h-64 rounded-lg mx-auto" />
          )}
          <p className="text-xs text-gray-500 mt-2">Click to change image</p>
          <input id="image-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Design Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Shopkeepers</label>
        <div className="space-y-2">
          {shopkeepers.map((shop) => (
            <label
              key={shop.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedShops.includes(shop.id) ? "border-rose-300 bg-rose-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedShops.includes(shop.id)}
                onChange={() => toggleShop(shop.id)}
                className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{shop.name}</p>
                <p className="text-xs text-gray-500">{shop.email}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-all"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default function EditDesignPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Design</h1>
          <p className="text-sm text-gray-500 mt-1">Update design details and assignments</p>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <EditDesignForm />
        </Suspense>
      </main>
    </ProtectedRoute>
  );
}
