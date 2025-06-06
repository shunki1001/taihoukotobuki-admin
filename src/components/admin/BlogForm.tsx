"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SimpleBlogEditor from '@/components/admin/SimpleBlogEditor';

import { BlogFormData, uploadImageToContentful, getAssetUrl } from '@/lib/contentfulContentsApi';

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
  const [imageAssetId, setImageAssetId] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateRandomSlug = (length = 8): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [publishedDate, setPublishedDate] = useState(getTodayDateString());

  useEffect(() => {
    if (initialData) {
      console.log('initialData:', initialData);
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setStatus(initialData.status || 'published');
      setSlug(initialData.slug || '');
      setPublishedDate(initialData.publishedDate || getTodayDateString());
      setImageAssetId(initialData.imageAssetId);
      setImageUrl(initialData.imageUrl)
    } else {
      setSlug(generateRandomSlug());
    }
  }, [initialData]);

  useEffect(() => {
    async function loadImageUrl(imageAssetId: string | undefined) {
      if(imageAssetId !== undefined){
        setImageUrl(await getAssetUrl(imageAssetId))
      }
    }
    loadImageUrl(imageAssetId)
  }, [imageAssetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ slug, publishedDate, title, content, status, imageAssetId, imageUrl });
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading || isSubmitting) return;
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const assetId = await uploadImageToContentful(file);
      setImageAssetId(assetId);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setUploading(false);
    }
  }, [uploading, isSubmitting]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploading || isSubmitting) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const assetId = await uploadImageToContentful(file);
      setImageAssetId(assetId);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageAssetId(undefined);
    setImageUrl(undefined);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* ページタイトルは呼び出し元で設定 */}
        <div className="flex space-x-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting || uploading}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting || uploading}>
            {isSubmitting || uploading ? '保存中...' : submitButtonText}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Input
              label="公開日"
              id="publishedDate"
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              required
              disabled={isSubmitting || uploading}
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
              disabled={isSubmitting || uploading}
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
                disabled={isSubmitting || uploading}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
              </select>
            </div>
          </Card>
          <Card>
            <Input
              label="URLスラッグ（ランダム）"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="URLスラッグ (ユニーク)"
              disabled={isSubmitting || uploading}
            />
          </Card>
          <Card title="ブログ画像">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-400 rounded-md p-4 text-center cursor-pointer"
            >
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="ブログ画像プレビュー" className="mx-auto max-h-48 object-contain" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting || uploading}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                  >
                    削除
                  </button>
                </div>
              ) : (
                <>
                  <p>ここに画像をドラッグ＆ドロップ、またはクリックして選択</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={isSubmitting || uploading}
                    className="hidden"
                    id="imageAssetId"
                  />
                  <label htmlFor="imageAssetId" className="cursor-pointer text-blue-600 underline">
                    画像を選択
                  </label>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;
