import * as crypto from "node:crypto";

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  data: Record<string, unknown> | null;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: number;
}

const users = new Map<string, StoredUser>();
const sessions = new Map<string, Session>();
const emailIndex = new Map<string, string>();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function generateId(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function createUser(email: string, username: string, password: string): { user: StoredUser; token: string } | { error: string } {
  const normalizedEmail = email.toLowerCase().trim();

  if (emailIndex.has(normalizedEmail)) {
    return { error: "An account with this email already exists" };
  }

  const id = generateId();
  const user: StoredUser = {
    id,
    email: normalizedEmail,
    username: username.trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    data: null,
  };

  users.set(id, user);
  emailIndex.set(normalizedEmail, id);

  const token = generateToken();
  sessions.set(token, { token, userId: id, createdAt: Date.now() });

  console.log(`[store] User created: ${normalizedEmail} (${id})`);
  return { user, token };
}

export function loginUser(email: string, password: string): { user: StoredUser; token: string } | { error: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const userId = emailIndex.get(normalizedEmail);

  if (!userId) {
    return { error: "Invalid email or password" };
  }

  const user = users.get(userId);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  if (user.passwordHash !== hashPassword(password)) {
    return { error: "Invalid email or password" };
  }

  const token = generateToken();
  sessions.set(token, { token, userId: user.id, createdAt: Date.now() });

  console.log(`[store] User logged in: ${normalizedEmail}`);
  return { user, token };
}

export function getUserByToken(token: string): StoredUser | null {
  const session = sessions.get(token);
  if (!session) return null;

  const user = users.get(session.userId);
  return user ?? null;
}

export function saveUserData(userId: string, data: Record<string, unknown>): boolean {
  const user = users.get(userId);
  if (!user) return false;

  user.data = data;
  users.set(userId, user);
  console.log(`[store] Data saved for user: ${userId}`);
  return true;
}

export function getUserData(userId: string): Record<string, unknown> | null {
  const user = users.get(userId);
  return user?.data ?? null;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}
