import { createHash, createHmac, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response, NextFunction } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db, adminsTable, sessionsTable, type Admin } from "@workspace/db";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE = "sdd_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function sessionSecret() {
  return process.env.SESSION_SECRET ?? "development-only-session-secret";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function tokenHash(token: string) {
  return createHmac("sha256", sessionSecret()).update(token).digest("hex");
}

export async function createSession(adminId: number, res: Response) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessionsTable).values({
    adminId,
    tokenHash: tokenHash(token),
    expiresAt,
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export async function destroySession(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, tokenHash(token)));
  }
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function getSessionAdmin(req: Request): Promise<Admin | null> {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!token) return null;
  const rows = await db
    .select({ admin: adminsTable })
    .from(sessionsTable)
    .innerJoin(adminsTable, eq(adminsTable.id, sessionsTable.adminId))
    .where(and(eq(sessionsTable.tokenHash, tokenHash(token)), gt(sessionsTable.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.admin ?? null;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const admin = await getSessionAdmin(req);
  if (!admin) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  req.admin = admin;
  next();
}

export function publicAdmin(admin: Admin) {
  return { id: admin.id, username: admin.username };
}

declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function safeHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}