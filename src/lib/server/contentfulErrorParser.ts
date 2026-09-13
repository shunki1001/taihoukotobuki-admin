// Contentful Management APIのバリデーションエラーを、フォームの
// フィールド名 → エラーメッセージのマップへの変換を試みる。
// contentful-management SDKはエラー詳細をJSON文字列としてError.messageに
// 詰め込むため、それをパースする。構造が想定と異なる場合はnullを返し、
// 呼び出し側は汎用エラーメッセージにフォールバックする(表示できないだけで
// 処理自体は落ちないようにする)。

export type FieldErrors = Record<string, string>;

interface ContentfulValidationErrorDetail {
  name?: string;
  path?: unknown[];
  details?: string;
}

export function parseContentfulFieldErrors(
  error: unknown
): FieldErrors | null {
  if (!(error instanceof Error)) return null;

  try {
    const parsed = JSON.parse(error.message) as {
      details?: { errors?: ContentfulValidationErrorDetail[] };
    };
    const errors = parsed.details?.errors;
    if (!Array.isArray(errors) || errors.length === 0) return null;

    const fieldErrors: FieldErrors = {};
    for (const e of errors) {
      // pathは通常 ["fields", "<フィールド名>", "<ロケール>"] の形式
      const fieldName =
        Array.isArray(e.path) && typeof e.path[1] === "string"
          ? e.path[1]
          : undefined;
      if (!fieldName) continue;

      const message =
        e.name === "unique"
          ? "この値は既に使用されています。"
          : e.details || "入力内容を確認してください。";
      fieldErrors[fieldName] = message;
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
  } catch {
    return null;
  }
}
