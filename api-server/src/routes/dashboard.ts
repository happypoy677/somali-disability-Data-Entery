import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, peopleTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();
const CAPACITY = 200;

function distribution(records: Array<Record<string, unknown>>, key: string) {
  const counts = new Map<string, number>();
  for (const record of records) {
    const value = String(record[key] ?? "Unknown");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

router.get("/dashboard/summary", requireAdmin, async (_req, res): Promise<void> => {
  const records = await db.select().from(peopleTable).orderBy(desc(peopleTable.updatedAt));
  const plain = records as unknown as Array<Record<string, unknown>>;
  res.json(GetDashboardSummaryResponse.parse({
    capacity: CAPACITY,
    registered: records.length,
    remaining: Math.max(0, CAPACITY - records.length),
    gender: distribution(plain, "gender"),
    disabilityType: distribution(plain, "disabilityType"),
    causeOfDisability: distribution(plain, "causeOfDisability"),
    education: distribution(plain, "education"),
    amputeeBodyStatus: distribution(plain, "amputeeBodyStatus"),
    recent: records.slice(0, 5),
  }));
});

export default router;