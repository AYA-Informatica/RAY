/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const BATCH_SIZE = 500;

async function main() {
  const csvPath = path.join(__dirname, "../List_of_Villages_for_all_technology.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at: ${csvPath}`);
    process.exit(1);
  }

  const existing = await prisma.rwandaLocation.count();
  if (existing > 0) {
    console.log(`ℹ️  RwandaLocation already has ${existing} rows — skipping seed.`);
    console.log("   To re-seed, truncate the table first: DELETE FROM \"RwandaLocation\";");
    return;
  }

  console.log("🌍 Seeding Rwanda administrative hierarchy…");

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split(/\r?\n/);

  type Row = { province: string; district: string; sector: string; cell: string; village: string };

  const rows: Row[] = lines
    .slice(1) // skip header
    .map((line) => {
      const [province, district, sector, cell, village] = line.split(",").map((s) => s.trim());
      return { province, district, sector, cell, village } as Row;
    })
    .filter((r) => r.province && r.district && r.sector && r.cell && r.village);

  console.log(`  Parsed ${rows.length} villages from CSV.`);

  let totalInserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const result = await prisma.rwandaLocation.createMany({
      data: batch,
      skipDuplicates: true,
    });
    totalInserted += result.count;
    const progress = Math.min(i + BATCH_SIZE, rows.length);
    console.log(`  … ${progress}/${rows.length} rows processed`);
  }

  console.log(`✅ Rwanda locations seeded: ${totalInserted} rows inserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
