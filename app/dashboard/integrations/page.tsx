"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Check, ArrowRight, AlertCircle, CheckCircle2, X, RefreshCw, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const marketingIntegrations = [
  {
    name: "Google Ads",
    description: "Connect your Google Ads account to track campaign performance and ad spend",
    logo: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    status: "available"
  },
  {
    name: "Meta Ads",
    description: "Track Facebook and Instagram ad campaigns",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    status: "available"
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
    status: "available"
  },
  {
    name: "Calendly",
    description: "Sync booking data and meeting conversions",
    logo: "https://asset.brandfetch.io/idZuErvMtL/id_vhP1BQw.png",
    status: "available"
  },
  {
    name: "Shopify",
    description: "Connect your e-commerce store to track sales",
    logo: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg",
    status: "available"
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
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const platform = searchParams.get('platform');

    if (error) {
      let message = 'An error occurred';
      if (error === 'not_configured') {
        message = `${platform?.toUpperCase()} integration is not configured. Please add API credentials to your .env file.`;
      } else if (error === 'missing_shop_domain') {
        message = 'Please provide your Shopify store domain.';
      } else if (error === 'oauth_failed') {
        message = 'Authentication failed. Please try again.';
      } else {
        message = `Error: ${error}`;
      }
      setNotification({ type: 'error', message });
    } else if (success) {
      setNotification({ type: 'success', message: `Successfully connected ${success.toUpperCase()}!` });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Banner */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-success-50 border border-success-200'
              : 'bg-danger-50 border border-danger-200'
          }`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-success-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-danger-600" />
              )}
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-success-900' : 'text-danger-900'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-2xl font-bold mb-1.5 text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-600">Connect your marketing and sales tools to get a complete view</p>
        </div>

        {/* Marketing Section */}
        <div className="mb-10">
          <div className="mb-5">
            <h2 className="font-heading text-lg font-bold mb-1 text-gray-900">Marketing Platforms</h2>
            <p className="text-xs text-gray-600">Advertising and campaign tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {marketingIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.name}
                integration={integration}
              />
            ))}
          </div>
        </div>

        {/* Sales Section */}
        <div>
          <div className="mb-5">
            <h2 className="font-heading text-lg font-bold mb-1 text-gray-900">Sales & CRM</h2>
            <p className="text-xs text-gray-600">Customer relationship and sales tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {salesIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.name}
                integration={integration}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function IntegrationCard({ integration }: { integration: any }) {
  const isConnected = integration.status === "connected";
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Fetch integration status
  const { data: integrationData } = useSWR(
    isConnected ? '/api/integrations/status' : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const handleSync = async () => {
    const integrationSlug = integration.name.toLowerCase().replace(/\s+/g, '-');

    // Map to sync endpoints
    const syncEndpoints: Record<string, string> = {
      'google-ads': '/api/integrations/google/sync',
      'meta-ads': '/api/integrations/meta/sync',
    };

    const endpoint = syncEndpoints[integrationSlug];
    if (!endpoint) {
      alert('Sync not available for this integration yet');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      alert(`✓ Successfully synced ${data.recordsSynced} records!`);
      setLastSyncTime(new Date().toISOString());
    } catch (error: any) {
      setSyncError(error.message);
      alert(`✗ Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnect = () => {
    const integrationSlug = integration.name.toLowerCase().replace(/\s+/g, '-');

    // Map integration names to their OAuth endpoints
    const integrationMap: Record<string, string> = {
      'google-ads': '/api/integrations/google',
      'meta-ads': '/api/integrations/meta',
      'shopify': '/api/integrations/shopify',
    };

    // Special handling for Shopify - need to prompt for shop domain
    if (integrationSlug === 'shopify') {
      const shopDomain = prompt('Enter your Shopify store domain (e.g., mystore.myshopify.com):');
      if (shopDomain) {
        window.location.href = `/api/integrations/shopify?shop=${shopDomain}`;
      }
      return;
    }

    // Redirect to OAuth flow
    const endpoint = integrationMap[integrationSlug];
    if (endpoint) {
      window.location.href = endpoint;
    } else {
      alert(`Integration for ${integration.name} is coming soon!`);
    }
  };

  const handleManage = () => {
    // TODO: Implement management modal/page
    // For now, show options
    const action = confirm(
      `Manage ${integration.name} integration:\n\n` +
      `• View connection details\n` +
      `• Refresh access token\n` +
      `• Disconnect integration\n\n` +
      `Click OK to disconnect, or Cancel to go back.`
    );

    if (action) {
      // User chose to disconnect
      const confirmDisconnect = confirm(
        `Are you sure you want to disconnect ${integration.name}?\n\n` +
        `This will stop syncing data from this platform.`
      );

      if (confirmDisconnect) {
        // TODO: Implement actual disconnect API call
        alert(`${integration.name} has been disconnected. (Demo mode - no actual disconnection)`);
        // In production: make API call to delete integration tokens
        // window.location.reload();
      }
    }
  };

  return (
    <Card
      className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
      accent={isConnected}
    >
      <div className={`p-5 ${isConnected ? 'bg-burgundy-50/30' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2 flex-shrink-0">
            <img
              src={integration.logo}
              alt={integration.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="text-xs font-bold text-gray-600">${integration.name.substring(0, 2)}</div>`;
                }
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-base text-gray-900">{integration.name}</h3>
            {isConnected && (
              <Badge variant="success" size="sm" className="mt-1 gap-1">
                <Check className="w-3 h-3" />
                Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-4 leading-relaxed text-gray-600">
          {integration.description}
        </p>

        {/* Stats */}
        {isConnected && integration.stats && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              {integration.stats.spend && (
                <div className="p-2 rounded-lg bg-white/70">
                  <div className="text-xs mb-1 font-semibold text-gray-500">Spend</div>
                  <div className="font-bold text-base text-coral-600">{integration.stats.spend}</div>
                </div>
              )}
              {integration.stats.bookings && (
                <div className="p-2 rounded-lg bg-white/70">
                  <div className="text-xs mb-1 font-semibold text-gray-500">Bookings</div>
                  <div className="font-bold text-base text-success-600">{integration.stats.bookings}</div>
                </div>
              )}
              {integration.stats.calls && (
                <div className="p-2 rounded-lg bg-white/70">
                  <div className="text-xs mb-1 font-semibold text-gray-500">Calls</div>
                  <div className="font-bold text-base text-gray-900">{integration.stats.calls}</div>
                </div>
              )}
              {integration.stats.missed && (
                <div className="p-2 rounded-lg bg-white/70">
                  <div className="text-xs mb-1 font-semibold text-gray-500">Missed</div>
                  <div className="font-bold text-base text-danger-600">{integration.stats.missed}</div>
                </div>
              )}
              {integration.stats.revenue && (
                <div className="p-2 rounded-lg bg-white/70 col-span-2">
                  <div className="text-xs mb-1 font-semibold text-gray-500">Revenue</div>
                  <div className="font-bold text-xl text-success-600">{integration.stats.revenue}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sync Status */}
        {isConnected && (
          <div className="mb-4 p-3 rounded-lg bg-white/70 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600">Last Sync</span>
              </div>
              <span className="text-xs text-gray-700">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}
              </span>
            </div>
            {syncError && (
              <p className="text-xs text-danger-600 mt-1">Error: {syncError}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isConnected ? (
            <>
              <Button
                onClick={handleSync}
                variant="outline"
                className="w-full gap-2"
                disabled={isSyncing}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button onClick={handleManage} variant="outline" className="w-full">
                Manage Integration
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} className="w-full gap-2">
              <span>Connect Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
