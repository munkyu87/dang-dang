export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required");
  }
  return "dev-auth-secret-dangdang";
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
