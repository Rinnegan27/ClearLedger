/**
 * Test Setup and Utilities
 */

import { PrismaClient } from "@/app/generated/prisma";

// Create test database client
export const testDb = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
});

// Clean database between tests
export async function cleanDatabase() {
  // Delete in correct order to respect foreign key constraints
  await testDb.alertEvent.deleteMany({});
  await testDb.alertThreshold.deleteMany({});
  await testDb.anomalyDetectionRule.deleteMany({});
  await testDb.notification.deleteMany({});
  await testDb.touchPoint.deleteMany({});
  await testDb.booking.deleteMany({});
  await testDb.call.deleteMany({});
  await testDb.adSpend.deleteMany({});
  await testDb.campaign.deleteMany({});
  await testDb.marketingChannel.deleteMany({});
  await testDb.syncLog.deleteMany({});
  await testDb.integration.deleteMany({});
  await testDb.companyUser.deleteMany({});
  await testDb.session.deleteMany({});
  await testDb.account.deleteMany({});
  await testDb.user.deleteMany({});
  await testDb.company.deleteMany({});
}

// Create test company
export async function createTestCompany() {
  return await testDb.company.create({
    data: {
      name: "Test Company",
      timezone: "America/New_York",
    },
  });
}

// Create test user
export async function createTestUser(companyId: string) {
  const user = await testDb.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      emailVerified: new Date(),
    },
  });

  await testDb.companyUser.create({
    data: {
      userId: user.id,
      companyId,
      role: "admin",
    },
  });

  return user;
}

// Create test marketing channel
export async function createTestChannel(companyId: string, name: string, type: string) {
  return await testDb.marketingChannel.create({
    data: {
      companyId,
      name,
      type,
      isActive: true,
    },
  });
}

// Create test campaign
export async function createTestCampaign(
  companyId: string,
  channelId: string,
  name: string
) {
  return await testDb.campaign.create({
    data: {
      companyId,
      channelId,
      name,
      status: "active",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  });
}

// Create test ad spend
export async function createTestAdSpend(
  companyId: string,
  channelId: string,
  campaignId: string,
  date: Date,
  amount: number
) {
  return await testDb.adSpend.create({
    data: {
      companyId,
      channelId,
      campaignId,
      date,
      amount,
      impressions: Math.floor(amount * 100),
      clicks: Math.floor(amount * 10),
      conversions: Math.floor(amount * 0.5),
    },
  });
}

// Create test booking
export async function createTestBooking(
  companyId: string,
  channelId: string,
  revenue: number
) {
  return await testDb.booking.create({
    data: {
      companyId,
      channelId,
      customerName: "Test Customer",
      customerEmail: "customer@test.com",
      serviceName: "Test Service",
      bookingDate: new Date(),
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "confirmed",
      revenue,
    },
  });
}

// Create test call
export async function createTestCall(
  companyId: string,
  channelId: string,
  status: string,
  callDate: Date
) {
  return await testDb.call.create({
    data: {
      companyId,
      channelId,
      phoneNumber: "+1234567890",
      status,
      callDate,
    },
  });
}

// Teardown
export async function teardown() {
  await testDb.$disconnect();
}
