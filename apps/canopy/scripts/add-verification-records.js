const { db } = require('../lib/db');
const { site } = require('../db/schema');
const { eq, isNull } = require('drizzle-orm');
const { randomBytes } = require('crypto');

function genRecord() {
  return `canopy-site=${randomBytes(16).toString('hex')}`;
}

async function main() {
  const sites = await db.select().from(site).where(isNull(site.verificationRecord));
  console.log(`Found ${sites.length} sites without verification record`);
  
  for (const s of sites) {
    const record = genRecord();
    await db.update(site).set({ verificationRecord: record }).where(eq(site.id, s.id));
    console.log(`Updated ${s.id} (${s.domain}) with record: ${record}`);
  }
  
  console.log('Done!');
  process.exit(0);
}

main().catch(console.error);