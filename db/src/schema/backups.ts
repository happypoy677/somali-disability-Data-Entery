import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const backupsTable = pgTable("backups", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  fileName: text("file_name").notNull(),
  recordCount: integer("record_count").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export type Backup = typeof backupsTable.$inferSelect;