/**
 * P4: Missed Call Recovery Tests
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { analyzeMissedCalls } from '@/lib/recovery/missed-call-analyzer';
import {
  testDb,
  cleanDatabase,
  createTestCompany,
  createTestChannel,
  createTestBooking,
  createTestCall,
  teardown,
} from './setup';

describe('P4: Missed Call Recovery', () => {
  let companyId: string;
  let channelId: string;

  beforeAll(async () => {
    const company = await createTestCompany();
    companyId = company.id;

    const channel = await createTestChannel(companyId, 'Phone Channel', 'phone');
    channelId = channel.id;

    const today = new Date();

    // Create answered calls
    for (let i = 0; i < 20; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      await createTestCall(companyId, channelId, 'answered', date);
    }

    // Create missed calls
    for (let i = 0; i < 10; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      await createTestCall(companyId, channelId, 'missed', date);
    }

    // Create some bookings for revenue calculation
    for (let i = 0; i < 10; i++) {
      await createTestBooking(companyId, channelId, 500);
    }
  });

  afterAll(async () => {
    await cleanDatabase();
    await teardown();
  });

  describe('Missed Call Analysis', () => {
    it('should analyze missed calls', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      expect(analysis).toBeDefined();
      expect(analysis.totalCalls).toBe(30);
      expect(analysis.missedCalls).toBe(10);
      expect(analysis.answeredCalls).toBe(20);
    });

    it('should calculate missed rate correctly', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      const expectedRate = (10 / 30) * 100;
      expect(analysis.missedRate).toBeCloseTo(expectedRate, 1);
    });

    it('should estimate lost revenue', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      expect(analysis.estimatedLostRevenue).toBeGreaterThan(0);
      expect(analysis.estimatedLostBookings).toBeGreaterThan(0);
    });

    it('should calculate average booking value', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      expect(analysis.averageBookingValue).toBeGreaterThan(0);
    });

    it('should identify peak missed hours', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      expect(Array.isArray(analysis.peakMissedHours)).toBe(true);
      if (analysis.peakMissedHours.length > 0) {
        expect(analysis.peakMissedHours[0]).toHaveProperty('hour');
        expect(analysis.peakMissedHours[0]).toHaveProperty('missedCount');
        expect(analysis.peakMissedHours[0]).toHaveProperty('displayHour');
      }
    });

    it('should identify peak missed days', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      expect(Array.isArray(analysis.peakMissedDays)).toBe(true);
      if (analysis.peakMissedDays.length > 0) {
        expect(analysis.peakMissedDays[0]).toHaveProperty('dayOfWeek');
        expect(analysis.peakMissedDays[0]).toHaveProperty('dayName');
        expect(analysis.peakMissedDays[0]).toHaveProperty('missedCount');
      }
    });

    it('should list recent missed calls', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      expect(Array.isArray(analysis.recentMissedCalls)).toBe(true);
      expect(analysis.recentMissedCalls.length).toBeGreaterThan(0);

      if (analysis.recentMissedCalls.length > 0) {
        expect(analysis.recentMissedCalls[0]).toHaveProperty('phoneNumber');
        expect(analysis.recentMissedCalls[0]).toHaveProperty('callDate');
        expect(analysis.recentMissedCalls[0]).toHaveProperty('estimatedValue');
      }
    });

    it('should generate recommendations', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.recommendations.length).toBeGreaterThan(0);

      if (analysis.recommendations.length > 0) {
        expect(analysis.recommendations[0]).toHaveProperty('priority');
        expect(analysis.recommendations[0]).toHaveProperty('title');
        expect(analysis.recommendations[0]).toHaveProperty('description');
        expect(analysis.recommendations[0]).toHaveProperty('expectedImpact');
      }
    });

    it('should prioritize recommendations', async () => {
      const analysis = await analyzeMissedCalls(companyId, 30);

      const priorities = analysis.recommendations.map(r => r.priority);
      expect(priorities.some(p => ['high', 'medium', 'low'].includes(p))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle no missed calls', async () => {
      // Create a new company with no missed calls
      const newCompany = await createTestCompany();
      const analysis = await analyzeMissedCalls(newCompany.id, 30);

      expect(analysis.missedCalls).toBe(0);
      expect(analysis.missedRate).toBe(0);
    });
  });
});

export const p4TestResults = {
  suite: 'P4: Missed Call Recovery',
  totalTests: 10,
  description: 'Tests missed call analysis and recovery recommendations',
};
