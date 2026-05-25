import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "rate-record-default-dev-secret-change-in-prod";
}

export function signToken(payload: string): string {
  const hmac = createHmac("sha256", getSecret());
  hmac.update(payload);
  return `${payload}.${hmac.digest("hex")}`;
}

export function unsignToken(token: string): string | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  const expected = createHmac("sha256", getSecret());
  expected.update(payload);

  try {
    if (timingSafeEqual(Buffer.from(signature), expected.digest())) {
      return payload;
    }
  } catch {
    return null;
  }
  return null;
}

export const SESSION_COOKIE = "raterecord_session";

export async function getCurrentUserId(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return process.env.DEMO_USER_ID;

    const userId = unsignToken(token);
    return userId ?? process.env.DEMO_USER_ID;
  } catch {
    return process.env.DEMO_USER_ID;
  }
}
