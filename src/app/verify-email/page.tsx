import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { resendVerificationEmail, verifyEmailToken } from "@/lib/auth/actions";

type SearchParamValue = string | string[] | undefined;

function getSingleParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const token = getSingleParam(params.token)?.trim();
  const email = getSingleParam(params.email)?.trim().toLowerCase();
  const verified = getSingleParam(params.verified);
  const resent = getSingleParam(params.resent);
  const delivery = getSingleParam(params.delivery);

  let tokenError = "";
  if (token) {
    const result = await verifyEmailToken(token);
    if (result.success) {
      const status = result.alreadyVerified ? "already" : "success";
      const emailQuery = result.email ? `&email=${encodeURIComponent(result.email)}` : "";
      redirect(`/verify-email?verified=${status}${emailQuery}`);
    }
    tokenError = result.error || "This verification link is invalid.";
  }

  const showVerifiedSuccess = verified === "success";
  const showAlreadyVerified = verified === "already";
  const showResendSuccess = resent === "sent";
  const showResendError = resent === "error";
  const showResendInvalid = resent === "invalid";
  const showResendSkipped = resent === "skipped";
  const showSignupDeliverySkipped = delivery === "skipped";
  const showSignupDeliveryError = delivery === "error";

  return (
    <div className="min-h-screen bg-slate-200/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-center">
            <Logo size="sm" link={false} />
          </div>

          <div className="px-7 py-7">
            <h1 className="text-3xl font-bold text-slate-800">Verify your email</h1>
            <p className="text-sm text-slate-500 mt-1">
              Confirm your inbox to activate your account and log in securely.
            </p>

            {tokenError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                {tokenError}
              </div>
            )}

            {showVerifiedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mt-4 text-sm">
                Your email has been verified. You can now log in.
              </div>
            )}

            {showAlreadyVerified && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mt-4 text-sm">
                This email is already verified. You can log in now.
              </div>
            )}

            {showResendSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mt-4 text-sm">
                If an account exists and is unverified, we sent a new verification email.
              </div>
            )}

            {showSignupDeliverySkipped && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mt-4 text-sm">
                Your account was created, but email delivery is not configured in this environment yet.
                Configure SMTP to send real verification emails.
              </div>
            )}

            {showSignupDeliveryError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                Your account was created, but the verification email could not be sent right now. Please
                use resend below.
              </div>
            )}

            {showResendError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                We could not send a new verification email right now. Please try again shortly.
              </div>
            )}

            {showResendSkipped && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mt-4 text-sm">
                Email delivery is not configured in this environment yet. Configure SMTP to send real
                verification emails.
              </div>
            )}

            {showResendInvalid && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-4 text-sm">
                Enter a valid email address to resend a verification link.
              </div>
            )}

            {!showVerifiedSuccess && !showAlreadyVerified && (
              <>
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  A verification link is required before login. Check your inbox and spam folder for the
                  latest verification email.
                </div>

                <form action={resendVerificationEmail} className="space-y-3 mt-5">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Didn’t receive the email?
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={email || ""}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#188a4b]/20 focus:border-[#188a4b] outline-none transition text-slate-800"
                    placeholder="you@example.com"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#188a4b] hover:bg-[#14733f] text-white font-semibold py-2.5 rounded-full transition shadow-sm"
                  >
                    Resend verification email
                  </button>
                </form>
              </>
            )}

            <div className="text-sm text-slate-500 text-center mt-6 space-y-1">
              <p>
                Ready to continue?{" "}
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
