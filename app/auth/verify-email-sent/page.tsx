import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailSentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-6">
            <Mail className="h-8 w-8 text-success-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check your email
          </h2>

          <p className="text-gray-600 mb-6">
            We&apos;ve sent a verification link to your email address. Please click the link to verify your account and complete the signup process.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Didn&apos;t receive the email?</strong>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Check your spam folder or wait a few minutes. The email should arrive shortly.
            </p>
          </div>

          <Link href="/auth/signin">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
