// app/admin/layout.tsx の修正案
"use client";

import React, { useState, useEffect } from "react"; // useEffectを追加
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation"; // next/navigationからインポート
import Card from "@/components/ui/Card"; // ローディング表示用にCardをインポート

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin?callbackUrl=/admin/dashboard"); // ログインページへリダイレクト
    }
  }, [status]); // statusの変更を監視

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="p-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            認証情報を確認中...
          </p>
          {/* ここにスピナーなどを追加しても良い */}
        </Card>
      </div>
    );
  }

  if (status === "authenticated") {
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

  // status === "unauthenticated" の場合は useEffect 内でリダイレクトされるため、
  // ここでは何もレンダリングしないか、フォールバックUIを表示（ただし通常はリダイレクトが先）
  return null;
}
