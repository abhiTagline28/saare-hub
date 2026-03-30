"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionUser {
  id: string;
  role: string;
  name: string;
  email: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: "admin" | "shopkeeper";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: { user: SessionUser | null }) => {
        if (!data.user) {
          router.push("/login");
        } else if (data.user.role !== requiredRole) {
          router.push(data.user.role === "admin" ? "/admin/dashboard" : "/shop/dashboard");
        } else {
          setAuthorized(true);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
