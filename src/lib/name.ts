/** "isabel.gordalla@fluidogroup.com" → "Isabel Gordalla"; "" → "". */
export function prettyNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(" ");
}

/** First name for greetings: display name first, then the email, else "". */
export function firstNameOf(displayName: string | null, email: string): string {
  const full = (displayName || "").trim() || prettyNameFromEmail(email);
  return full.split(" ")[0] ?? "";
}
