import { pgTable, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const peopleTable = pgTable(
  "people",
  {
    id: serial("id").primaryKey(),
    no: integer("no").notNull(),
    name: text("name").notNull(),
    gender: text("gender").notNull(),
    age: integer("age").notNull(),
    maritalStatus: text("marital_status").notNull(),
    nationality: text("nationality").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    education: text("education").notNull(),
    disabilityType: text("disability_type").notNull(),
    causeOfDisability: text("cause_of_disability").notNull(),
    amputeeBodyStatus: text("amputee_body_status").notNull(),
    handSide: text("hand_side").notNull(),
    legSide: text("leg_side").notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: integer("created_by").notNull(),
    updatedBy: integer("updated_by").notNull(),
  },
  (table) => ({
    noUnique: uniqueIndex("people_no_unique").on(table.no),
  }),
);

export type Person = typeof peopleTable.$inferSelect;
export type NewPerson = typeof peopleTable.$inferInsert;