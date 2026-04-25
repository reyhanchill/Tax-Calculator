"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth/actions";
import { Logo } from "@/components/Logo";

const ACCOUNT_TYPES = [
  {
    value: "individual",
    label: "Individual",
    icon: "👤",
    desc: "PAYE / Pension",
    color: "border-blue-500 bg-blue-50 text-blue-700",
  },
  {
    value: "self-employed",
    label: "Self-Employed",
    icon: "🛠️",
    desc: "Sole Trader & Freelancer",
    color: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
  {
    value: "business",
    label: "Business",
    icon: "🏢",
    desc: "Owner & Payroll Hub",
    color: "border-violet-500 bg-violet-50 text-violet-700",
  },
];

function RegisterForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("type") || "individual";

  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState(preselected);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const firstName = String(formData.get("firstName") || "").trim();
    const surname = String(formData.get("surname") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const privacyAccepted = formData.get("privacyAccepted") === "on";
    if (!firstName || !surname) {
      setError("Please enter both first name and surname.");
      return;
    }

    if (!privacyAccepted) {
      setError("Please agree to the privacy policy and age confirmation.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    formData.set("name", `${firstName} ${surname}`.trim());

    formData.set("accountType", accountType);
    const result = await register(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-center">
        <Logo size="sm" href="/" />
      </div>

      <div className="px-7 py-7">
        <h2 className="text-3xl font-bold text-slate-800">Create Your Account</h2>
        <p className="text-sm text-slate-500 mt-1">Start making smarter tax decisions today.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                placeholder="First name"
              />
            </div>
            <div>
              <label htmlFor="surname" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Surname
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                placeholder="Surname"
              />
            </div>
          </div>

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
                minLength={8}
                className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                placeholder="Create a strong password"
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAccountType(type.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    accountType === type.value
                      ? type.color
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm block">{type.icon}</span>
                  <span className="text-[11px] font-semibold block mt-1">{type.label}</span>
                  <span className="text-[9px] block mt-0.5 opacity-80 leading-tight">{type.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-600">
            <input
              id="privacyAccepted"
              name="privacyAccepted"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 text-[#188a4b] border-slate-300 rounded"
            />
            <span>
              I agree to the{" "}
              <Link href="/privacy" className="text-[#188a4b] hover:underline font-medium">
                Privacy Policy
              </Link>{" "}
              and confirm I am 18 or over.
            </span>
          </label>

          <label className="flex items-start gap-2 text-xs text-slate-600">
            <input
              id="gdprConsent"
              name="gdprConsent"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 text-[#188a4b] border-slate-300 rounded"
            />
            <span>I consent to the processing of my data for providing this service (GDPR).</span>
          </label>

          <button
            type="submit"
            className="w-full bg-[#188a4b] hover:bg-[#14733f] text-white font-semibold py-2.5 rounded-full transition shadow-sm"
          >
            Create Account
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-[#188a4b] hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-200/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              Loading...
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
