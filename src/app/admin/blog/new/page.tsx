"use client";

import React, { useState } from 'react';
import BlogForm, { BlogFormData } from '@/components/admin/BlogForm';
import { useRouter } from 'next/navigation'; // next/navigationからインポート

export default function NewBlogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    console.log("Submitting new blog post:", data);
    // TODO: Contentfulへのデータ送信処理
    // try {
    //   await createPostInContentful(data);
    //   alert('ブログ記事を作成しました。');
    //   router.push('/admin/blog'); // 一覧へリダイレクト
    // } catch (error) {
    //   console.error("Failed to create post", error);
    //   alert('記事の作成に失敗しました。');
    // } finally {
    //   setIsSubmitting(false);
    // }
    alert(`新規作成 (シミュレーション):\nタイトル: ${data.title}\nステータス: ${data.status}\n本文:\n${data.content}`);
    setIsSubmitting(false);
    router.push('/admin/blog'); // 成功したと仮定してリダイレクト
  };

  const handleCancel = () => {
    router.push('/admin/blog');
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-6">
        ブログ記事 新規作成
      </h1>
      <BlogForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="作成する"
        onCancel={handleCancel}
      />
    </div>
  );
}