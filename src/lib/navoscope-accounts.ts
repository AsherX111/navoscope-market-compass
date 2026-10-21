// Browser-local demo accounts (same storage keys and hashing as the original app).
export const accountsKey = "navoscope.accounts.v1";
export const sessionKey = "navoscope.session.v1";

export type Account = { identity: string; userName: string; salt: string; passwordHash: string };

export function normalizeIdentity(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? trimmed.toLowerCase() : trimmed.replace(/\D/g, "");
}

export function readAccounts(): Record<string, Account> {
  try {
    const value = JSON.parse(localStorage.getItem(accountsKey) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0].toLocaleUpperCase())
    .join("");
}

export function validIdentity(value: string) {
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    (/^\+?[\d\s().-]{7,22}$/.test(value) && value.replace(/\D/g, "").length >= 7)
  );
}

export function newSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const saltBytes = Uint8Array.from(salt.match(/.{2}/g)!, (pair) => parseInt(pair, 16));
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 120000, hash: "SHA-256" },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
}
