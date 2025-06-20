"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { deletePostInContentful } from "@/lib/contentfulContentsApi";

type DeleteButtonProps = {
  entryId: string;
  onDelete?: () => void;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({ entryId }) => {
  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) {
      return;
    }
    if (await deletePostInContentful(entryId)) {
      alert("削除に成功しました");
      window.location.reload();
    } else {
      alert("削除に失敗しました");
    }
  };

  return (
    <Button
      variant="danger"
      onClick={handleDelete}
      size="md"
      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="inline"
      >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      <span className="sr-only sm:not-sr-only">削除</span>
    </Button>
  );
};

export default DeleteButton;
