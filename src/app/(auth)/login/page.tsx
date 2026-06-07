"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    router.push("/vault");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-md">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-500">Sign in to continue your journey.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input name="email" type="email" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input name="password" type="password" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-stone-500">
          No account?{" "}
          <Link href="/register" className="font-medium text-amber-800 hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  );
}
