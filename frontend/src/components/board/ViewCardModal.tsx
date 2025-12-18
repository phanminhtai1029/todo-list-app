import { useState, useEffect, useCallback } from "react";
import { useCardStore } from "@/store/cardStore";
import { Card, ChecklistItem } from "@/types";
import toast from "react-hot-toast";

interface ViewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  onEdit: () => void;
}

const LABEL_COLORS: Record<string, { bg: string; text: string; name: string }> =
  {
    red: { bg: "bg-red-500", text: "text-white", name: "Urgent" },
    yellow: { bg: "bg-yellow-400", text: "text-gray-800", name: "Warning" },
    green: { bg: "bg-green-500", text: "text-white", name: "Complete" },
    blue: { bg: "bg-blue-500", text: "text-white", name: "Info" },
    purple: { bg: "bg-purple-500", text: "text-white", name: "Feature" },
    orange: { bg: "bg-orange-500", text: "text-white", name: "Bug" },
  };

// Format due date display
const formatDueDate = (dueDate: string | undefined) => {
  if (!dueDate) return null;

  let utcString = dueDate;
  if (
    !dueDate.endsWith("Z") &&
    !dueDate.includes("+") &&
    !dueDate.includes("-", 10)
  ) {
    utcString = dueDate + "Z";
  }

  const due = new Date(utcString);
  const now = new Date();

  if (isNaN(due.getTime())) return "Invalid date";

  const day = String(due.getDate()).padStart(2, "0");
  const month = String(due.getMonth() + 1).padStart(2, "0");
  const year = due.getFullYear();
  const hours = String(due.getHours()).padStart(2, "0");
  const minutes = String(due.getMinutes()).padStart(2, "0");

  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const diffMs = dueDay.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

  if (diffDays < 0) return `Overdue (${formattedDate})`;
  if (diffDays === 0) return `Today ${hours}:${minutes}`;
  if (diffDays === 1) return `Tomorrow ${hours}:${minutes}`;
  if (diffDays <= 7)
    return `${diffDays} days (${day}/${month} ${hours}:${minutes})`;
  return formattedDate;
};

const getDueDateColor = (dueDate: string | undefined) => {
  if (!dueDate) return "";

  let utcString = dueDate;
  if (
    !dueDate.endsWith("Z") &&
    !dueDate.includes("+") &&
    !dueDate.includes("-", 10)
  ) {
    utcString = dueDate + "Z";
  }

  const due = new Date(utcString);
  const now = new Date();

  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const diffMs = dueDay.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || diffDays === 0) return "text-red-600";
  if (diffDays === 1) return "text-yellow-600";
  return "text-green-600";
};

export const ViewCardModal = ({
  isOpen,
  onClose,
  card,
  onEdit,
}: ViewCardModalProps) => {
  const { updateCard } = useCardStore();
  const [focusedChecklistIndex, setFocusedChecklistIndex] =
    useState<number>(-1);

  // Reset focused index when modal opens
  useEffect(() => {
    if (isOpen) {
      setFocusedChecklistIndex(-1);
    }
  }, [isOpen]);

  // Handle checklist toggle
  const handleChecklistToggle = useCallback(
    async (itemId: string) => {
      if (!card) return;

      const updatedChecklist = card.checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      try {
        await updateCard(card.id, {
          checklist: updatedChecklist,
        });
        // Toast success is optional since it's a quick action
      } catch (error) {
        toast.error("Failed to update checklist");
      }
    },
    [card, updateCard]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !card) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // X or ESC to close modal
      if (e.key === "x" || e.key === "X" || e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Only handle arrow keys and space if there are checklist items
      if (!card.checklist || card.checklist.length === 0) return;

      // Arrow Down: Navigate to next checklist item
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedChecklistIndex((prev) => {
          if (prev < card.checklist.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }

      // Arrow Up: Navigate to previous checklist item
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedChecklistIndex((prev) => {
          if (prev > 0) {
            return prev - 1;
          }
          return prev;
        });
      }

      // Space: Toggle focused checklist item
      if (e.key === " " && focusedChecklistIndex >= 0) {
        e.preventDefault();
        const item = card.checklist[focusedChecklistIndex];
        if (item) {
          handleChecklistToggle(item.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, card, focusedChecklistIndex, onClose, handleChecklistToggle]);

  if (!isOpen || !card) return null;

  const completedCount = card.checklist.filter((item) => item.completed).length;
  const totalCount = card.checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {card.title}
              </h2>

              {/* Labels */}
              {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                  {card.labels.map((label) => {
                    const color = LABEL_COLORS[label];
                    return (
                      <span
                        key={label}
                        className={`${color.bg} ${color.text} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium`}
                      >
                        {color.name}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Due Date */}
              {card.due_date && (
                <div
                  className={`flex items-center space-x-2 ${getDueDateColor(
                    card.due_date
                  )}`}
                >
                  <span className="text-sm">📅</span>
                  <span className="text-sm font-semibold">
                    {formatDueDate(card.due_date)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {/* Description */}
          {card.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                📝 Description
              </h3>
              <p className="text-sm sm:text-base text-gray-600 whitespace-pre-wrap">
                {card.description}
              </p>
            </div>
          )}

          {/* Checklist */}
          {card.checklist && card.checklist.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  ✅ Checklist
                </h3>
                <span className="text-sm text-gray-500">
                  {completedCount}/{totalCount} completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                {card.checklist.map((item, index) => (
                  <label
                    key={item.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition ${
                      focusedChecklistIndex === index
                        ? "bg-blue-100 ring-2 ring-blue-400"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleChecklistToggle(item.id)}
                      className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                    />
                    <span
                      className={`flex-1 ${
                        item.completed
                          ? "line-through text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Empty state when no checklist */}
          {(!card.checklist || card.checklist.length === 0) &&
            !card.description && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No additional details</p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between">
          <button
            onClick={onEdit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            ✏️ Edit Card
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 rounded-lg transition font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
