import { Router, type IRouter } from "express";
import { count, desc } from "drizzle-orm";
import { db, backupsTable, peopleTable } from "@workspace/db";
import {
  CreateBackupBody,
  CreateBackupResponse,
  ListBackupsResponse,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router: IRouter = Router();
const connectors = new ReplitConnectors();

router.get("/backups", requireAdmin, async (_req, res): Promise<void> => {
  const backups = await db.select().from(backupsTable).orderBy(desc(backupsTable.createdAt));
  res.json(ListBackupsResponse.parse(backups));
});

router.post("/backups", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBackupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid backup details." });
    return;
  }
  const [{ count: recordCount }] = await db.select({ count: count() }).from(peopleTable);
  const [backup] = await db.insert(backupsTable).values({
    ...parsed.data,
    recordCount: Number(recordCount),
    createdBy: req.admin!.id,
  }).returning();
  res.status(201).json(CreateBackupResponse.parse(backup));
});

router.post("/backups/google-drive", requireAdmin, async (req, res): Promise<void> => {
  const body = req.body as { fileName?: unknown; contentBase64?: unknown; recordCount?: unknown };
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const contentBase64 = typeof body.contentBase64 === "string" ? body.contentBase64 : "";
  const recordCount = Number(body.recordCount);
  if (!fileName || !contentBase64 || !Number.isInteger(recordCount) || recordCount < 0 || recordCount > 200) {
    res.status(400).json({ error: "Invalid Google Drive backup details." });
    return;
  }

  const content = Buffer.from(contentBase64, "base64");
  if (!content.length || content.length > 10 * 1024 * 1024) {
    res.status(400).json({ error: "Backup workbook must be between 1 byte and 10 MB." });
    return;
  }

  const boundary = `----SomaliDisabilityBackup${Date.now().toString(36)}`;
  const metadata = JSON.stringify({
    name: fileName,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const multipart = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`),
    content,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  try {
    const driveResponse = await connectors.proxy(
      "google-drive",
      "/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": String(multipart.length),
        },
        body: multipart,
      },
    );

    if (!driveResponse.ok) {
      const detail = await driveResponse.text();
      req.log?.error({ status: driveResponse.status, detail }, "Google Drive backup upload failed");
      const [failedBackup] = await db.insert(backupsTable).values({
        type: "Google Drive",
        fileName,
        recordCount,
        status: "Failed",
        createdBy: req.admin!.id,
      }).returning();
      res.status(502).json({ error: "Google Drive upload failed.", backup: failedBackup });
      return;
    }

    const [backup] = await db.insert(backupsTable).values({
      type: "Google Drive",
      fileName,
      recordCount,
      status: "Completed",
      createdBy: req.admin!.id,
    }).returning();
    res.status(201).json(CreateBackupResponse.parse(backup));
  } catch (error) {
    req.log?.error({ error }, "Google Drive backup upload threw an error");
    res.status(502).json({ error: "Google Drive is unavailable. The local Excel backup is still available." });
  }
});

export default router;