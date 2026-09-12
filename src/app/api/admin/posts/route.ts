import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/server/requireSession";
import {
  createPostInContentful,
  fetchPostsFromContentful,
} from "@/lib/server/contentfulPostsAdmin";
import { parseContentfulFieldErrors } from "@/lib/server/contentfulErrorParser";
import type { BlogFormData } from "@/lib/types/blog";

export async function GET() {
  const { session, response } = await requireSession();
  if (!session) return response;

  try {
    const posts = await fetchPostsFromContentful();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "記事一覧の取得に失敗しました。" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const data = (await request.json()) as BlogFormData;

  try {
    const entry = await createPostInContentful(data);
    return NextResponse.json({ id: entry.sys.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    const fieldErrors = parseContentfulFieldErrors(error);
    return NextResponse.json(
      { error: "記事の作成に失敗しました。", fieldErrors: fieldErrors ?? undefined },
      { status: 500 }
    );
  }
}
