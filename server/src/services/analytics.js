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
  return [...map.values()].sort((a, b) => b.hours - a.hours);
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