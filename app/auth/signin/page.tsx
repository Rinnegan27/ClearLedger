"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
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
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to sign in. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center px-4 gradient-bg">
      <div className="max-w-md w-full space-y-8 slide-up">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-6">
              {/* DataCraft Labs Icon in Maroon */}
              <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" stroke="#800020" strokeWidth="3" fill="none"/>
                <circle cx="50" cy="50" r="8" fill="#800020"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(0 50 50)"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(60 50 50)"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(120 50 50)"/>
              </svg>
              <span className="text-2xl font-bold" style={{color: '#401D19'}}>
                clear<span style={{color: '#800020'}}>M</span>.ai
              </span>
            </div>
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>
        </div>

        {/* Sign In Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-red-800">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@company.com"
              />
            </div>

            <div className="p-4 rounded-xl" style={{background: '#FFF9F6', border: '1px solid #FFE8DD'}}>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#FF682C'}} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-1" style={{color: '#401D19'}}>Demo Mode</p>
                  <p className="text-xs" style={{color: '#6B5B52'}}>
                    Enter any email to access the dashboard instantly.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <a href="#" className="font-medium transition-colors" style={{color: '#FF682C'}} onMouseEnter={(e) => e.currentTarget.style.color = '#E65520'} onMouseLeave={(e) => e.currentTarget.style.color = '#FF682C'}>Terms</a>
            {" "}and{" "}
            <a href="#" className="font-medium transition-colors" style={{color: '#FF682C'}} onMouseEnter={(e) => e.currentTarget.style.color = '#E65520'} onMouseLeave={(e) => e.currentTarget.style.color = '#FF682C'}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
