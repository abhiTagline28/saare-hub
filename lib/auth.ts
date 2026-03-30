import { cookies } from "next/headers";
import { readJSON } from "./fileHandler";

export interface User {
  id: string;
  role: "admin" | "shopkeeper";
  name: string;
  email: string;
  password: string;
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    const users = await readJSON<User[]>("users.json");
    return users.find((u) => u.id === session.id) || null;
  } catch {
    return null;
  }
}

export async function requireAuth(role?: "admin" | "shopkeeper"): Promise<User> {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");
  if (role && user.role !== role) throw new Error("Forbidden");
  return user;
}
