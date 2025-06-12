"use client";
import React from "react";

interface SimpleBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SimpleBlogEditor: React.FC<SimpleBlogEditorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md">
      <textarea
        id="content"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={15}
        className="w-full p-3 text-base text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none resize-y"
        placeholder="ブログ本文を入力してください。文字のみ入力できます。画像やリンクを本文に入れたい時はお申し付けを！"
      />
    </div>
  );
};

export default SimpleBlogEditor;
