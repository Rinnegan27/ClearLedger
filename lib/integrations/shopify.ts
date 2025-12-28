/**
 * Shopify Integration
 *
 * Documentation: https://shopify.dev/docs/api/admin-rest
 *
 * Setup Steps:
 * 1. Create Shopify Partner account or use existing store
 * 2. Create a custom app in your Shopify admin
 * 3. Grant necessary permissions (read_orders, read_products, etc.)
 * 4. Get Admin API access token
 * 5. Add credentials to .env file
 */

interface ShopifyConfig {
  storeUrl: string; // e.g., "mystore.myshopify.com"
  accessToken: string;
  apiVersion: string;
}

interface ShopifyOrder {
  id: string;
  orderNumber: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  totalPrice: number;
  subtotalPrice: number;
  totalTax: number;
  totalShipping: number;
  financialStatus: string;
  fulfillmentStatus: string;
  createdAt: Date;
  closedAt?: Date;
  lineItems: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  source?: string; // utm_source from marketing
  tags: string[];
}

export class ShopifyClient {
  private config: ShopifyConfig;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    this.config = config;
    this.baseUrl = `https://${config.storeUrl}/admin/api/${config.apiVersion}`;
  }

  /**
   * Fetch orders for a date range
   */
  async getOrders(
    startDate: Date,
    endDate: Date,
    status: string = "any"
  ): Promise<ShopifyOrder[]> {
    // TODO: Implement actual API call
    // GET /admin/api/{version}/orders.json
    // ?created_at_min=2024-01-01&created_at_max=2024-01-31&status=any

    console.log(`Fetching Shopify orders from ${startDate} to ${endDate}`);

    // Example using fetch:
    // const url = `${this.baseUrl}/orders.json`;
    // const params = new URLSearchParams({
    //   created_at_min: startDate.toISOString(),
    //   created_at_max: endDate.toISOString(),
    //   status: status,
    //   limit: '250',
    // });
    //
    // const response = await fetch(`${url}?${params}`, {
    //   headers: {
    //     'X-Shopify-Access-Token': this.config.accessToken,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // const data = await response.json();

    // Placeholder return
    return [];
  }

  /**
   * Get customer details
   */
  async getCustomer(customerId: string): Promise<any> {
    // TODO: Implement customer fetch
    // GET /admin/api/{version}/customers/{customer_id}.json

    console.log(`Fetching customer ${customerId}`);
    return null;
  }

  /**
   * Sync orders to database as bookings/revenue
   */
  async syncToDatabase(companyId: string, channelId?: string): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const orders = await this.getOrders(startDate, endDate);

    // TODO: Save to database using Prisma
    // Map orders to bookings with revenue data
    // const bookings = orders.map(order => ({
    //   companyId,
    //   channelId, // Determine from order.source or tags
    //   customerName: `${order.customer.firstName} ${order.customer.lastName}`,
    //   customerEmail: order.customer.email,
    //   customerPhone: order.customer.phone,
    //   serviceName: order.lineItems.map(item => item.name).join(', '),
    //   bookingDate: order.createdAt,
    //   scheduledDate: order.createdAt,
    //   completedDate: order.closedAt,
    //   status: order.fulfillmentStatus === 'fulfilled' ? 'COMPLETED' : 'SCHEDULED',
    //   revenue: parseFloat(order.totalPrice),
    //   externalId: order.id,
    // }));
    //
    // await prisma.booking.createMany({
    //   data: bookings,
    //   skipDuplicates: true,
    // });

    return orders.length;
  }

  /**
   * Track marketing attribution from order tags and UTM parameters
   */
  extractMarketingAttribution(order: ShopifyOrder): {
    source?: string;
    medium?: string;
    campaign?: string;
  } {
    // TODO: Parse UTM parameters from order landing site or customer note
    // Shopify stores these in order.landing_site or customer.note

    // Example: Extract from tags like "utm_source:google" or "utm_campaign:summer_sale"
    const attribution: any = {};

    order.tags.forEach((tag) => {
      if (tag.startsWith("utm_source:")) {
        attribution.source = tag.split(":")[1];
      } else if (tag.startsWith("utm_medium:")) {
        attribution.medium = tag.split(":")[1];
      } else if (tag.startsWith("utm_campaign:")) {
        attribution.campaign = tag.split(":")[1];
      }
    });

    return attribution;
  }

  /**
   * Create webhook for order notifications
   */
  async createWebhook(
    topic: string,
    callbackUrl: string
  ): Promise<any> {
    // TODO: Implement webhook creation
    // POST /admin/api/{version}/webhooks.json
    // {
    //   "webhook": {
    //     "topic": "orders/create",
    //     "address": "https://yourapp.com/webhooks/shopify",
    //     "format": "json"
    //   }
    // }

    console.log(`Creating Shopify webhook for topic: ${topic}`);
    return null;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // TODO: Make a simple API call to verify credentials
      // const url = `${this.baseUrl}/shop.json`;
      // const response = await fetch(url, {
      //   headers: {
      //     'X-Shopify-Access-Token': this.config.accessToken,
      //   },
      // });
      // return response.ok;

      return true;
    } catch (error) {
      console.error("Shopify connection test failed:", error);
      return false;
    }
  }
}

/**
 * Create a Shopify client instance
 */
export function createShopifyClient(): ShopifyClient | null {
  const config = {
    storeUrl: process.env.SHOPIFY_STORE_URL || "",
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "",
    apiVersion: "2024-01",
  };

  if (!config.storeUrl || !config.accessToken) {
    console.warn("Shopify credentials not configured");
    return null;
  }

  return new ShopifyClient(config);
}
