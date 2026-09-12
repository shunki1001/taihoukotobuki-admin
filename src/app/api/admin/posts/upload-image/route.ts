import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/server/requireSession";
import { uploadImageToContentful } from "@/lib/server/contentfulPostsAdmin";
import { validateImageUpload } from "@/lib/server/imageValidation";

export async function POST(request: NextRequest) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ファイルがありません。" }, { status: 400 });
  }

  // file.type(ブラウザ申告のMIMEタイプ)は偽装可能なため、
  // サーバー側で実バイナリのマジックナンバーとサイズを検証する
  const validation = await validateImageUpload(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  try {
    const assetId = await uploadImageToContentful(file);
    return NextResponse.json({ assetId });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json(
      { error: "画像のアップロードに失敗しました。" },
      { status: 500 }
    );
  }
}
