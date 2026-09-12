// アップロードされた画像ファイルの検証。
// `file.type`(ブラウザが申告するMIMEタイプ)はクライアント側で自由に偽装できるため、
// 実バイナリの先頭バイト(マジックナンバー)を見て実際のファイル形式を判定する。

import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/imageUploadLimits";

export { MAX_IMAGE_UPLOAD_BYTES };

type ImageSignature = {
  mimeType: string;
  matches: (bytes: Uint8Array) => boolean;
};

const IMAGE_SIGNATURES: ImageSignature[] = [
  {
    mimeType: "image/jpeg",
    matches: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    // 89 50 4E 47 0D 0A 1A 0A
    mimeType: "image/png",
    matches: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    // "GIF87a" / "GIF89a"
    mimeType: "image/gif",
    matches: (b) =>
      b.length >= 6 &&
      b[0] === 0x47 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x38 &&
      (b[4] === 0x37 || b[4] === 0x39) &&
      b[5] === 0x61,
  },
  {
    // "RIFF"....."WEBP"
    mimeType: "image/webp",
    matches: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * ファイルサイズと実バイナリのマジックナンバーを検証する。
 * `file.type` は信用せず、実際のバイト列から画像形式を判定する。
 */
export async function validateImageUpload(
  file: File
): Promise<ImageValidationResult> {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return {
      ok: false,
      reason: `ファイルサイズが大きすぎます(上限${
        MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)
      }MB)。`,
    };
  }
  if (file.size === 0) {
    return { ok: false, reason: "ファイルが空です。" };
  }

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const matched = IMAGE_SIGNATURES.some((sig) => sig.matches(head));

  if (!matched) {
    return {
      ok: false,
      reason: "対応していない画像形式です(JPEG/PNG/GIF/WebPのみ許可)。",
    };
  }

  return { ok: true };
}
