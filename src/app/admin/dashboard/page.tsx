import Card from "@/components/ui/Card";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-6">
        ダッシュボード
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/blog">
          <Card
            title="ブログ管理"
            className="hover:shadow-xl transition-shadow"
          >
            <p className="text-gray-600 dark:text-gray-300">
              ブログ記事の作成、編集、削除を行います。
            </p>
          </Card>
        </Link>
        <Link href="/admin/settings">
          <Card
            title="営業時間設定"
            className="hover:shadow-xl transition-shadow"
          >
            <p className="text-gray-600 dark:text-gray-300">
              イレギュラーな営業時間を設定します。
            </p>
          </Card>
        </Link>
        {/* 他の管理機能へのリンクカード */}
      </div>
    </div>
  );
}
