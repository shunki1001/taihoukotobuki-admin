// app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth"; // AuthOptions をインポート
import GoogleProvider from "next-auth/providers/google";

const authOptions: AuthOptions = {
  // 型を明示
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // 環境変数から許可されたメールアドレスのリストを取得
        const allowedEmailsEnv = process.env.ALLOWED_EMAILS;
        if (!allowedEmailsEnv) {
          console.error("ALLOWED_EMAILS environment variable is not set.");
          return false; // 環境変数が設定されていなければ全員拒否（セキュリティのため）
        }
        const allowedEmails = allowedEmailsEnv
          .split(",")
          .map((email) => email.trim().toLowerCase());

        // ユーザーのメールアドレスが許可リストに含まれているか確認
        if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
          return true; // 許可リストに含まれていればサインインを許可
        } else {
          console.warn(`Unauthorized attempt to sign in by: ${user.email}`);
          // ここでカスタムエラーページにリダイレクトすることも可能
          // 例: return '/unauthorized-access';
          return false; // 許可リストに含まれていなければサインインを拒否
        }
      }
      // 他のプロバイダでのサインインの場合は、プロバイダに応じた処理を記述
      return true; // Google以外はデフォルトで許可 (必要に応じて変更)
    },
    // ... 他のコールバック (sessionなど)
    // async session({ session, token, user }) {
    //   return session;
    // }
  },
  // ... (他の設定: secret, pagesなど)
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
