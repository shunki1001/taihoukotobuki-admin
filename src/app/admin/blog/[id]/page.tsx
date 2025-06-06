"use client";

import React, { useState, useEffect } from 'react';
import BlogForm from '@/components/admin/BlogForm';
import { useParams, useRouter } from 'next/navigation';

import { fetchBlogPostById, updatePostInContentful, BlogFormData } from '@/lib/contentfulContentsApi';

// ダミーの既存記事データ (実際にはAPIから取得)
// const fetchBlogPostById = async (id: string): Promise<BlogFormDataApi | null> => {
//   console.log(`Fetching blog post with id: ${id}`);
//   // TODO: ContentfulからIDに基づいて記事データを取得する
//   if (id === "1") {
//     return { title: "最初のブログ記事", content: "これは最初のブログ記事の本文です。\n編集しています。", status: "published" };
//   }
//   if (id === "2") {
//     return { title: "Tailwind CSS入門", content: "Tailwind CSS はいいぞ。\n下書きです。", status: "draft" };
//   }
//   return null;
// };

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
            // Contentful APIのBlogFormDataApi型からUI用のBlogFormData型に変換
            const uiData: BlogFormData = {
              slug: data.slug,
              publishedDate: data.publishedDate,
              title: data.title,
              content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
              status: data.status,
              imageAssetId: (data as any).imageAssetId, // 画像アセットIDを追加
            };
            setInitialData(uiData);
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
    try {
      // UI用のBlogFormData型からContentful API用のBlogFormDataApi型に変換
      const apiData: BlogFormData = {
        slug: data.slug,
        publishedDate: data.publishedDate,
        title: data.title,
        content: data.content,
        status: data.status,
        imageAssetId: data.imageAssetId, // 画像アセットIDを含める
      };
      await updatePostInContentful(id, apiData);
      alert('ブログ記事を更新しました。');
      router.push('/admin/blog'); // 一覧へリダイレクト
    } catch (error) {
      console.error("Failed to update post", error);
      alert('記事の更新に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/blog');
  };

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
