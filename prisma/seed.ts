import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with comprehensive sample data...\n");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@clearledger.com" },
    update: {},
    create: {
      email: "demo@clearledger.com",
      name: "Demo User",
    },
  });

  console.log("✅ Created user:", user.email);

  // Create temp company (matches webhook handlers)
  const tempCompany = await prisma.company.upsert({
    where: { id: "temp-company-id" },
    update: {},
    create: {
      id: "temp-company-id",
      name: "HVAC Pro Services",
      industry: "Home Services",
      website: "https://hvacpro.com",
      phoneNumber: "+1-555-999-0000",
      timezone: "America/New_York",
    },
  });

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

  console.log("✅ Created companies:", company.name, "and", tempCompany.name);

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

  // Create TouchPoints for attribution (link bookings to channels)
  console.log("\n📍 Creating touchpoints for multi-touch attribution...");

  const bookings = await prisma.booking.findMany({
    where: { companyId: company.id },
    take: 10, // Add touchpoints to first 10 bookings
  });

  let touchpointCount = 0;
  for (const booking of bookings) {
    const numTouchpoints = Math.floor(Math.random() * 3) + 1; // 1-3 touchpoints per booking

    for (let i = 0; i < numTouchpoints; i++) {
      const channelId = i === 0
        ? booking.channelId // First touchpoint = booking channel
        : [googleAdsChannel.id, metaAdsChannel.id, organicChannel.id][Math.floor(Math.random() * 3)];

      const types = ["ad_click", "call", "website_visit", "booking_request"];
      const type = i === numTouchpoints - 1 ? "booking_request" : types[Math.floor(Math.random() * types.length)];

      const touchpointDate = new Date(booking.bookingDate);
      touchpointDate.setHours(touchpointDate.getHours() - (numTouchpoints - i) * 24); // Spread over days

      await prisma.touchPoint.create({
        data: {
          bookingId: booking.id,
          channelId,
          touchpointType: type,
          timestamp: touchpointDate,
          utmSource: channelId === googleAdsChannel.id ? "google" : channelId === metaAdsChannel.id ? "facebook" : "organic",
          utmMedium: channelId === organicChannel.id ? "organic" : "cpc",
          utmCampaign: `campaign-${i + 1}`,
        },
      });
      touchpointCount++;
    }

    // Update booking with first and last touch
    const touchpoints = await prisma.touchPoint.findMany({
      where: { bookingId: booking.id },
      orderBy: { timestamp: "asc" },
    });

    if (touchpoints.length > 0) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          firstTouchChannelId: touchpoints[0].channelId,
          lastTouchChannelId: touchpoints[touchpoints.length - 1].channelId,
        },
      });
    }
  }

  console.log(`✅ Created ${touchpointCount} touchpoints for attribution analysis`);

  // Update calls with AI analysis data
  console.log("\n🤖 Updating calls with AI analysis data...");
  const calls = await prisma.call.findMany({ where: { companyId: company.id } });

  for (const call of calls) {
    if (call.status === "ANSWERED") {
      const leadQualities = ["hot", "warm", "cold"];
      const urgencies = ["immediate", "soon", "planning", "browsing"];
      const services = ["HVAC Repair", "AC Installation", "Furnace Maintenance", "Emergency Heating"];

      const leadQuality = leadQualities[Math.floor(Math.random() * leadQualities.length)];
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      const leadScore = leadQuality === "hot" ? 7 + Math.floor(Math.random() * 3) : leadQuality === "warm" ? 4 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3);

      await prisma.call.update({
        where: { id: call.id },
        data: {
          leadQuality,
          leadScore,
          attributedValue: leadScore > 6 ? 500 + Math.floor(Math.random() * 1500) : 100 + Math.floor(Math.random() * 400),
          metadata: JSON.stringify({
            aiAnalysis: {
              urgency,
              serviceRequested: service,
              summary: `${leadQuality === "hot" ? "High-priority" : leadQuality === "warm" ? "Qualified" : "Low-priority"} lead for ${service}`,
            },
          }),
        },
      });
    } else {
      // Missed calls - some high value
      const isHighValue = Math.random() > 0.7;
      await prisma.call.update({
        where: { id: call.id },
        data: {
          leadQuality: isHighValue ? "hot" : "warm",
          leadScore: isHighValue ? 8 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 3),
          attributedValue: isHighValue ? 800 + Math.floor(Math.random() * 800) : 200 + Math.floor(Math.random() * 400),
          metadata: JSON.stringify({
            aiAnalysis: {
              urgency: isHighValue ? "immediate" : "soon",
              serviceRequested: "Emergency Service",
              summary: isHighValue ? "High-value missed call - callback ASAP" : "Missed call - moderate priority",
            },
          }),
        },
      });
    }
  }

  console.log(`✅ Updated ${calls.length} calls with AI analysis`);

  console.log("\n📊 Seed Summary:");
  console.log("================");
  console.log(`Users: 1`);
  console.log(`Companies: 2 (demo + temp)`);
  console.log(`Channels: 4`);
  console.log(`Ad Spend Records: 60 (30 days × 2 channels)`);
  console.log(`Calls: 48 (with AI analysis)`);
  console.log(`Bookings: 36 (with multi-touch attribution)`);
  console.log(`TouchPoints: ${touchpointCount}`);
  console.log("\n✅ Database seeded successfully!");
  console.log("\n🎯 Next Steps:");
  console.log("1. Visit http://localhost:3000/dashboard");
  console.log("2. Visit http://localhost:3000/dashboard/attribution");
  console.log("3. Visit http://localhost:3000/dashboard/funnel");
  console.log("4. Visit http://localhost:3000/dashboard/calls");
  console.log("5. Visit http://localhost:3000/dashboard/optimizer");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
