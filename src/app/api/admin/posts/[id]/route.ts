import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/server/requireSession";
import {
  deletePostInContentful,
  fetchBlogPostById,
  updatePostInContentful,
} from "@/lib/server/contentfulPostsAdmin";
import { parseContentfulFieldErrors } from "@/lib/server/contentfulErrorParser";
import type { BlogFormData } from "@/lib/types/blog";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;
  const post = await fetchBlogPostById(id);
  if (!post) {
    return NextResponse.json({ error: "記事が見つかりません。" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;
  const data = (await request.json()) as BlogFormData;

  try {
    const updated = await updatePostInContentful(id, data);
    if (!updated) {
      return NextResponse.json(
        { error: "記事が見つかりません。" },
        { status: 404 }
      );
    }
    return NextResponse.json({ id: updated.sys.id });
  } catch (error) {
    console.error("Failed to update post:", error);
    const fieldErrors = parseContentfulFieldErrors(error);
    return NextResponse.json(
      { error: "記事の更新に失敗しました。", fieldErrors: fieldErrors ?? undefined },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;
  const result = await deletePostInContentful(id);

  if (result === null) {
    return NextResponse.json({ error: "記事が見つかりません。" }, { status: 404 });
  }
  if (result === false) {
    return NextResponse.json({ error: "削除に失敗しました。" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
