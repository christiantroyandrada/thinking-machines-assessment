import { reportingRepository } from '../repositories/reportingRepository.js';
import { mockAnomalies, mockSearch, mockTimeInsights } from './genai.js';

export async function getInsights() {
  const checkIns = await reportingRepository.listCheckIns();
  return mockTimeInsights(checkIns);
}

export async function getAnomalies() {
  const [checkIns, documents] = await Promise.all([
    reportingRepository.listCheckIns(),
    reportingRepository.listDocumentSummaries(),
  ]);
  return mockAnomalies(checkIns, documents);
}

export async function searchWorkspace(query) {
  const [checkIns, documents] = await Promise.all([
    reportingRepository.listCheckIns({ includeUser: true }),
    reportingRepository.listDocumentSummaries(),
  ]);
  const context = checkIns.map((checkIn) => ({
    id: checkIn.id,
    hours: checkIn.hours,
    tag: checkIn.tag,
    activities: checkIn.activities,
    userName: checkIn.user?.name || 'Unknown',
    date: checkIn.date,
  }));
  return mockSearch(query, { checkins: context, documents });
}
