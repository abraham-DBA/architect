"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains uppercase", pass: /[A-Z]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1 animate-fade-in">
      {checks.map(({ label, pass }) => (
        <div key={label} className="flex items-center gap-2 text-xs">
          {pass ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <XIcon className="h-3 w-3 text-muted" />
          )}
          <span className={pass ? "text-success" : "text-muted"}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password,
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
    <Card className="w-full">
      <h1 className="text-2xl font-bold tracking-tight">Begin your foundation</h1>
      <p className="mt-1 text-sm text-muted">
        Create your account and start with the Accomplishments Vault.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium">
            Name
          </label>
          <Input
            id="register-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <div>
          <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-medium">
            Confirm password
          </label>
          <Input
            id="register-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={passwordMismatch}
            required
          />
          {passwordMismatch && (
            <p className="mt-1 text-xs text-danger animate-fade-in">Passwords do not match</p>
          )}
        </div>

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
