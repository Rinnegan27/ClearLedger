"use client";

import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Check, ArrowRight } from "lucide-react";

const marketingIntegrations = [
  {
    name: "Google Ads",
    description: "Connect your Google Ads account to track campaign performance and ad spend",
    logo: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    status: "connected",
    stats: { spend: "$5,000", bookings: 15 }
  },
  {
    name: "Meta Ads",
    description: "Track Facebook and Instagram ad campaigns",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    status: "connected",
    stats: { spend: "$3,500", bookings: 12 }
  },
  {
    name: "LinkedIn Ads",
    description: "Monitor B2B advertising campaigns and lead generation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
    status: "available"
  },
  {
    name: "TikTok Ads",
    description: "Track viral campaigns and engagement metrics",
    logo: "https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon2.png",
    status: "available"
  },
  {
    name: "Twitter Ads",
    description: "Monitor promoted tweets and campaigns",
    logo: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
    status: "available"
  },
  {
    name: "Snapchat Ads",
    description: "Track Story ads and snap campaigns",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg",
    status: "available"
  }
];

const salesIntegrations = [
  {
    name: "CallRail",
    description: "Track phone calls, SMS, and form submissions",
    logo: "https://asset.brandfetch.io/id7i4WSbDx/id9Z0S1Wpr.png",
    status: "connected",
    stats: { calls: 48, missed: 12 }
  },
  {
    name: "Calendly",
    description: "Sync booking data and meeting conversions",
    logo: "https://asset.brandfetch.io/idZuErvMtL/id_vhP1BQw.png",
    status: "connected",
    stats: { bookings: 36 }
  },
  {
    name: "Shopify",
    description: "Connect your e-commerce store to track sales",
    logo: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg",
    status: "connected",
    stats: { revenue: "$45,000" }
  },
  {
    name: "HubSpot",
    description: "Sync CRM data, deals, and customer interactions",
    logo: "https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png",
    status: "available"
  },
  {
    name: "Salesforce",
    description: "Connect enterprise CRM for sales pipeline visibility",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    status: "available"
  },
  {
    name: "Stripe",
    description: "Track payments, subscriptions, and revenue",
    logo: "https://images.ctfassets.net/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082",
    status: "available"
  },
  {
    name: "Zoom",
    description: "Track video meetings and webinar attendance",
    logo: "https://st1.zoom.us/fe-static/fe-checkout/img/components/logo_zoom_2x-1a82f0e4b5.png",
    status: "available"
  },
  {
    name: "Intercom",
    description: "Monitor customer conversations and support",
    logo: "https://brand.intercom.com/content/dam/intercom-brand/brand-assets/logos/logos-0a1c4d20-45c0-4a3e-a14a-78cf2f41ac03/4.%20Intercom%20Symbol/For%20light%20backgrounds/Color_Intercom%20Symbol_RGB_For%20light%20backgrounds.svg",
    status: "available"
  }
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen" style={{background: '#FAFAFA'}}>
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{color: '#401D19'}}>Integrations</h1>
          <p className="text-base" style={{color: '#6B5B52'}}>Connect your marketing and sales tools to get a complete view</p>
        </div>

        {/* Marketing Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1" style={{color: '#401D19'}}>Marketing Platforms</h2>
            <p className="text-sm" style={{color: '#6B5B52'}}>Advertising and campaign tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {marketingIntegrations.map((integration, index) => (
              <IntegrationCard
                key={integration.name}
                integration={integration}
                isFirst={index === 0}
                isLast={index === marketingIntegrations.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Sales Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1" style={{color: '#401D19'}}>Sales & CRM</h2>
            <p className="text-sm" style={{color: '#6B5B52'}}>Customer relationship and sales tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {salesIntegrations.map((integration, index) => (
              <IntegrationCard
                key={integration.name}
                integration={integration}
                isFirst={index === 0}
                isLast={index === salesIntegrations.length - 1}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function IntegrationCard({ integration, isFirst, isLast }: { integration: any; isFirst?: boolean; isLast?: boolean }) {
  const isConnected = integration.status === "connected";
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine border styling for touching cards
  const borderStyle = {
    borderTop: '1px solid #E5E5E5',
    borderBottom: '1px solid #E5E5E5',
    borderLeft: '1px solid #E5E5E5',
    borderRight: isLast ? '1px solid #E5E5E5' : 'none'
  };

  // Background color based on state
  const getBackgroundColor = () => {
    if (isHovered) return isConnected ? '#FFF4ED' : '#F9F9F9';
    return isConnected ? '#FFF9F6' : 'white';
  };

  return (
    <div
      className="p-5 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg overflow-hidden relative"
      style={{
        ...borderStyle,
        background: getBackgroundColor()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top accent bar for connected integrations */}
      {isConnected && (
        <div className="absolute top-0 left-0 right-0 h-1" style={{background: '#FF682C'}}></div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-2 flex-shrink-0" style={{border: '1px solid #E5E5E5'}}>
          <img
            src={integration.logo}
            alt={integration.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="text-xs font-bold" style="color: #6B5B52;">${integration.name.substring(0, 2)}</div>`;
              }
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base" style={{color: '#401D19'}}>{integration.name}</h3>
          {isConnected && (
            <div className="flex items-center gap-1 mt-1">
              <Check className="w-3 h-3" style={{color: '#10B981'}} />
              <span className="text-xs font-semibold" style={{color: '#10B981'}}>Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm mb-4 leading-relaxed" style={{color: '#6B5B52'}}>
        {integration.description}
      </p>

      {/* Stats with enhanced visuals */}
      {isConnected && integration.stats && (
        <div className="mb-4 pb-4" style={{borderBottom: '1px solid #F0F0F0'}}>
          <div className="grid grid-cols-2 gap-3">
            {integration.stats.spend && (
              <div className="p-2 rounded" style={{background: '#FAFAFA'}}>
                <div className="text-xs mb-1 font-semibold" style={{color: '#8C7B72'}}>Spend</div>
                <div className="font-bold text-base" style={{color: '#FF682C'}}>{integration.stats.spend}</div>
              </div>
            )}
            {integration.stats.bookings && (
              <div className="p-2 rounded" style={{background: '#FAFAFA'}}>
                <div className="text-xs mb-1 font-semibold" style={{color: '#8C7B72'}}>Bookings</div>
                <div className="font-bold text-base" style={{color: '#10B981'}}>{integration.stats.bookings}</div>
              </div>
            )}
            {integration.stats.calls && (
              <div className="p-2 rounded" style={{background: '#FAFAFA'}}>
                <div className="text-xs mb-1 font-semibold" style={{color: '#8C7B72'}}>Calls</div>
                <div className="font-bold text-base" style={{color: '#401D19'}}>{integration.stats.calls}</div>
              </div>
            )}
            {integration.stats.revenue && (
              <div className="p-2 rounded col-span-2" style={{background: '#FAFAFA'}}>
                <div className="text-xs mb-1 font-semibold" style={{color: '#8C7B72'}}>Revenue</div>
                <div className="font-bold text-xl" style={{color: '#10B981'}}>{integration.stats.revenue}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div>
        {isConnected ? (
          <button className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-gray-100" style={{background: 'white', border: '1px solid #E5E5E5', color: '#401D19'}}>
            Manage Integration
          </button>
        ) : (
          <button className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md flex items-center justify-center gap-2" style={{background: '#FF682C'}}>
            <span>Connect Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
