"use client";

import React, { useState, useEffect } from 'react';
import BlogForm from '@/components/admin/BlogForm';
import { useParams, useRouter } from 'next/navigation';

import { fetchBlogPostById, updatePostInContentful, BlogFormData } from '@/lib/contentfulContentsApi';


export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

const [initialData, setInitialData] = useState<BlogFormData | undefined>(undefined);
const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
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
              imageAssetId: data.imageAssetId
            };
            setInitialData(uiData);
          } else {
            console.error("記事が見つかりませんでした。");
          }
        } catch (e) {
          console.error("Failed to fetch blog post", e);
          console.error("記事の読み込みに失敗しました。");
        }
      };
      loadData();
    } else {
      console.error("無効な記事IDです。");
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
        imageAssetId: data.imageAssetId
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
