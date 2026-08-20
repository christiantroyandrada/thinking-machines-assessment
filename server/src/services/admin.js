import { reportingRepository } from '../repositories/reportingRepository.js';
import { aggregateBy, aggregateByDepartment } from './analytics.js';

export async function getAdminAnalytics() {
  const [users, checkIns] = await Promise.all([
    reportingRepository.listUsers(),
    reportingRepository.listCheckIns({ includeUser: true }),
  ]);
  const byTag = aggregateBy(checkIns, 'tag');
  return {
    totalUsers: users.length,
    totalHours: checkIns.reduce((sum, checkIn) => sum + checkIn.hours, 0),
    activeUsers: new Set(checkIns.map((checkIn) => checkIn.userId)).size,
    departmentBreakdown: aggregateByDepartment(users, checkIns),
    topTags: byTag.slice(0, 5).map((entry) => ({ tag: entry.key, hours: entry.hours })),
  };
}
