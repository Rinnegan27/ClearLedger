import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{background: '#F5F3F1'}}>
      {/* Header - Minimal */}
      <header className="bg-white border-b" style={{borderColor: '#E8E4E0'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* DataCraft Labs Icon in Maroon */}
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" stroke="#800020" strokeWidth="3" fill="none"/>
                <circle cx="50" cy="50" r="8" fill="#800020"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(0 50 50)"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(60 50 50)"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(120 50 50)"/>
              </svg>
              <span className="text-lg font-bold" style={{color: '#401D19'}}>
                clear<span style={{color: '#800020'}}>M</span>.ai
              </span>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
              style={{background: '#401D19'}}
            >
              Contact us
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Two Column Layout */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text */}
            <div className="fade-in">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-8" style={{background: '#F5F3F1', border: '1px solid #E8E4E0', color: '#401D19'}}>
                Success
              </div>

              <h1 className="mb-8" style={{fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: '1.1', color: '#401D19'}}>
                <span style={{color: '#8C7B72'}}>Grow smarter,</span> with the right data and the right tools.
              </h1>

              <p className="text-lg leading-relaxed mb-10" style={{color: '#6B5B52', maxWidth: '540px'}}>
                clearM.ai gives you a crystal-clear view of your marketing performance. See exactly what's working, what's not, and what to do next—all in one simple dashboard.
              </p>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
                style={{background: '#401D19'}}
              >
                Work together
              </Link>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="fade-in-1 relative">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 relative" style={{border: '1px solid #E8E4E0'}}>
                {/* Top Stats Row */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Left Stat */}
                  <div>
                    <div className="text-xs font-semibold mb-2" style={{color: '#8C7B72'}}>
                      Total users
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <div className="text-4xl font-bold" style={{color: '#401D19'}}>24,532</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{color: '#10B981'}}>
                      <TrendingUp className="w-3 h-3" />
                      <span>12.5%</span>
                      <span style={{color: '#B3A8A0'}}>vs last month</span>
                    </div>
                  </div>

                  {/* Right Stat */}
                  <div>
                    <div className="text-xs font-semibold mb-2" style={{color: '#8C7B72'}}>
                      Engagement from:
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full overflow-hidden" style={{background: '#E8E4E0'}}>
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{color: '#6B5B52'}}>
                          FB
                        </div>
                      </div>
                      <div className="text-sm font-semibold" style={{color: '#401D19'}}>Flavie B.</div>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="relative h-48">
                  {/* Simple line chart representation */}
                  <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: '#FF682C', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#E65520', stopOpacity: 1}} />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 80 Q 50 70, 100 75 T 200 60 Q 250 55, 300 65 T 400 50"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs" style={{color: '#B3A8A0'}}>
                    <span>Jan 10</span>
                    <span>Jan 15</span>
                    <span>Jan 20</span>
                    <span>Jan 25</span>
                    <span>Jan 30</span>
                  </div>
                </div>

                {/* Sessions Card Overlay */}
                <div className="absolute top-32 right-8 bg-white rounded-xl shadow-lg p-4" style={{border: '1px solid #E8E4E0', minWidth: '180px'}}>
                  <div className="text-xs font-semibold mb-1" style={{color: '#8C7B72'}}>
                    Active sessions
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-bold" style={{color: '#401D19'}}>1,482</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{color: '#10B981'}}>
                    <TrendingUp className="w-3 h-3" />
                    <span>8.2%</span>
                    <span style={{color: '#B3A8A0'}}>vs last month</span>
                  </div>
                </div>
              </div>

              {/* User Avatar Overlay */}
              <div className="absolute -bottom-4 right-12 flex items-center gap-2 bg-white rounded-full shadow-lg px-3 py-2" style={{border: '1px solid #E8E4E0'}}>
                <div className="w-8 h-8 rounded-full overflow-hidden" style={{background: '#E8E4E0'}}>
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{color: '#6B5B52'}}>
                    MT
                  </div>
                </div>
                <div className="text-sm font-semibold pr-2" style={{color: '#401D19'}}>Mathieu T.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - With Visual Content */}
      <section className="py-20" style={{background: '#FAFAFA'}}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mb-4" style={{fontSize: '2.5rem', fontWeight: '700', color: '#401D19', lineHeight: '1.2'}}>
              A complete view of your<br />marketing performance
            </h2>
            <p className="text-lg" style={{color: '#6B5B52', maxWidth: '600px', margin: '0 auto'}}>
              Connect your tools. See what works. Make better decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-0">
            {/* Cost per booking */}
            <div className="bg-white overflow-hidden transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg" style={{borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5'}}>
              <div className="p-6 pb-4">
                <div className="w-10 h-10 rounded mb-4 flex items-center justify-center" style={{background: '#FF682C'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{color: '#401D19'}}>
                  Cost per booking
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{color: '#6B5B52'}}>
                  See exactly how much you spend to get each customer and optimize your acquisition costs.
                </p>
              </div>

              {/* Detailed visual mockup - Dashboard interface */}
              <div className="px-6 pb-6">
                <div className="rounded-lg overflow-hidden" style={{background: '#FAFAFA', border: '1px solid #E5E5E5'}}>
                  {/* Header */}
                  <div className="p-3 flex items-center justify-between" style={{borderBottom: '1px solid #E5E5E5'}}>
                    <div className="text-xs font-semibold" style={{color: '#6B5B52'}}>Cost Analysis</div>
                    <div className="text-xs font-semibold" style={{color: '#10B981'}}>↓ 8%</div>
                  </div>

                  {/* Main metric */}
                  <div className="p-4 bg-white">
                    <div className="text-3xl font-bold mb-1" style={{color: '#401D19'}}>$347.22</div>
                    <div className="text-xs" style={{color: '#8C7B72'}}>Average cost per booking</div>
                  </div>

                  {/* Breakdown */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{color: '#6B5B52'}}>Google Ads</span>
                      <span className="font-bold" style={{color: '#401D19'}}>$333.33</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{color: '#6B5B52'}}>Meta Ads</span>
                      <span className="font-bold" style={{color: '#401D19'}}>$291.67</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{color: '#6B5B52'}}>Referrals</span>
                      <span className="font-bold" style={{color: '#401D19'}}>$333.33</span>
                    </div>
                  </div>

                  {/* Mini chart */}
                  <div className="px-3 pb-3">
                    <svg className="w-full h-12" viewBox="0 0 200 40" preserveAspectRatio="none">
                      <path
                        d="M 0 30 L 40 25 L 80 28 L 120 20 L 160 22 L 200 18"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel performance */}
            <div className="bg-white overflow-hidden transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg" style={{borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5', borderLeft: '1px solid #E5E5E5'}}>
              <div className="p-6 pb-4">
                <div className="w-10 h-10 rounded mb-4 flex items-center justify-center" style={{background: '#FF682C'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{color: '#401D19'}}>
                  Channel performance
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{color: '#6B5B52'}}>
                  Track Google Ads, Meta, organic and referrals with real ROI numbers across all channels.
                </p>
              </div>

              {/* Detailed table-style mockup */}
              <div className="px-6 pb-6">
                <div className="rounded-lg overflow-hidden" style={{background: '#FAFAFA', border: '1px solid #E5E5E5'}}>
                  {/* Table header */}
                  <div className="grid grid-cols-3 gap-2 p-3 text-xs font-bold" style={{background: '#F5F5F5', borderBottom: '1px solid #E5E5E5', color: '#6B5B52'}}>
                    <div>Channel</div>
                    <div className="text-right">Spend</div>
                    <div className="text-right">ROI</div>
                  </div>

                  {/* Table rows */}
                  <div className="bg-white">
                    {[
                      { name: 'Google Ads', spend: '$5,000', roi: '260%', color: '#FF682C', badge: 'Top' },
                      { name: 'Meta Ads', spend: '$3,500', roi: '314%', color: '#10B981', badge: 'Best' },
                      { name: 'Organic', spend: '$0', roi: '∞', color: '#F59E0B', badge: '' },
                      { name: 'Referral', spend: '$1,000', roi: '430%', color: '#401D19', badge: '' }
                    ].map((channel, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 px-3 py-2.5 text-xs items-center" style={{borderBottom: i < 3 ? '1px solid #F5F5F5' : 'none'}}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: channel.color}}></div>
                          <span className="font-medium truncate" style={{color: '#401D19'}}>{channel.name}</span>
                          {channel.badge && (
                            <span className="text-[9px] px-1 py-0.5 rounded" style={{background: '#FEF3E8', color: '#FF682C'}}>{channel.badge}</span>
                          )}
                        </div>
                        <div className="text-right font-semibold" style={{color: '#401D19'}}>{channel.spend}</div>
                        <div className="text-right font-bold" style={{color: channel.color}}>{channel.roi}</div>
                      </div>
                    ))}
                  </div>

                  {/* Summary footer */}
                  <div className="p-3 flex items-center justify-between text-xs" style={{background: '#F8F8F8', borderTop: '1px solid #E5E5E5'}}>
                    <span className="font-semibold" style={{color: '#6B5B52'}}>Total Spend</span>
                    <span className="font-bold" style={{color: '#401D19'}}>$9,500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Missed call tracking */}
            <div className="bg-white overflow-hidden transition-all duration-200 cursor-pointer hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg" style={{border: '1px solid #E5E5E5'}}>
              <div className="p-6 pb-4">
                <div className="w-10 h-10 rounded mb-4 flex items-center justify-center" style={{background: '#FF682C'}}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{color: '#401D19'}}>
                  Missed call tracking
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{color: '#6B5B52'}}>
                  See exactly how much revenue you're losing from missed calls and take action.
                </p>
              </div>

              {/* Alert-style detailed mockup */}
              <div className="px-6 pb-6">
                <div className="rounded-lg overflow-hidden" style={{background: '#FEF2F2', border: '1px solid #FEE2E2'}}>
                  {/* Alert header */}
                  <div className="p-3 flex items-center justify-between" style={{background: '#FEE2E2'}}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background: '#EF4444'}}></div>
                      <div className="text-xs font-bold" style={{color: '#E65520'}}>Active Alert</div>
                    </div>
                    <div className="text-xs font-semibold" style={{color: '#EF4444'}}>12 missed</div>
                  </div>

                  {/* Main alert content */}
                  <div className="p-4 bg-white">
                    <div className="text-3xl font-bold mb-1" style={{color: '#EF4444'}}>$6,000</div>
                    <div className="text-xs mb-3" style={{color: '#E65520'}}>Estimated lost revenue today</div>

                    {/* Call list */}
                    <div className="space-y-1.5 mb-3">
                      {[
                        { time: '2:45 PM', value: '$500' },
                        { time: '1:32 PM', value: '$500' },
                        { time: '11:18 AM', value: '$500' }
                      ].map((call, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded" style={{background: '#FEF2F2'}}>
                          <span style={{color: '#6B5B52'}}>{call.time}</span>
                          <span className="font-bold" style={{color: '#EF4444'}}>{call.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action button mockup */}
                    <div className="text-center p-2 rounded text-xs font-semibold text-white" style={{background: '#EF4444'}}>
                      View All Missed Calls
                    </div>
                  </div>

                  {/* Stats footer */}
                  <div className="px-3 py-2 flex items-center justify-between text-xs" style={{borderTop: '1px solid #FEE2E2'}}>
                    <span style={{color: '#E65520'}}>This week: 48 calls</span>
                    <span className="font-bold" style={{color: '#EF4444'}}>↑ 25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Statsig Style */}
      <section className="py-24" style={{background: '#F5F5F5'}}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="mb-4" style={{fontSize: '2.25rem', fontWeight: '700', color: '#401D19', lineHeight: '1.2'}}>
            Ready to understand<br />your marketing better?
          </h2>
          <p className="text-lg mb-10" style={{color: '#6B5B52'}}>
            Join local businesses using ClearLedger to make better decisions.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{background: '#401D19'}}
          >
            Start free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12" style={{borderColor: '#E8E4E0'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" stroke="#800020" strokeWidth="3" fill="none"/>
                <circle cx="50" cy="50" r="8" fill="#800020"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(0 50 50)"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(60 50 50)"/>
                <ellipse cx="50" cy="50" rx="35" ry="15" stroke="#800020" strokeWidth="3" fill="none" transform="rotate(120 50 50)"/>
              </svg>
              <span className="text-lg font-bold" style={{color: '#401D19'}}>
                clear<span style={{color: '#800020'}}>M</span>.ai
              </span>
            </div>
            <div className="text-sm" style={{color: '#8C7B72'}}>
              © 2025 clearM.ai. Built for owner-operators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
