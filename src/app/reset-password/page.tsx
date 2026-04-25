import Link from "next/link";
import { Logo } from "@/components/Logo";
import { resetPasswordWithToken } from "@/lib/auth/actions";

type SearchParamValue = string | string[] | undefined;

function getSingleParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const status = getSingleParam(params.status);
  const token = getSingleParam(params.token)?.trim() ?? "";

  const showSuccess = status === "success";
  const showInvalid = status === "invalid" || (!token && !showSuccess);
  const showExpired = status === "expired";
  const showMissingFields = status === "missing";
  const showTooShort = status === "short";
  const showMismatch = status === "mismatch";
  const showError = status === "error";
  const canSubmitReset = !showSuccess && token.length > 0;

  return (
    <div className="min-h-screen bg-slate-200/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-center">
            <Logo size="sm" href="/" />
          </div>

          <div className="px-7 py-7">
            <h1 className="text-3xl font-bold text-slate-800">Reset password</h1>
            <p className="text-sm text-slate-500 mt-1">Choose a new password for your account.</p>

            {showSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mt-4 text-sm">
                Password reset successful. You can now log in with your new password.
              </div>
            )}
            {showInvalid && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                This reset link is invalid or has already been used.
              </div>
            )}
            {showExpired && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                This reset link has expired. Request a new password reset email.
              </div>
            )}
            {showMissingFields && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                Please enter and confirm your new password.
              </div>
            )}
            {showTooShort && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                New password must be at least 8 characters.
              </div>
            )}
            {showMismatch && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                Password confirmation does not match.
              </div>
            )}
            {showError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                We could not reset your password right now. Please try again shortly.
              </div>
            )}

            {canSubmitReset && (
              <form action={resetPasswordWithToken} className="space-y-4 mt-5">
                <input type="hidden" name="token" value={token} />

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                    placeholder="Create a strong password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                    placeholder="Confirm your new password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#188a4b] hover:bg-[#14733f] text-white font-semibold py-2.5 rounded-full transition shadow-sm"
                >
                  Update password
                </button>
              </form>
            )}

            <div className="text-sm text-slate-500 text-center mt-5 space-y-1">
              <p>
                Need a fresh link?{" "}
                <Link href="/forgot-password" className="text-[#188a4b] hover:underline font-semibold">
                  Request reset email
                </Link>
              </p>
              <p>
                Back to sign in{" "}
                <Link href="/login" className="text-[#188a4b] hover:underline font-semibold">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
