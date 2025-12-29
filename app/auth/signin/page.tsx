"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, AlertCircle, Info } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-6">
              <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="authLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6B2737" stopOpacity={1} />
                    <stop offset="100%" stopColor="#E07A5F" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="38" stroke="url(#authLogoGradient)" strokeWidth="2.5" fill="none"/>
                <circle cx="50" cy="50" r="6" fill="#6B2737"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" opacity="0.9"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#E07A5F" strokeWidth="2.5" fill="none" transform="rotate(60 50 50)" opacity="0.8"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" transform="rotate(120 50 50)" opacity="0.7"/>
              </svg>
              <span className="font-heading text-2xl font-bold text-gray-900">
                clear<span className="text-burgundy-600">M</span>.ai
              </span>
            </div>
          </Link>

          <div>
            <h1 className="font-heading text-4xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>
        </div>

        {/* Sign In Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-danger-800">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-burgundy-600 hover:text-burgundy-500">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </Card>

          <div className="flex items-center justify-between text-sm">
            <Link href="/" className="inline-flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <Link href="/auth/signup" className="font-medium text-burgundy-600 hover:text-burgundy-500">
              Create account
            </Link>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <a href="#" className="font-medium text-coral-600 hover:text-coral-700 transition-colors">Terms</a>
            {" "}and{" "}
            <a href="#" className="font-medium text-coral-600 hover:text-coral-700 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
