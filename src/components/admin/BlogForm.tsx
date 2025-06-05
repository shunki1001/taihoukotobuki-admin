"use client";

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SimpleBlogEditor from '@/components/admin/SimpleBlogEditor';

import { BlogFormData } from '@/lib/contentfulApi';

interface BlogFormProps {
  initialData?: Partial<BlogFormData>; // 編集時に初期値を設定
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonText = "保存する",
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [slug, setSlug] = useState('');
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const [publishedDate, setPublishedDate] = useState(getTodayDateString());

useEffect(() => {
  if (initialData) {
    setTitle(initialData.title || '');
    setContent(initialData.content || '');
    setStatus(initialData.status || 'published');
    setSlug(initialData.slug || '');
    setPublishedDate(initialData.publishedDate || getTodayDateString());
  }
}, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ slug, publishedDate, title, content, status });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* ページタイトルは呼び出し元で設定 */}
        <div className="flex space-x-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : submitButtonText}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Input
              label="Slug"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="URLスラッグ (ユニーク)"
              disabled={isSubmitting}
            />
          </Card>
          <Card>
            <Input
              label="Published Date"
              id="publishedDate"
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </Card>
          <Card>
            <Input
              label="タイトル"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="記事のタイトル"
              disabled={isSubmitting}
            />
          </Card>
          <Card title="本文">
            <SimpleBlogEditor value={content} onChange={setContent} />
            {/* SimpleBlogEditor が isSubmitting を受け付けないため、Card全体をdisabledにするなどの工夫も考えられる */}
          </Card>
        </div>

        {/* Sidebar for metadata */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="公開設定">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ステータス
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                disabled={isSubmitting}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
              </select>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;
