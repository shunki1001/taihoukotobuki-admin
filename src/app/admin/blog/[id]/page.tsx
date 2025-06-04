"use client";

import React, { useState, useEffect } from 'react';
import BlogForm, { BlogFormData } from '@/components/admin/BlogForm';
import { useParams, useRouter } from 'next/navigation'; // next/navigationからインポート
import Card from '@/components/ui/Card';


// ダミーの既存記事データ (実際にはAPIから取得)
const fetchBlogPostById = async (id: string): Promise<BlogFormData | null> => {
  console.log(`Fetching blog post with id: ${id}`);
  // TODO: ContentfulからIDに基づいて記事データを取得する
  if (id === "1") {
    return { title: "最初のブログ記事", content: "これは最初のブログ記事の本文です。\n編集しています。", status: "published" };
  }
  if (id === "2") {
    return { title: "Tailwind CSS入門", content: "Tailwind CSS はいいぞ。\n下書きです。", status: "draft" };
  }
  return null;
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [initialData, setInitialData] = useState<BlogFormData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchBlogPostById(id);
          if (data) {
            setInitialData(data);
          } else {
            setError("記事が見つかりませんでした。");
          }
        } catch (e) {
          console.error("Failed to fetch blog post", e);
          setError("記事の読み込みに失敗しました。");
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    } else {
      setError("無効な記事IDです。");
      setIsLoading(false);
    }
  }, [id]);

  const handleSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    console.log(`Updating blog post ${id}:`, data);
    // TODO: Contentfulへのデータ更新処理
    // try {
    //   await updatePostInContentful(id, data);
    //   alert('ブログ記事を更新しました。');
    //   router.push('/admin/blog'); // 一覧へリダイレクト
    // } catch (error) {
    //   console.error("Failed to update post", error);
    //   alert('記事の更新に失敗しました。');
    // } finally {
    //   setIsSubmitting(false);
    // }
    alert(`更新 (シミュレーション) ID: ${id}\nタイトル: ${data.title}\nステータス: ${data.status}\n本文:\n${data.content}`);
    setIsSubmitting(false);
    router.push('/admin/blog'); // 成功したと仮定してリダイレクト
  };

  const handleCancel = () => {
    router.push('/admin/blog');
  };

  if (isLoading) {
    return <div className="p-6"><Card><p className="text-center text-gray-600 dark:text-gray-300">読み込み中...</p></Card></div>;
  }

  if (error) {
    return <div className="p-6"><Card><p className="text-center text-red-600">{error}</p></Card></div>;
  }

  if (!initialData) {
     return <div className="p-6"><Card><p className="text-center text-gray-600 dark:text-gray-300">記事データが見つかりません。</p></Card></div>;
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-6">
        ブログ記事編集
      </h1>
      <BlogForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="更新する"
        onCancel={handleCancel}
      />
    </div>
  );
}