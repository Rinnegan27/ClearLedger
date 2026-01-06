/**
 * P3: Campaign Performance Scoring Tests
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { scoreCampaigns, getGradeColor } from '@/lib/scoring/campaign-scorer';
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

describe('P3: Campaign Performance Scoring', () => {
  let companyId: string;
  let channelId: string;
  let goodCampaignId: string;
  let poorCampaignId: string;

  beforeAll(async () => {
    const company = await createTestCompany();
    companyId = company.id;

    const channel = await createTestChannel(companyId, 'Test Channel', 'google_ads');
    channelId = channel.id;

    // Create a good performing campaign
    const goodCampaign = await createTestCampaign(companyId, channelId, 'Good Campaign');
    goodCampaignId = goodCampaign.id;

    // Create a poor performing campaign
    const poorCampaign = await createTestCampaign(companyId, channelId, 'Poor Campaign');
    poorCampaignId = poorCampaign.id;

    // Add data for good campaign (high ROAS)
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      await createTestAdSpend(companyId, channelId, goodCampaignId, date, 100);
    }

    // Create touchpoints and bookings for good campaign
    for (let i = 0; i < 15; i++) {
      const booking = await createTestBooking(companyId, channelId, 1000);

      await testDb.touchPoint.create({
        data: {
          bookingId: booking.id,
          channelId,
          campaignId: goodCampaignId,
          touchpointType: 'click',
          timestamp: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Add data for poor campaign (low ROAS)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      await createTestAdSpend(companyId, channelId, poorCampaignId, date, 200);
    }

    // Only 1 booking for poor campaign
    const poorBooking = await createTestBooking(companyId, channelId, 300);
    await testDb.touchPoint.create({
      data: {
        bookingId: poorBooking.id,
        channelId,
        campaignId: poorCampaignId,
        touchpointType: 'click',
        timestamp: today,
      },
    });

    // Create calls for conversion rate
    for (let i = 0; i < 20; i++) {
      await createTestCall(companyId, channelId, 'answered', new Date());
    }
  });

  afterAll(async () => {
    await cleanDatabase();
    await teardown();
  });

  describe('Campaign Scoring', () => {
    it('should score all campaigns', async () => {
      const scores = await scoreCampaigns(companyId, 1);

      expect(scores.length).toBe(2);
      expect(scores[0]).toHaveProperty('overallGrade');
      expect(scores[0]).toHaveProperty('overallScore');
    });

    it('should rank campaigns by performance', async () => {
      const scores = await scoreCampaigns(companyId, 1);

      // Scores should be sorted descending
      if (scores.length > 1) {
        expect(scores[0].overallScore).toBeGreaterThanOrEqual(scores[1].overallScore);
      }
    });

    it('should calculate ROAS correctly', async () => {
      const scores = await scoreCampaigns(companyId, 1);

      for (const score of scores) {
        if (score.spend > 0) {
          const expectedROAS = score.revenue / score.spend;
          expect(score.roas).toBeCloseTo(expectedROAS, 2);
        }
      }
    });

    it('should assign letter grades', async () => {
      const scores = await scoreCampaigns(companyId, 1);

      const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

      for (const score of scores) {
        expect(validGrades).toContain(score.overallGrade);
      }
    });

    it('should provide component scores', async () => {
      const scores = await scoreCampaigns(companyId, 1);

      for (const score of scores) {
        expect(score.componentScores).toHaveProperty('roasScore');
        expect(score.componentScores).toHaveProperty('roiScore');
        expect(score.componentScores).toHaveProperty('cpaScore');
        expect(score.componentScores).toHaveProperty('conversionScore');
        expect(score.componentScores).toHaveProperty('volumeScore');
      }
    });

    it('should generate insights', async () => {
      const scores = await scoreCampaigns(companyId, 1);

      for (const score of scores) {
        expect(Array.isArray(score.strengths)).toBe(true);
        expect(Array.isArray(score.weaknesses)).toBe(true);
        expect(typeof score.recommendation).toBe('string');
      }
    });

    it('should identify high performers', async () => {
      const scores = await scoreCampaigns(companyId, 1);

      const highPerformer = scores.find(s => s.roas > 2);
      if (highPerformer) {
        expect(['A+', 'A', 'A-', 'B+', 'B']).toContain(highPerformer.overallGrade);
      }
    });
  });

  describe('Grade Colors', () => {
    it('should return correct colors for grades', () => {
      const aColor = getGradeColor('A');
      expect(aColor.bg).toContain('green');

      const fColor = getGradeColor('F');
      expect(fColor.bg).toContain('red');
    });
  });
});

export const p3TestResults = {
  suite: 'P3: Campaign Performance Scoring',
  totalTests: 8,
  description: 'Tests campaign scoring algorithm and grade assignment',
};
