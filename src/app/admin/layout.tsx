"use client"; // スマホ用メニューの開閉などでクライアントコンポーネントにする

import React, { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
// import { useSession } from "next-auth/react"; // NextAuth.js を使う場合
// import { redirect } from "next/navigation"; // NextAuth.js でリダイレクトする場合

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // NextAuth.js で認証チェックをする場合
  // const { data: session, status } = useSession();
  // if (status === "loading") {
  //   return <p>Loading...</p>; // ローディング表示
  // }
  // if (status === "unauthenticated") {
  //   redirect("/api/auth/signin"); // ログインページへリダイレクト
  // }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}