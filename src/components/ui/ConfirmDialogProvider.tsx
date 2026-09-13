"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import Button from "@/components/ui/Button";

type ConfirmOptions = {
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (result: boolean) => void;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | undefined>(
  undefined
);

export const ConfirmDialogProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string) => {
    const opts = typeof options === "string" ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      setPending({ ...opts, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6">
            <p className="text-sm text-gray-800 dark:text-gray-100 mb-6 whitespace-pre-wrap">
              {pending.message}
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleClose(false)}
              >
                {pending.cancelText ?? "キャンセル"}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleClose(true)}
              >
                {pending.confirmText ?? "実行する"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export function useConfirm(): ConfirmContextValue["confirm"] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "useConfirm は ConfirmDialogProvider の内側で使ってください。"
    );
  }
  return ctx.confirm;
}
