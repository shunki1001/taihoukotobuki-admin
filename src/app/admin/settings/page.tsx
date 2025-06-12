"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
// import { PlusIcon, EditIcon, TrashIcon } from '@heroicons/react/solid'; // 例: heroicons
// または lucide-react アイコン
// import { PlusCircle, Edit3, Trash2 } from 'lucide-react';

import {
  fetchIrregularHours,
  updateIrregularHour,
  createIrregularHour,
  deleteIrregularHour,
  IrregularHour,
} from "@/lib/contentfulCalendarApi";

export default function SettingsPage() {
  const [hours, setHours] = useState<IrregularHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [currentId, setCurrentId] = useState<string | null>(null); // 編集中のID。nullなら新規
  const [date, setDate] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [isClosed, setIsClosed] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const loadHours = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchIrregularHours();
      setHours(
        data.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
    } catch (e) {
      console.error("Failed to load irregular hours", e);
      setError("営業時間の読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHours();
  }, []);

  const resetForm = () => {
    setCurrentId(null);
    setDate("");
    setOpenTime("");
    setCloseTime("");
    setIsClosed(false);
    setNotes("");
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const formData = {
        date,
        openTime: isClosed ? undefined : openTime,
        closeTime: isClosed ? undefined : closeTime,
        isClosed,
        notes,
      };
      if (currentId) {
        // Update
        await updateIrregularHour(currentId, formData);
      } else {
        // Create
        await createIrregularHour(formData);
      }
      await loadHours(); // リストを再読み込み
      resetForm();
      alert(
        currentId ? "営業時間を更新しました。" : "営業時間を追加しました。"
      );
    } catch (err) {
      console.error("Form submission error", err);
      alert(currentId ? "更新に失敗しました。" : "追加に失敗しました。");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEdit = (hour: IrregularHour) => {
    setCurrentId(hour.id);
    setDate(hour.date);
    setOpenTime(hour.openTime || "");
    setCloseTime(hour.closeTime || "");
    setIsClosed(hour.isClosed);
    setNotes(hour.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" }); // フォームにスクロール
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("この設定を削除してもよろしいですか？")) {
      try {
        await deleteIrregularHour(id);
        await loadHours();
        alert("削除しました。");
      } catch (err) {
        console.error("Delete error", err);
        alert("削除に失敗しました。");
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-6">
        イレギュラー営業時間設定
      </h1>

      <Card
        title={currentId ? "営業時間編集" : "営業時間 新規追加"}
        className="mb-8"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="対象日"
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmittingForm}
            />
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClosed}
                  onChange={(e) => setIsClosed(e.target.checked)}
                  disabled={isSubmittingForm}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  休業日
                </span>
              </label>
            </div>
          </div>

          {!isClosed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="開店時間 (HH:MM)"
                type="time"
                id="openTime"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                disabled={isSubmittingForm || isClosed}
              />
              <Input
                label="閉店時間 (HH:MM)"
                type="time"
                id="closeTime"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                disabled={isSubmittingForm || isClosed}
              />
            </div>
          )}
          <Input
            label="備考 (例: ランチのみ営業、臨時休業理由など)"
            type="text"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmittingForm}
            placeholder="備考を入力"
          />
          <div className="flex justify-end space-x-2 pt-2">
            {currentId && (
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={isSubmittingForm}
              >
                キャンセル編集
              </Button>
            )}
            <Button type="submit" disabled={isSubmittingForm}>
              {isSubmittingForm
                ? "保存中..."
                : currentId
                ? "更新する"
                : "追加する"}
            </Button>
          </div>
        </form>
      </Card>

      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        設定済み一覧
      </h2>
      {isLoading && (
        <p className="text-gray-600 dark:text-gray-300">読み込み中...</p>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {!isLoading && !error && hours.length === 0 && (
        <p className="text-gray-600 dark:text-gray-300">
          イレギュラー営業日の設定はありません。
        </p>
      )}
      {!isLoading && !error && hours.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  日付
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell"
                >
                  営業時間
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  備考
                </th>
                <th scope="col" className="relative px-4 py-3">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {hours.map((hour) => (
                <tr key={hour.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {hour.date}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                      {hour.isClosed
                        ? "休業"
                        : `${hour.openTime || "未設定"} - ${
                            hour.closeTime || "未設定"
                          }`}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    {hour.isClosed ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100">
                        休業日
                      </span>
                    ) : (
                      `${hour.openTime || "未設定"} - ${
                        hour.closeTime || "未設定"
                      }`
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {hour.notes || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(hour)}
                    >
                      {/* <Edit3 size={16} className="inline mr-1" /> */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline mr-1"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      編集
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(hour.id)}
                    >
                      {/* <Trash2 size={16} className="inline mr-1" /> */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline mr-1"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      削除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
