import Link from "next/link";
import { Logo } from "@/components/Logo";
import { requestPasswordReset } from "@/lib/auth/actions";

type SearchParamValue = string | string[] | undefined;

function getSingleParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const status = getSingleParam(params.status);
  const showInvalidEmail = status === "invalid";
  const showSent = status === "sent";
  const showSkipped = status === "skipped";
  const showError = status === "error";

  return (
    <div className="min-h-screen bg-slate-200/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-center">
            <Logo size="sm" href="/" />
          </div>

          <div className="px-7 py-7">
            <h1 className="text-3xl font-bold text-slate-800">Forgot your password?</h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter your account email and we&apos;ll send a password reset link.
            </p>

            {showSent && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mt-4 text-sm">
                If an account exists for that email, a reset link has been sent.
              </div>
            )}
            {showSkipped && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mt-4 text-sm">
                Email delivery is not configured in this environment yet. Configure SMTP to send
                real reset emails.
              </div>
            )}
            {showInvalidEmail && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                Enter a valid email address.
              </div>
            )}
            {showError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                We could not process this request right now. Please try again shortly.
              </div>
            )}

            <form action={requestPasswordReset} className="space-y-4 mt-5">
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

              <button
                type="submit"
                className="w-full bg-[#188a4b] hover:bg-[#14733f] text-white font-semibold py-2.5 rounded-full transition shadow-sm"
              >
                Send reset link
              </button>
            </form>

            <div className="text-sm text-slate-500 text-center mt-5 space-y-1">
              <p>
                Remembered your password?{" "}
                <Link href="/login" className="text-[#188a4b] hover:underline font-semibold">
                  Log in
                </Link>
              </p>
              <p>
                Need an account?{" "}
                <Link href="/register" className="text-[#188a4b] hover:underline font-semibold">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
