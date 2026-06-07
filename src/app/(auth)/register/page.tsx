"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/vault");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-md">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold">Begin your foundation</h1>
        <p className="mt-1 text-sm text-stone-500">
          Create your account and start with the Accomplishments Vault.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <Input name="name" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input name="email" type="email" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input name="password" type="password" minLength={8} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-amber-800 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
