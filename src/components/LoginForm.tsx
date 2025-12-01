// src/components/LoginForm.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data.message ||
            (mode === "login" ? "Login failed" : "Registration failed")
        );
        setLoading(false);
        return;
      }

      const hasFavorites: boolean = !!data.hasFavorites;
      // we *can* read these, but the explore page will also look them up
      // const favoritePlayerId: number | null = data.favoritePlayerId ?? null;
      // const favoriteTeamId: number | null = data.favoriteTeamId ?? null;

      // 🎯 New redirect logic:
      if (!hasFavorites) {
        // No favorites yet → go to setup flow
        router.push("/setup");
      } else {
        // Has favorites → go to the choice page
        router.push("/explore");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Login" : "Create an Account";
  const buttonLabel = loading
    ? mode === "login"
      ? "Logging in…"
      : "Creating account…"
    : mode === "login"
    ? "Login"
    : "Sign up";

  return (
    <div className="space-y-3 border rounded-xl p-4 mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-xl px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      </form>

      <button
        type="button"
        className="text-xs text-gray-600 underline"
        onClick={() => {
          setError(null);
          setMode(mode === "login" ? "register" : "login");
        }}
      >
        {mode === "login"
          ? "Don't have an account? Create one"
          : "Already have an account? Log in"}
      </button>
    </div>
  );
}
