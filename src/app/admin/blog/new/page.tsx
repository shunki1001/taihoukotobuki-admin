"use client";

import React, { useState } from "react";
import BlogForm from "@/components/admin/BlogForm";
import { useRouter } from "next/navigation"; // next/navigationからインポート
import {
  createPostInContentful,
  ApiError,
  BlogFormData,
} from "@/lib/contentfulContentsApi";
import { useToast } from "@/components/ui/ToastProvider";

export default function NewBlogPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>();

  const handleSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    setFieldErrors(undefined);
    try {
      await createPostInContentful(data);
      showToast("ブログ記事を作成しました。", "success");
      router.push("/admin/blog"); // 一覧へリダイレクト
    } catch (error) {
      console.error("Failed to create post", error);
      const message =
        error instanceof Error ? error.message : "記事の作成に失敗しました。";
      showToast(message, "error");
      if (error instanceof ApiError && error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/blog");
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
        fieldErrors={fieldErrors}
      />
    </div>
  );
}
