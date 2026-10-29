import { supabase } from '@/integrations/supabase/client';

export function initialsFromName(name: string) {
  return name.trim().split(/\s+/u).filter(Boolean).slice(0, 2).map(part => (Array.from(part)[0] ?? '').toLocaleUpperCase()).join('');
}
export function emailError(value: string): string | null {
  if (/^\+?[\d\s().-]{7,22}$/.test(value.trim())) return 'Phone sign-in is not yet available. Please enter an email address.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Please enter a valid email address.';
}
export function passwordError(password: string, confirm: string) {
  if (password.length < 8) return 'Use at least 8 characters for your password.';
  return password === confirm ? null : 'Your passwords do not match.';
}
export function safeDestination(value: unknown) {
  return typeof value === 'string' && /^\/(page-[1-3]|default)$/.test(value) ? value : '/';
}
export function authError(error: unknown) {
  const e = error as { code?: string; message?: string; status?: number };
  if (e.code === 'email_not_confirmed') return 'Please confirm your email before logging in. Check your inbox for the confirmation link.';
  if (e.code === 'invalid_credentials') return 'Email and password do not match.';
  if (e.code === 'user_already_exists' || e.code === 'email_exists') return 'An account already exists for this email. Please log in instead.';
  if (e.status === 429 || e.code?.includes('rate_limit')) return 'Too many requests. Please wait a few minutes before trying again.';
  if (e.code === 'weak_password') return 'Use at least 8 characters for your password.';
  if (e.code === 'email_address_invalid') return 'Please enter a valid email address.';
  if (e.code === 'otp_expired' || e.code === 'flow_state_expired') return 'This link has expired or was already used. Please request a new email.';
  return 'Could not complete this request. Check your connection and try again.';
}
export async function readDisplayName(id: string) {
  const { data, error } = await supabase.from('profiles').select('display_name').eq('id', id).single();
  if (error) throw error;
  return data.display_name;
}