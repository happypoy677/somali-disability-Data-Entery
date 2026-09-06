import { Router, type IRouter } from "express";
import { count, eq } from "drizzle-orm";
import { db, adminsTable } from "@workspace/db";
import {
  CreateAdministratorBody,
  CreateAdministratorResponse,
  GetCurrentUserResponse,
  GetSetupStatusResponse,
  LoginBody,
  LoginResponse,
  LogoutResponse,
  UpdatePasswordBody,
  UpdatePasswordResponse,
  UpdateUsernameBody,
  UpdateUsernameResponse,
} from "@workspace/api-zod";
import {
  createSession,
  destroySession,
  hashPassword,
  normalizeUsername,
  publicAdmin,
  requireAdmin,
  verifyPassword,
} from "../lib/auth";

const router: IRouter = Router();

router.get("/auth/setup-status", async (_req, res): Promise<void> => {
  const [{ value }] = await db.select({ value: count() }).from(adminsTable);
  res.json(GetSetupStatusResponse.parse({ hasAdmin: Number(value) > 0 }));
});

router.post("/auth/setup", async (req, res): Promise<void> => {
  const parsed = CreateAdministratorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide a username and a valid password." });
    return;
  }
  const username = normalizeUsername(parsed.data.username);
  if (parsed.data.password !== parsed.data.confirmPassword) {
    res.status(400).json({ error: "Passwords do not match." });
    return;
  }
  if (!/(?=.*[A-Za-z])(?=.*\d).{8,}/.test(parsed.data.password)) {
    res.status(400).json({ error: "Password must be at least 8 characters and include a number." });
    return;
  }
  const existing = await db.select({ id: adminsTable.id }).from(adminsTable).limit(1);
  if (existing.length) {
    res.status(409).json({ error: "An administrator account already exists." });
    return;
  }
  const [admin] = await db.insert(adminsTable).values({
    username,
    passwordHash: await hashPassword(parsed.data.password),
  }).returning();
  res.status(201).json(CreateAdministratorResponse.parse(publicAdmin(admin)));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Invalid username or password." });
    return;
  }
  const username = normalizeUsername(parsed.data.username);
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username)).limit(1);
  if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
    res.status(401).json({ error: "Invalid username or password." });
    return;
  }
  await createSession(admin.id, res);
  res.json(LoginResponse.parse(publicAdmin(admin)));
});

router.get("/auth/me", requireAdmin, async (req, res): Promise<void> => {
  res.json(GetCurrentUserResponse.parse(publicAdmin(req.admin!)));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  await destroySession(req, res);
  res.json(LogoutResponse.parse({ message: "Logged out successfully." }));
});

router.patch("/auth/username", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateUsernameBody.safeParse(req.body);
  if (!parsed.success || parsed.data.newUsername !== parsed.data.confirmNewUsername) {
    res.status(400).json({ error: "Please check the username fields." });
    return;
  }
  if (!(await verifyPassword(parsed.data.currentPassword, req.admin!.passwordHash))) {
    res.status(401).json({ error: "Current password is incorrect." });
    return;
  }
  const username = normalizeUsername(parsed.data.newUsername);
  const [conflict] = await db.select({ id: adminsTable.id }).from(adminsTable)
    .where(eq(adminsTable.username, username)).limit(1);
  if (conflict && conflict.id !== req.admin!.id) {
    res.status(409).json({ error: "That username is already in use." });
    return;
  }
  const [admin] = await db.update(adminsTable).set({ username, updatedAt: new Date() })
    .where(eq(adminsTable.id, req.admin!.id)).returning();
  res.json(UpdateUsernameResponse.parse(publicAdmin(admin)));
});

router.patch("/auth/password", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdatePasswordBody.safeParse(req.body);
  if (!parsed.success || parsed.data.newPassword !== parsed.data.confirmNewPassword) {
    res.status(400).json({ error: "Please check the password fields." });
    return;
  }
  if (!(await verifyPassword(parsed.data.currentPassword, req.admin!.passwordHash))) {
    res.status(401).json({ error: "Current password is incorrect." });
    return;
  }
  if (!/(?=.*[A-Za-z])(?=.*\d).{8,}/.test(parsed.data.newPassword)) {
    res.status(400).json({ error: "Password must be at least 8 characters and include a number." });
    return;
  }
  await db.update(adminsTable).set({
    passwordHash: await hashPassword(parsed.data.newPassword),
    updatedAt: new Date(),
  }).where(eq(adminsTable.id, req.admin!.id));
  res.json(UpdatePasswordResponse.parse({ message: "Password changed successfully." }));
});

export default router;