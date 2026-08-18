export function sumCheckInHours(checkIns = []) {
  return Number(checkIns.reduce((sum, c) => sum + (Number(c.hours) || 0), 0).toFixed(2));
}

export function serializeCheckIn(c) {
  return {
    id: c.id,
    userId: c.userId,
    userName: c.user?.name,
    department: c.user?.department,
    hours: c.hours,
    date: c.date,
    tag: c.tag,
    activities: c.activities,
    documentId: c.documentId,
    documentTitle: c.document?.title || null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export function serializeDocument(doc) {
  return { ...doc, totalTimeSpent: sumCheckInHours(doc.checkIns) };
}

export function serializeDocumentSummary(doc) {
  return { ...doc, linkedCheckIns: doc.checkIns.length, totalTimeSpent: sumCheckInHours(doc.checkIns) };
}
