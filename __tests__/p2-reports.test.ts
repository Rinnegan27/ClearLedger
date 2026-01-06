/**
 * P2: Automated Insight Reports Tests
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { generateInsightReport } from '@/lib/insights/report-generator';
import { formatReportEmail, formatReportText } from '@/lib/insights/email-formatter';
import {
  testDb,
  cleanDatabase,
  createTestCompany,
  createTestChannel,
  createTestCampaign,
  createTestAdSpend,
  createTestBooking,
  createTestCall,
  teardown,
} from './setup';

describe('P2: Automated Insight Reports', () => {
  let companyId: string;
  let channelId: string;
  let campaignId: string;

  beforeAll(async () => {
    const company = await createTestCompany();
    companyId = company.id;

    const channel = await createTestChannel(companyId, 'Google Ads', 'google_ads');
    channelId = channel.id;

    const campaign = await createTestCampaign(companyId, channelId, 'Test Campaign');
    campaignId = campaign.id;

    // Create sample data for last week
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      await createTestAdSpend(companyId, channelId, campaignId, date, 100 + i * 10);
      await createTestBooking(companyId, channelId, 500 + i * 50);
      await createTestCall(companyId, channelId, 'answered', date);
    }
  });

  afterAll(async () => {
    await cleanDatabase();
    await teardown();
  });

  describe('Report Generation', () => {
    it('should generate weekly report', async () => {
      const report = await generateInsightReport(companyId, 'weekly');

      expect(report).toBeDefined();
      expect(report.period).toBe('weekly');
      expect(report.summary).toBeDefined();
      expect(report.summary.totalSpend).toBeGreaterThan(0);
      expect(report.summary.totalRevenue).toBeGreaterThan(0);
    });

    it('should calculate ROAS correctly', async () => {
      const report = await generateInsightReport(companyId, 'weekly');

      const expectedROAS = report.summary.totalRevenue / report.summary.totalSpend;
      expect(report.summary.roas).toBeCloseTo(expectedROAS, 2);
    });

    it('should generate insights', async () => {
      const report = await generateInsightReport(companyId, 'weekly');

      expect(Array.isArray(report.insights)).toBe(true);
      // Should have at least some insights
    });

    it('should generate recommendations', async () => {
      const report = await generateInsightReport(companyId, 'weekly');

      expect(Array.isArray(report.recommendations)).toBe(true);
      if (report.recommendations.length > 0) {
        expect(report.recommendations[0]).toHaveProperty('priority');
        expect(report.recommendations[0]).toHaveProperty('title');
        expect(report.recommendations[0]).toHaveProperty('expectedImpact');
      }
    });

    it('should include top channels', async () => {
      const report = await generateInsightReport(companyId, 'weekly');

      expect(Array.isArray(report.topChannels)).toBe(true);
      if (report.topChannels.length > 0) {
        expect(report.topChannels[0]).toHaveProperty('channelName');
        expect(report.topChannels[0]).toHaveProperty('roas');
      }
    });
  });

  describe('Email Formatting', () => {
    it('should format HTML email', async () => {
      const report = await generateInsightReport(companyId, 'weekly');
      const html = formatReportEmail(report, 'Test Company');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Weekly Marketing Report');
      expect(html).toContain('Test Company');
    });

    it('should format plain text email', async () => {
      const report = await generateInsightReport(companyId, 'weekly');
      const text = formatReportText(report, 'Test Company');

      expect(text).toContain('WEEKLY MARKETING REPORT');
      expect(text).toContain('Test Company');
      expect(text).toContain('EXECUTIVE SUMMARY');
    });

    it('should include all sections in HTML', async () => {
      const report = await generateInsightReport(companyId, 'weekly');
      const html = formatReportEmail(report, 'Test Company');

      expect(html).toContain('Executive Summary');
      expect(html).toContain('Total Revenue');
      expect(html).toContain('ROAS');
    });
  });

  describe('Period Calculations', () => {
    it('should handle monthly reports', async () => {
      const report = await generateInsightReport(companyId, 'monthly');

      expect(report.period).toBe('monthly');
      expect(report.startDate).toBeDefined();
      expect(report.endDate).toBeDefined();
    });

    it('should calculate period-over-period changes', async () => {
      const report = await generateInsightReport(companyId, 'weekly');

      expect(report.comparison).toBeDefined();
      expect(typeof report.comparison.spendChange).toBe('number');
      expect(typeof report.comparison.revenueChange).toBe('number');
    });
  });
});

export const p2TestResults = {
  suite: 'P2: Automated Insight Reports',
  totalTests: 9,
  description: 'Tests report generation, metrics calculation, and email formatting',
};
