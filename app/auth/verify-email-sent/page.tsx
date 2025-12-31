import Link from "next/link";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailSentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-slate-600">
              We've sent a verification link to your email address
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Next Steps
                </h3>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Open the email we just sent you</li>
                  <li>Click the verification link</li>
                  <li>Sign in to your account</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="space-y-3 mb-6">
            <p className="text-xs text-slate-500 text-center">
              Didn't receive the email? Check your spam folder or wait a few minutes.
            </p>
            <p className="text-xs text-slate-500 text-center">
              The verification link expires in 24 hours.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/signin" className="block">
              <Button className="w-full shadow-sm">
                Go to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Resend Link (Future Enhancement) */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Need help?{" "}
              <Link
                href="/auth/resend-verification"
                className="text-[#8B2635] hover:underline font-medium"
              >
                Resend verification email
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            For security reasons, the verification link can only be used once.
          </p>
        </div>
      </div>
    </div>
  );
}
