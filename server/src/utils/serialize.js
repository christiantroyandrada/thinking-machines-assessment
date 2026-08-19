export function parseStoredAnalysis(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

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
  const checkIns = doc.checkIns || [];
  return {
    id: doc.id,
    type: doc.type,
    title: doc.title,
    filename: doc.filename,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    status: doc.status,
    contentText: doc.contentText,
    analysis: parseStoredAnalysis(doc.analysis),
    totalTimeSpent: sumCheckInHours(checkIns),
    checkInCount: checkIns.length,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}