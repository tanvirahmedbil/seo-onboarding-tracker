// Add allowed email domains or specific emails here
export const ALLOWED_DOMAINS: string[] = [
  // "youragency.com",
];

export const ALLOWED_EMAILS: string[] = [
  // "specific@gmail.com",
];

export function isEmailAllowed(email: string): boolean {
  if (ALLOWED_DOMAINS.length === 0 && ALLOWED_EMAILS.length === 0) return true;
  if (ALLOWED_EMAILS.includes(email)) return true;
  const domain = email.split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
}
