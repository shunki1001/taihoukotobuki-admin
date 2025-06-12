"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button";
// import { ImagePlus, LinkIcon } from 'lucide-react';

interface SimpleBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SimpleBlogEditor: React.FC<SimpleBlogEditorProps> = ({
  value,
  onChange,
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedText, setSelectedText] = useState(""); // 簡易的な選択テキスト保持

  const handleImageUpload = () => {
    // TODO: Contentfulへの画像アップロード処理と、そのURLを本文に挿入するロジック
    // 例: const imageUrl = await uploadImageToContentful(file);
    // onChange(`${value}\n![画像ALTテキスト](${imageUrl})`);
    alert(
      "画像アップロード機能は未実装です。Contentful側で画像をアップロードし、URLを貼り付けてください。"
    );
  };

  const handleLinkInsert = () => {
    // textareaの選択範囲を取得する処理が必要 (今回は簡易的に保持したテキストを使う)
    // 実際には `document.getSelection()` や textarea の `selectionStart`, `selectionEnd` を使う
    if (selectedText && linkUrl) {
      onChange(value.replace(selectedText, `[${selectedText}](${linkUrl})`));
      setShowLinkModal(false);
      setLinkUrl("");
      setSelectedText("");
    } else if (linkUrl) {
      onChange(`${value} [リンクテキスト](${linkUrl})`);
      setShowLinkModal(false);
      setLinkUrl("");
    }
  };

  const onTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const text = target.value.substring(
      target.selectionStart,
      target.selectionEnd
    );
    setSelectedText(text);
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md">
      <div className="flex items-center p-2 border-b border-gray-300 dark:border-gray-600 space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleImageUpload}
          title="画像を挿入"
        >
          {/* <ImagePlus size={18} /> */}
          画像
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowLinkModal(true)}
          title="リンクを挿入"
        >
          {/* <LinkIcon size={18} /> */}
          リンク
        </Button>
        {/* 必要に応じて太字・イタリックなどのシンプルなMarkdown用ボタンを追加 */}
      </div>
      <textarea
        id="content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={onTextSelect} // 簡易的な選択テキスト取得
        rows={15}
        className="w-full p-3 text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none resize-y"
        placeholder="ブログ本文を入力してください (Markdown形式を想定)..."
      />

      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              リンクを挿入
            </h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowLinkModal(false)}
              >
                キャンセル
              </Button>
              <Button onClick={handleLinkInsert}>挿入</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleBlogEditor;
