import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const DEPARTMENTS = {
  procurement: 40,
  engineering: 18,
  finance: 10,
  operations: 12,
  sales: 10,
  hr: 8,
};

const ACTIVITIES = {
  procurement: ['vendor negotiation', 'review quote', 'process requisition', 'update purchase order', 'supplier onboarding', 'rfq drafting'],
  engineering: ['fix login issue', 'deploy release', 'code review', 'incident response', 'feature planning'],
  finance: ['invoice reconciliation', 'budget review', 'payables processing'],
  operations: ['inventory check', 'shipment tracking', 'quality inspection'],
  sales: ['client meeting', 'proposal drafting', 'contract review'],
  hr: ['interview loop', 'onboarding paperwork'],
};

const DOC_TITLES = {
  PO: ['Purchase Order - lathe components', 'Purchase Order - conveyor belts', 'Purchase Order - safety gear'],
  QUOTE: ['Vendor quote - steel plates', 'Vendor quote - fasteners', 'Vendor quote - hydraulics'],
  REQ: ['Requisition - spare parts', 'Requisition - tooling', 'Requisition - IT hardware'],
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function isoDaysAgo(days) {
  const d = new Date(Date.now() - days * 86400000);
  return new Date(d.toISOString().slice(0, 10));
}

async function main() {
  await db.checkIn.deleteMany();
  await db.document.deleteMany();
  await db.user.deleteMany();

  // Reset SQLite AUTOINCREMENT so seeded IDs start at 1 (deleteMany does not reset the sequence).
  await db.$executeRawUnsafe(`DELETE FROM sqlite_sequence`);

  const users = [];
  users.push(
    { name: 'James Wong', email: 'james.wong@meridian.com', department: 'Engineering', role: 'admin' },
    { name: 'Maria Chen', email: 'maria.chen@meridian.com', department: 'Finance', role: 'admin' },
  );
  for (const [dept, count] of Object.entries(DEPARTMENTS)) {
    for (let i = 0; i < count; i++) {
      users.push({
        name: `${dept.charAt(0).toUpperCase() + dept.slice(1)} User ${i + 1}`,
        email: `${dept}.user${i + 1}@meridian.com`,
        department: dept.charAt(0).toUpperCase() + dept.slice(1),
        role: 'user',
      });
    }
  }

  await db.user.createMany({ data: users });
  const dbUsers = await db.user.findMany();
  const admin = dbUsers.find((u) => u.role === 'admin');

  const checkIns = [];
  for (const user of dbUsers) {
    const n = rand(12, 30);
    const deptKey = user.department.toLowerCase();
    for (let i = 0; i < n; i++) {
      const tag = pick(['procurement', 'project-x', 'design', 'meeting', 'finance', 'ops', 'support']);
      const hours = [1, 1.5, 2, 2.5, 3, 4, 5, 5.5, 7.5][rand(0, 8)];
      checkIns.push({
        userId: user.id,
        hours,
        date: isoDaysAgo(rand(0, 59)),
        tag,
        activities: pick(ACTIVITIES[deptKey] || ACTIVITIES.procurement),
        updatedAt: new Date(),
      });
    }
  }
  await db.checkIn.createMany({ data: checkIns });

  const documents = [];
  for (const [type, titles] of Object.entries(DOC_TITLES)) {
    for (const title of titles) {
      documents.push({
        type,
        title,
        filename: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`,
        mimeType: 'text/plain',
        sizeBytes: rand(800, 4000),
        contentText: `${title}\nVendor: ${pick(['Acme Industrial', 'Global Parts Co', 'SteelWorks PH', 'Apex Hydraulics'])}\nAmount: PHP ${rand(50000, 900000)}\nTotal: ${rand(50000, 900000)}`,
        status: pick(['pending', 'in-review', 'approved', 'rejected']),
        updatedAt: new Date(),
      });
    }
  }
  const { count } = await db.document.createMany({ data: documents });
  const dbDocs = await db.document.findMany();
  const allCheckIns = await db.checkIn.findMany();

  const linkCount = Math.min(40, allCheckIns.length);
  for (let i = 0; i < linkCount; i++) {
    const c = allCheckIns[rand(0, allCheckIns.length - 1)];
    await db.checkIn.update({ where: { id: c.id }, data: { documentId: dbDocs[rand(0, dbDocs.length - 1)].id } });
  }

  console.log(`Seeded ${dbUsers.length} users, ${allCheckIns.length} check-ins, ${count} documents.`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
