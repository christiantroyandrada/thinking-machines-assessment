const RE = /^(\d+(?:\.\d+)?)\s*(hrs?|hours?)?\s*(?:#([A-Za-z0-9_-]+))?\s*(.*)$/i;

export function parseCheckIn(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    return { hours: null, unit: 'hr', tag: 'general', activities: '', valid: false, errors: ['Check-in text is empty.'] };
  }
  const match = text.trim().match(RE);
  if (!match) {
    return {
      hours: null,
      unit: 'hr',
      tag: 'general',
      activities: '',
      valid: false,
      errors: ['Could not parse. Expected: <number> [hr|hrs] #<tag> <activities>'],
    };
  }
  const hours = parseFloat(match[1]);
  const errors = [];
  if (!Number.isFinite(hours) || hours <= 0) errors.push('Hours must be a positive number.');
  if (hours > 24) errors.push('Hours exceed 24 in a single check-in.');
  return {
    hours,
    unit: (match[2] || 'hr').toLowerCase().replace(/s$/, ''),
    tag: (match[3] || 'general').toLowerCase(),
    activities: match[4].trim(),
    valid: errors.length === 0,
    errors,
  };
}
