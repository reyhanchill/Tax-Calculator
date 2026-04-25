"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth/actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await login(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-slate-200/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-center">
            <Logo size="sm" href="/" />
          </div>

          <div className="px-7 py-7">
            <h1 className="text-3xl font-bold text-slate-800">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1">Log in to your TaxFlow account</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-[#188a4b] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-[#188a4b] hover:bg-[#14733f] text-white font-semibold py-2.5 rounded-full transition shadow-sm"
              >
                Log In
              </button>
            </form>

            <p className="text-sm text-slate-500 text-center mt-5">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#188a4b] hover:underline font-semibold">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
