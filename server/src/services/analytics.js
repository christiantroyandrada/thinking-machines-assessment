export function aggregateBy(checkins, dimension) {
  const map = new Map();
  for (const c of checkins) {
    let key = c[dimension];
    if (dimension === 'date') key = new Date(c.date).toISOString().slice(0, 10);
    if (dimension === 'user') key = c.user?.name || 'Unknown';
    if (dimension === 'department') key = c.user?.department || 'Unknown';
    if (!key) key = 'Unknown';
    const entry = map.get(key) || { key, hours: 0, count: 0 };
    entry.hours += c.hours;
    entry.count += 1;
    map.set(key, entry);
  }
  const series = [...map.values()];
  return dimension === 'date'
    ? series.sort((a, b) => a.key.localeCompare(b.key))
    : series.sort((a, b) => b.hours - a.hours);
}

export function aggregateByDepartment(users = [], checkIns = []) {
  const map = new Map();
  for (const user of users) {
    const entry = map.get(user.department) || { department: user.department, hours: 0, users: 0 };
    entry.users += 1;
    map.set(user.department, entry);
  }
  for (const c of checkIns) {
    const dept = c.user?.department || 'Unknown';
    const entry = map.get(dept) || { department: dept, hours: 0, users: 0 };
    entry.hours += c.hours;
    map.set(dept, entry);
  }
  return [...map.values()].sort((a, b) => b.hours - a.hours);
}

export async function getTimeAnalytics(dimension) {
  const checkIns = await reportingRepository.listCheckIns({ includeUser: true });
  const series = aggregateBy(checkIns, dimension);
  const totalHours = Number(series.reduce((sum, entry) => sum + entry.hours, 0).toFixed(2));
  return { totalHours, series };
}

export async function getDepartmentAnalytics() {
  const [users, checkIns] = await Promise.all([
    reportingRepository.listUsers(),
    reportingRepository.listCheckIns({ includeUser: true }),
  ]);
  return aggregateByDepartment(users, checkIns).map((department) => ({
    department: department.department,
    totalHours: Number(department.hours.toFixed(2)),
    users: department.users,
    avgHoursPerUser: Number((department.hours / Math.max(1, department.users)).toFixed(2)),
  }));
}

export async function getDocumentAnalytics() {
  const documents = await reportingRepository.listDocumentSummaries();
  const byStatus = documents.reduce((counts, document) => {
    counts[document.status] = (counts[document.status] || 0) + 1;
    return counts;
  }, {});
  return { totalDocuments: documents.length, byStatus };
}
import { reportingRepository } from '../repositories/reportingRepository.js';
