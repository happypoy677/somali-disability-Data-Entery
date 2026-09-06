import { Router, type IRouter } from "express";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db, peopleTable } from "@workspace/db";
import {
  CreatePersonBody,
  CreatePersonResponse,
  DeletePersonParams,
  GetPersonParams,
  GetPersonResponse,
  ImportPeopleBody,
  ImportPeopleResponse,
  ListPeopleQueryParams,
  ListPeopleResponse,
  UpdatePersonBody,
  UpdatePersonParams,
  UpdatePersonResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { normalizedPersonInput, validatePersonValues } from "../lib/person-validation";

const router: IRouter = Router();
const MAX_RECORDS = 200;

async function nextAvailableNo() {
  const existing = await db.select({ no: peopleTable.no }).from(peopleTable);
  const used = new Set(existing.map((row) => row.no));
  for (let no = 1; no <= MAX_RECORDS; no += 1) {
    if (!used.has(no)) return no;
  }
  return null;
}

function buildValues(input: ReturnType<typeof normalizedPersonInput>, no: number, adminId: number) {
  return {
    no,
    ...input,
    createdBy: adminId,
    updatedBy: adminId,
  };
}

router.get("/people", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ListPeopleQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid search or filter values." });
    return;
  }
  const query = parsed.data;
  const predicates = [];
  if (query.search) {
    const term = `%${query.search}%`;
    predicates.push(or(
      ilike(peopleTable.name, term),
      ilike(peopleTable.gender, term),
      ilike(peopleTable.nationality, term),
      ilike(peopleTable.phone, term),
      ilike(peopleTable.city, term),
      ilike(peopleTable.education, term),
      ilike(peopleTable.disabilityType, term),
      ilike(peopleTable.causeOfDisability, term),
      ilike(peopleTable.amputeeBodyStatus, term),
    ));
  }
  const filters: Array<ReturnType<typeof eq>> = [];
  if (query.gender) filters.push(eq(peopleTable.gender, query.gender));
  if (query.maritalStatus) filters.push(eq(peopleTable.maritalStatus, query.maritalStatus));
  if (query.nationality) filters.push(eq(peopleTable.nationality, query.nationality));
  if (query.city) filters.push(eq(peopleTable.city, query.city));
  if (query.education) filters.push(eq(peopleTable.education, query.education));
  if (query.disabilityType) filters.push(eq(peopleTable.disabilityType, query.disabilityType));
  if (query.causeOfDisability) filters.push(eq(peopleTable.causeOfDisability, query.causeOfDisability));
  if (query.amputeeBodyStatus) filters.push(eq(peopleTable.amputeeBodyStatus, query.amputeeBodyStatus));
  if (query.handSide) filters.push(eq(peopleTable.handSide, query.handSide));
  if (query.legSide) filters.push(eq(peopleTable.legSide, query.legSide));
  const where = [...predicates, ...filters];
  const records = await db.select().from(peopleTable)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(peopleTable.updatedAt));
  res.json(ListPeopleResponse.parse(records));
});

router.post("/people", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreatePersonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all required person fields." });
    return;
  }
  const validationError = validatePersonValues(parsed.data);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  const [{ count: currentCount }] = await db.select({ count: count() }).from(peopleTable);
  if (Number(currentCount) >= MAX_RECORDS) {
    res.status(409).json({ error: "Registration capacity reached. The system currently contains 200 registered people." });
    return;
  }
  const no = await nextAvailableNo();
  if (!no) {
    res.status(409).json({ error: "Registration capacity reached. The system currently contains 200 registered people." });
    return;
  }
  const [person] = await db.insert(peopleTable).values(buildValues(normalizedPersonInput(parsed.data), no, req.admin!.id)).returning();
  res.status(201).json(CreatePersonResponse.parse(person));
});

router.post("/people/import", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ImportPeopleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "The import contains invalid rows." });
    return;
  }
  const existing = await db.select().from(peopleTable);
  const available = MAX_RECORDS - existing.length;
  const usedNos = new Set(existing.map((row) => row.no));
  const existingKeys = new Set(existing.map((row) => `${row.name.toLowerCase()}|${row.phone}|${row.city.toLowerCase()}`));
  const imported = [];
  let skipped = 0;
  for (const raw of parsed.data.records) {
    const error = validatePersonValues(raw);
    const input = normalizedPersonInput(raw);
    const key = `${input.name.toLowerCase()}|${input.phone}|${input.city.toLowerCase()}`;
    if (error || existingKeys.has(key) || imported.length >= available) {
      skipped += 1;
      continue;
    }
    let no = 1;
    while (usedNos.has(no) && no <= MAX_RECORDS) no += 1;
    if (no > MAX_RECORDS) {
      skipped += 1;
      continue;
    }
    const [person] = await db.insert(peopleTable).values(buildValues(input, no, req.admin!.id)).returning();
    imported.push(person);
    usedNos.add(no);
    existingKeys.add(key);
  }
  res.status(201).json(ImportPeopleResponse.parse({
    imported: imported.length,
    skipped,
    remaining: Math.max(0, MAX_RECORDS - existing.length - imported.length),
    records: imported,
  }));
});

router.get("/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const parsed = GetPersonParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid person id." });
    return;
  }
  const [person] = await db.select().from(peopleTable).where(eq(peopleTable.id, parsed.data.id)).limit(1);
  if (!person) {
    res.status(404).json({ error: "Person record not found." });
    return;
  }
  res.json(GetPersonResponse.parse(person));
});

router.patch("/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdatePersonParams.safeParse(req.params);
  const parsed = UpdatePersonBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Please complete all required person fields." });
    return;
  }
  const validationError = validatePersonValues(parsed.data);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  const [person] = await db.update(peopleTable).set({
    ...normalizedPersonInput(parsed.data),
    updatedBy: req.admin!.id,
    updatedAt: new Date(),
  }).where(eq(peopleTable.id, params.data.id)).returning();
  if (!person) {
    res.status(404).json({ error: "Person record not found." });
    return;
  }
  res.json(UpdatePersonResponse.parse(person));
});

router.delete("/people/:id", requireAdmin, async (req, res): Promise<void> => {
  const parsed = DeletePersonParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid person id." });
    return;
  }
  const deleted = await db.delete(peopleTable).where(eq(peopleTable.id, parsed.data.id)).returning({ id: peopleTable.id });
  if (!deleted.length) {
    res.status(404).json({ error: "Person record not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;