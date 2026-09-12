import { getServerSession, Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

/**
 * Route Handler の先頭で呼び出し、未認証なら 401 を返すためのガード。
 * サーバー側で改めてセッションを検証する(クライアント側のuseSessionチェックだけに頼らない)。
 */
export async function requireSession(): Promise<
  { session: Session; response: null } | { session: null; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, response: null };
}
