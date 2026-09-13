"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { deletePostInContentful } from "@/lib/contentfulContentsApi";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";

type DeleteButtonProps = {
  entryId: string;
  onDeleted?: () => void;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({ entryId, onDeleted }) => {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = await confirm({
      message: "本当に削除しますか?この操作は取り消せません。",
      confirmText: "削除する",
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      if (await deletePostInContentful(entryId)) {
        showToast("記事を削除しました。", "success");
        // フルページリロードではなく、呼び出し元に一覧の再取得を任せる
        onDeleted?.();
      } else {
        showToast("削除に失敗しました。", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="danger"
      onClick={handleDelete}
      size="md"
      disabled={isDeleting}
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
      <span className="sr-only sm:not-sr-only">
        {isDeleting ? "削除中..." : "削除"}
      </span>
    </Button>
  );
};

export default DeleteButton;
