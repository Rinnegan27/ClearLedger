import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@clearledger.com" },
    update: {},
    create: {
      email: "demo@clearledger.com",
      name: "Demo User",
    },
  });

  console.log("Created user:", user.email);

  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: "demo-company-id" },
    update: {},
    create: {
      id: "demo-company-id",
      name: "Acme Local Services",
      industry: "Home Services",
      website: "https://acmelocalservices.com",
      phoneNumber: "+1-555-123-4567",
      timezone: "America/New_York",
    },
  });

  console.log("Created company:", company.name);

  // Link user to company
  await prisma.companyUser.upsert({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      companyId: company.id,
      role: "owner",
    },
  });

  // Create marketing channels
  const googleAdsChannel = await prisma.marketingChannel.create({
    data: {
      companyId: company.id,
      name: "Google Ads",
      type: "GOOGLE_ADS",
      description: "Search and display advertising",
    },
  });

  const metaAdsChannel = await prisma.marketingChannel.create({
    data: {
      companyId: company.id,
      name: "Meta Ads",
      type: "META_ADS",
      description: "Facebook and Instagram advertising",
    },
  });

  const organicChannel = await prisma.marketingChannel.create({
    data: {
      companyId: company.id,
      name: "Organic Search",
      type: "ORGANIC_SEARCH",
      description: "SEO and organic traffic",
    },
  });

  const referralChannel = await prisma.marketingChannel.create({
    data: {
      companyId: company.id,
      name: "Referral",
      type: "REFERRAL",
      description: "Customer referrals",
    },
  });

  console.log("Created 4 marketing channels");

  // Create ad spend data for the last 30 days
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Google Ads spend
    await prisma.adSpend.create({
      data: {
        companyId: company.id,
        channelId: googleAdsChannel.id,
        date,
        amount: 150 + Math.random() * 100,
        impressions: Math.floor(2000 + Math.random() * 1000),
        clicks: Math.floor(100 + Math.random() * 50),
        conversions: Math.floor(3 + Math.random() * 5),
      },
    });

    // Meta Ads spend
    await prisma.adSpend.create({
      data: {
        companyId: company.id,
        channelId: metaAdsChannel.id,
        date,
        amount: 100 + Math.random() * 80,
        impressions: Math.floor(3000 + Math.random() * 1500),
        clicks: Math.floor(150 + Math.random() * 75),
        conversions: Math.floor(4 + Math.random() * 6),
      },
    });
  }

  console.log("Created ad spend data for 30 days");

  // Create sample calls
  const callStatuses = ["ANSWERED", "MISSED", "VOICEMAIL"];
  for (let i = 0; i < 48; i++) {
    const callDate = new Date(today);
    callDate.setDate(callDate.getDate() - Math.floor(Math.random() * 30));
    callDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM

    const status = callStatuses[Math.floor(Math.random() * callStatuses.length)];
    const channelId = Math.random() > 0.5 ? googleAdsChannel.id : metaAdsChannel.id;

    await prisma.call.create({
      data: {
        companyId: company.id,
        channelId,
        phoneNumber: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        callerName: `Customer ${i + 1}`,
        duration: status === "ANSWERED" ? Math.floor(Math.random() * 600) + 60 : null,
        status,
        callDate,
        sentiment: status === "ANSWERED" ? (Math.random() > 0.3 ? "positive" : "neutral") : null,
        leadQuality: status === "ANSWERED" ? (Math.random() > 0.4 ? "warm" : "hot") : null,
      },
    });
  }

  console.log("Created 48 call records");

  // Create sample bookings
  const bookingStatuses = ["SCHEDULED", "CONFIRMED", "COMPLETED"];
  for (let i = 0; i < 36; i++) {
    const bookingDate = new Date(today);
    bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 30));

    const scheduledDate = new Date(bookingDate);
    scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 7) + 1);

    const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
    const channelId = [googleAdsChannel.id, metaAdsChannel.id, organicChannel.id, referralChannel.id][Math.floor(Math.random() * 4)];

    const revenue = status === "COMPLETED" ? Math.floor(Math.random() * 1500) + 500 : null;

    await prisma.booking.create({
      data: {
        companyId: company.id,
        channelId,
        customerName: `Customer ${i + 1}`,
        customerEmail: `customer${i + 1}@example.com`,
        customerPhone: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        serviceName: ["Plumbing Repair", "HVAC Maintenance", "Electrical Work", "Pest Control"][Math.floor(Math.random() * 4)],
        bookingDate,
        scheduledDate,
        completedDate: status === "COMPLETED" ? scheduledDate : null,
        status,
        revenue,
        cost: revenue ? revenue * 0.3 : null,
        profit: revenue ? revenue * 0.7 : null,
      },
    });
  }

  console.log("Created 36 booking records");

  console.log("✓ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
