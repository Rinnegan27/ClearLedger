import Link from "next/link";
import { AlertCircle, Mail, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailRequiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Alert Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Email Verification Required
            </h1>
            <p className="text-slate-600">
              Please verify your email address to access the dashboard
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <Mail className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">
                  Check Your Email
                </h3>
                <p className="text-sm text-slate-600 mb-2">
                  We sent a verification link to your email address when you signed up.
                </p>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Open the verification email</li>
                  <li>Click the verification link</li>
                  <li>Return here and sign in again</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="space-y-3 mb-6">
            <p className="text-xs text-slate-500 text-center">
              Didn't receive the email? Check your spam folder or request a new verification link.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/resend-verification" className="block">
              <Button className="w-full shadow-sm">
                Resend Verification Email
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/api/auth/signout" className="block">
              <Button variant="outline" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </Link>
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already verified?{" "}
              <Link
                href="/auth/signin"
                className="text-[#8B2635] hover:underline font-medium"
              >
                Sign in again
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Having trouble? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
