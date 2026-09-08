import { useState, useCallback } from "react";

// Local-only accounts. There is no backend, so "authentication" here means:
// separate people using the same browser get separate, password-gated
// progress buckets. It is NOT secure in the way a real login system is —
// everything (including the password hash) lives in this browser's
// localStorage, inspectable via devtools by anyone with access to the
// machine. What it does provide: no plaintext password is ever stored, a
// wrong password is rejected, and each account's tracker progress is fully
// isolated from every other account's. That is the right bar for "so my
// partner/roommate can use this on the same laptop without seeing my
// progress", not for anything handling real secrets.

const USERS_KEY = "auth-users-v1";
const SESSION_KEY = "auth-session-v1";
const PBKDF2_ITERATIONS = 150_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

// PBKDF2-SHA256 via the browser's native Web Crypto API — no dependency,
// no plaintext password ever touches localStorage. `saltHex` is supplied on
// login (to reproduce the stored hash) and omitted on registration (a fresh
// random salt is generated).
async function hashPassword(password, saltHex) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return { hash: bytesToHex(new Uint8Array(derived)), salt: bytesToHex(salt) };
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* storage unavailable — nothing useful to do here */
  }
}

function loadSession() {
  try {
    return localStorage.getItem(SESSION_KEY) || null;
  } catch {
    return null;
  }
}

function saveSession(email) {
  try {
    if (email) localStorage.setItem(SESSION_KEY, email);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* non-fatal: login just won't persist across a refresh */
  }
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Central account store, independent of any React component. useAuth below
// is a thin reactive wrapper around this so multiple components could each
// call useAuth() without fighting over state.
export default function useAuth() {
  const [user, setUser] = useState(loadSession);

  const register = useCallback(async (emailRaw, password) => {
    const email = normalizeEmail(emailRaw);
    if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
    if (!password || password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

    const users = loadUsers();
    if (users[email]) return { ok: false, error: "An account with that email already exists — try logging in instead." };

    const { hash, salt } = await hashPassword(password);
    users[email] = { email, passwordHash: hash, salt, createdAt: new Date().toISOString() };
    saveUsers(users);
    saveSession(email);
    setUser(email);
    return { ok: true, email };
  }, []);

  const login = useCallback(async (emailRaw, password) => {
    const email = normalizeEmail(emailRaw);
    const users = loadUsers();
    const account = users[email];
    if (!account) return { ok: false, error: "No account found for that email — create one first." };

    const { hash } = await hashPassword(password, account.salt);
    if (hash !== account.passwordHash) return { ok: false, error: "Incorrect password." };

    saveSession(email);
    setUser(email);
    return { ok: true, email };
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
  }, []);

  return { user, register, login, logout };
}
