import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
  // callbacks: { // 必要に応じてコールバックをカスタマイズ
  //   async signIn({ user, account, profile, email, credentials }) {
  //     // 特定のドメインのユーザーのみ許可する場合など
  //     // if (account?.provider === "google" && profile?.email?.endsWith("@example.com")) {
  //     //   return true;
  //     // }
  //     // return false; // またはエラーをスロー
  //     return true;
  //   },
  //   async session({ session, token, user }) {
  //     // セッションにカスタムプロパティを追加する場合
  //     // session.user.id = token.sub; // 例: ユーザーIDをセッションに追加
  //     return session;
  //   }
  // },
  // secret: process.env.NEXTAUTH_SECRET, // .env.local に定義されていれば自動で読み込まれる
  // pages: { // カスタムログインページを指定する場合
  //   signIn: '/auth/signin', // '/auth/signin.tsx' を作成
  // }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };