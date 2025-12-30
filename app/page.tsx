"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6B2737" stopOpacity={1} />
                    <stop offset="100%" stopColor="#E07A5F" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="38" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none"/>
                <circle cx="50" cy="50" r="6" fill="#6B2737"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" opacity="0.9"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#E07A5F" strokeWidth="2.5" fill="none" transform="rotate(60 50 50)" opacity="0.8"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" transform="rotate(120 50 50)" opacity="0.7"/>
              </svg>
              <span className="font-heading font-bold text-gray-900 text-lg tracking-tight">
                clear<span className="text-burgundy-600">m</span>.ai
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button size="xs" variant="outline" className="rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="xs" className="rounded-full shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 bg-coral-50 border border-coral-200 text-coral-700">
            MARKETING ANALYTICS FOR LOCAL BUSINESSES
          </div>

          <h1 className="mb-6 font-heading text-5xl md:text-6xl lg:text-7xl leading-[1.15] font-extrabold text-gray-900 tracking-tight">
            Stop guessing. Start <span className="text-coral-500">knowing</span> what drives revenue.
          </h1>

          <p className="text-lg leading-relaxed mb-10 text-gray-600 max-w-[680px] mx-auto">
            clearm.ai connects your marketing spend to actual revenue—automatically. See which ads bring in customers, track every dollar, and make decisions based on data, not hunches.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/auth/signup">
              <Button size="xs" className="rounded-full shadow-md">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="xs" variant="outline" className="rounded-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 bg-coral-50 border border-coral-200 text-coral-700">
              HOW IT WORKS
            </div>
            <h2 className="font-heading font-bold text-gray-900 text-3xl leading-tight tracking-tight mb-3">
              From scattered data to clear answers in 3 steps
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              No spreadsheets. No manual tracking. Just connect your tools and let clearm.ai do the heavy lifting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-burgundy-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-burgundy-600 flex-shrink-0">
                  <span className="text-sm font-bold text-white">1</span>
                </div>
                <h3 className="font-heading font-bold text-gray-900 text-base leading-tight">
                  Connect Your Platforms
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Link Google Ads, Meta Ads, Shopify, CallRail, and more in minutes. No developer needed.
              </p>

              <div className="space-y-2">
                {[
                  { name: 'Google Ads', logo: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png' },
                  { name: 'Meta Ads', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
                  { name: 'Shopify', logo: 'https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg' },
                  { name: 'CallRail', logo: 'https://asset.brandfetch.io/id7i4WSbDx/id9Z0S1Wpr.png' },
                  { name: 'Calendly', logo: 'https://asset.brandfetch.io/idZuErvMtL/id_vhP1BQw.png' },
                ].map((platform, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center bg-white flex-shrink-0">
                        <img
                          src={platform.logo}
                          alt={platform.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                    </div>
                    <svg className="w-3 h-3 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-burgundy-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-terracotta-500 flex-shrink-0">
                  <span className="text-sm font-bold text-white">2</span>
                </div>
                <h3 className="font-heading font-bold text-gray-900 text-base leading-tight">
                  We Track Everything
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                clearm.ai automatically connects every sale, call, and booking back to the ad that drove it.
              </p>

              <div className="p-4 bg-gradient-to-br from-coral-50 to-burgundy-50 rounded-lg border border-coral-200">
                <svg className="w-10 h-10 mx-auto mb-2" viewBox="0 0 100 100" fill="none">
                  <defs>
                    <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6B2737" stopOpacity={1} />
                      <stop offset="100%" stopColor="#E07A5F" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="38" stroke="url(#centerGradient)" strokeWidth="2.5" fill="none"/>
                  <circle cx="50" cy="50" r="6" fill="#6B2737"/>
                  <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" opacity="0.9"/>
                  <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#E07A5F" strokeWidth="2.5" fill="none" transform="rotate(60 50 50)" opacity="0.8"/>
                  <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" transform="rotate(120 50 50)" opacity="0.7"/>
                </svg>
                <div className="text-center mb-3">
                  <div className="font-heading font-bold text-gray-900 text-sm mb-0.5">clearm.ai</div>
                  <div className="text-xs font-medium text-coral-600">Auto-Attribution Engine</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1.5 px-2 bg-white/70 rounded border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Sales tracked</span>
                    <span className="text-sm font-bold text-gray-900">36</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 bg-white/70 rounded border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Calls tracked</span>
                    <span className="text-sm font-bold text-gray-900">48</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-burgundy-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-success-500 flex-shrink-0">
                  <span className="text-sm font-bold text-white">3</span>
                </div>
                <h3 className="font-heading font-bold text-gray-900 text-base leading-tight">
                  Get Actionable Insights
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                See which campaigns drive revenue, track ROI in real-time, and get AI-powered recommendations.
              </p>

              <div className="space-y-2">
                {[
                  { label: 'ROI Analysis', sublabel: 'Real-time tracking', color: '#E07A5F', bgColor: 'bg-coral-50', borderColor: 'border-coral-100' },
                  { label: 'Revenue Attribution', sublabel: 'Per campaign', color: '#10B981', bgColor: 'bg-success-50', borderColor: 'border-success-100' },
                  { label: 'Action Items', sublabel: 'AI-powered', color: '#6B2737', bgColor: 'bg-burgundy-50', borderColor: 'border-burgundy-100' },
                  { label: 'Cost Per Booking', sublabel: 'Optimize spend', color: '#C67B5C', bgColor: 'bg-terracotta-50', borderColor: 'border-terracotta-100' },
                  { label: 'Channel Performance', sublabel: 'Cross-platform', color: '#F59E0B', bgColor: 'bg-warning-50', borderColor: 'border-warning-100' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between py-1.5 px-2 ${item.bgColor} rounded border ${item.borderColor}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.sublabel}</div>
                      </div>
                    </div>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete View Section */}
      <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-gray-900 text-3xl leading-tight tracking-tight mb-2">
              A complete view of your marketing performance
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Connect your tools. See what works. Make better decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Cost per booking */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-burgundy-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-md bg-coral-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading text-base font-bold text-gray-900">Cost per booking</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                See exactly how much you spend to get each customer and optimize your acquisition costs across all channels.
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-600">This Month</span>
                  <span className="text-xs font-semibold text-success-600">↓ 8.2%</span>
                </div>
                <div className="py-1">
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">$347.22</div>
                  <div className="text-xs text-gray-500">Average per booking</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <div className="text-xs text-gray-500 mb-0.5">Best channel</div>
                    <div className="text-sm font-semibold text-gray-900">$295</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded border border-gray-100">
                    <div className="text-xs text-gray-500 mb-0.5">Worst channel</div>
                    <div className="text-sm font-semibold text-gray-900">$425</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel performance */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-burgundy-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-md bg-coral-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-heading text-base font-bold text-gray-900">Channel performance</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Track Google Ads, Meta, organic and referrals with real ROI numbers across all your marketing channels.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 px-2 bg-coral-50 rounded border border-coral-100">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500"></span>
                    <span className="text-sm font-medium text-gray-700">Google Ads</span>
                  </div>
                  <span className="text-sm font-bold text-coral-600">260% ROI</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 bg-success-50 rounded border border-success-100">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span>
                    <span className="text-sm font-medium text-gray-700">Meta Ads</span>
                  </div>
                  <span className="text-sm font-bold text-success-600">314% ROI</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 bg-warning-50 rounded border border-warning-100">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning-500"></span>
                    <span className="text-sm font-medium text-gray-700">Organic</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">∞ ROI</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 bg-terracotta-50 rounded border border-terracotta-100">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500"></span>
                    <span className="text-sm font-medium text-gray-700">Referrals</span>
                  </div>
                  <span className="text-sm font-bold text-terracotta-600">430% ROI</span>
                </div>
              </div>
            </div>

            {/* Missed call tracking */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-burgundy-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-md bg-coral-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-heading text-base font-bold text-gray-900">Missed call tracking</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                See exactly how much revenue you&apos;re losing from missed calls and take immediate action to fix coverage gaps.
              </p>
              <div className="space-y-2.5">
                <div className="px-2.5 py-2 bg-danger-50 border border-danger-200 rounded flex items-center justify-between">
                  <span className="text-xs font-semibold text-danger-700">🔴 Active Alert</span>
                  <span className="text-xs font-bold text-danger-700">12 missed today</span>
                </div>
                <div className="py-1">
                  <div className="text-2xl font-bold text-danger-600 mb-0.5">$6,000</div>
                  <div className="text-xs text-gray-500">Estimated lost revenue today</div>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs py-1 px-2 bg-gray-50 rounded">
                    <span className="text-gray-600">2:45 PM - Incoming call</span>
                    <span className="font-semibold text-danger-600">-$500</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 px-2 bg-gray-50 rounded">
                    <span className="text-gray-600">1:32 PM - Incoming call</span>
                    <span className="font-semibold text-danger-600">-$500</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 px-2 bg-gray-50 rounded">
                    <span className="text-gray-600">12:18 PM - Incoming call</span>
                    <span className="font-semibold text-danger-600">-$500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-white to-burgundy-50/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-gray-900 text-4xl leading-tight tracking-tight mb-5">
            Ready to understand your marketing better?
          </h2>
          <p className="mb-10 text-gray-600 text-lg leading-relaxed">
            Join local businesses using clearm.ai to make better decisions.
          </p>
          <Link href="/auth/signup">
            <Button size="xs" className="rounded-full shadow-md">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <svg className="w-9 h-9" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6B2737" stopOpacity={1} />
                    <stop offset="100%" stopColor="#E07A5F" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="38" stroke="url(#footerGradient)" strokeWidth="2.5" fill="none"/>
                <circle cx="50" cy="50" r="6" fill="#6B2737"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" opacity="0.9"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#E07A5F" strokeWidth="2.5" fill="none" transform="rotate(60 50 50)" opacity="0.8"/>
                <ellipse cx="50" cy="50" rx="32" ry="14" stroke="#6B2737" strokeWidth="2.5" fill="none" transform="rotate(120 50 50)" opacity="0.7"/>
              </svg>
              <span className="font-heading font-bold text-gray-900 text-lg tracking-tight">
                clear<span className="text-burgundy-600">m</span>.ai
              </span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 clearm.ai. Built for owner-operators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
