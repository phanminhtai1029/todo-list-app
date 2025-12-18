import { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCardStore } from "@/store/cardStore";
import { Card } from "@/types";
import toast from "react-hot-toast";
import { ViewCardModal } from "./ViewCardModal";

interface CardItemProps {
  card: Card;
  isFocused?: boolean;
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

const AVAILABLE_LABELS = ["red", "yellow", "green", "blue", "purple", "orange"];

// Helper to convert UTC ISO string to local dd/mm/yyyy HH:mm format
const formatDateForInput = (isoString: string): string => {
  // Backend should send UTC time with Z: "2025-12-16T08:00:00Z"
  // But if it doesn't have Z, we need to handle it

  let utcString = isoString;

  // If no Z suffix, assume it's UTC and add Z
  if (
    !isoString.endsWith("Z") &&
    !isoString.includes("+") &&
    !isoString.includes("-", 10)
  ) {
    utcString = isoString + "Z";
    console.warn("⚠️ Backend returned ISO without Z, assuming UTC:", isoString);
  }

  const date = new Date(utcString); // Browser automatically converts UTC to local

  if (isNaN(date.getTime())) {
    console.error("❌ Invalid ISO string:", isoString);
    return "";
  }

  // Get LOCAL time components (browser handles timezone conversion)
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const result = `${day}/${month}/${year} ${hours}:${minutes}`;

  console.log("📥 UTC from backend:", isoString);
  console.log(
    "🌍 User timezone:",
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  console.log("📤 Local formatted:", result);

  return result;
};

// Helper function to get due date color
const getDueDateColor = (dueDate: string | undefined) => {
  if (!dueDate) return null;

  // Handle ISO string without Z
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

  if (isNaN(due.getTime())) {
    return null;
  }

  // Reset time to compare only dates
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "text-red-600 font-semibold"; // Overdue
  if (diffDays === 0) return "text-red-500 font-semibold"; // Due today
  if (diffDays === 1) return "text-yellow-600 font-semibold"; // Due tomorrow
  return "text-green-600"; // Future
};

// Helper function to format due date (dd/mm/yyyy HH:mm)
const formatDueDate = (dueDate: string | undefined) => {
  if (!dueDate) return null;

  // Handle ISO string without Z - add Z to ensure UTC parsing
  let utcString = dueDate;
  if (
    !dueDate.endsWith("Z") &&
    !dueDate.includes("+") &&
    !dueDate.includes("-", 10)
  ) {
    utcString = dueDate + "Z";
  }

  const due = new Date(utcString); // Parse as UTC, browser converts to local
  const now = new Date();

  if (isNaN(due.getTime())) {
    console.error("❌ Invalid date in formatDueDate:", dueDate);
    return "Invalid date";
  }

  // Reset time to compare only dates
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Format: dd/mm/yyyy HH:mm (24h) - using LOCAL time
  const day = String(due.getDate()).padStart(2, "0");
  const month = String(due.getMonth() + 1).padStart(2, "0");
  const year = due.getFullYear();
  const hours = String(due.getHours()).padStart(2, "0");
  const minutes = String(due.getMinutes()).padStart(2, "0");
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return `Overdue ${absDays} ${
      absDays === 1 ? "day" : "days"
    } (${formattedDate})`;
  }
  if (diffDays === 0) return `Today ${hours}:${minutes}`;
  if (diffDays === 1) return `Tomorrow ${hours}:${minutes}`;
  if (diffDays <= 7)
    return `${diffDays} days (${day}/${month} ${hours}:${minutes})`;
  return formattedDate; // Full date for far future
};

export const CardItem = memo(({ card, isFocused = false }: CardItemProps) => {
  const { updateCard, deleteCard } = useCardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formData, setFormData] = useState({
    title: card.title,
    description: card.description || "",
    labels: card.labels || [],
    due_date: card.due_date ? formatDateForInput(card.due_date) : "",
    checklist: card.checklist || [],
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdate = async () => {
    if (formData.title.trim()) {
      // Parse custom date format: dd/mm/yyyy HH:mm
      let parsedDueDate: string | undefined = undefined;

      if (formData.due_date && formData.due_date.trim()) {
        const match = formData.due_date.match(
          /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/
        );

        if (match) {
          const [, day, month, year, hours, minutes] = match;

          // Create date object in LOCAL timezone
          const localDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes)
          );

          if (isNaN(localDate.getTime())) {
            toast.error("Invalid date. Please check day/month/year values.");
            return;
          }

          // Convert to UTC ISO string
          parsedDueDate = localDate.toISOString();
        } else {
          toast.error("Invalid date format. Use dd/mm/yyyy HH:mm");
          return;
        }
      }

      try {
        await updateCard(card.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          labels: formData.labels,
          due_date: parsedDueDate,
          checklist: formData.checklist,
        });
        toast.success("Card updated");
      } catch (error) {
        toast.error("Failed to update card");
      }
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${card.title}"?`)) {
      try {
        await deleteCard(card.id);
        toast.success("Card deleted");
      } catch (error) {
        toast.error("Failed to delete card");
      }
    }
    setShowMenu(false);
  };

  const toggleLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-3 shadow border border-blue-500">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Card title"
          className="w-full px-2 py-1 border border-gray-300 rounded mb-2 outline-none"
        />
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Description (optional)"
          rows={2}
          className="w-full px-2 py-1 border border-gray-300 rounded mb-2 outline-none resize-none"
        />

        {/* Label Selector */}
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">Labels:</label>
          <div className="flex flex-wrap gap-1">
            {AVAILABLE_LABELS.map((label) => {
              const color = LABEL_COLORS[label];
              const isSelected = formData.labels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={`px-2 py-1 rounded text-xs font-medium transition ${
                    isSelected
                      ? `${color.bg} ${color.text}`
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  {color.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Due Date Picker */}
        {/* Due Date Input */}
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">
            Due Date (dd/mm/yyyy HH:mm):
          </label>
          <input
            type="text"
            value={formData.due_date}
            onChange={(e) =>
              setFormData({ ...formData, due_date: e.target.value })
            }
            placeholder="16/12/2025 14:30"
            pattern="\d{2}/\d{2}/\d{4} \d{2}:\d{2}"
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs outline-none"
          />
        </div>

        {/* Checklist Section */}
        <div className="mb-2">
          <label className="block text-xs text-gray-600 mb-1">
            📋 Checklist:
          </label>
          <div className="space-y-1 mb-2">
            {formData.checklist.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {
                    const updated = [...formData.checklist];
                    updated[index] = {
                      ...item,
                      completed: !item.completed,
                    };
                    setFormData({ ...formData, checklist: updated });
                  }}
                  className="w-4 h-4"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const updated = [...formData.checklist];
                    updated[index] = { ...item, text: e.target.value };
                    setFormData({ ...formData, checklist: updated });
                  }}
                  className={`flex-1 px-2 py-1 border border-gray-300 rounded text-xs outline-none ${
                    item.completed ? "line-through text-gray-500" : ""
                  }`}
                />
                <button
                  onClick={() => {
                    const updated = formData.checklist.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, checklist: updated });
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const newItem = {
                id: Date.now().toString(),
                text: "",
                completed: false,
              };
              setFormData({
                ...formData,
                checklist: [...formData.checklist, newItem],
              });
            }}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 rounded text-xs"
          >
            + Add Checklist Item
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 rounded text-sm"
          >
            Save
          </button>
          <button
            onClick={() => {
              setFormData({
                title: card.title,
                description: card.description || "",
                labels: card.labels || [],
                due_date: card.due_date
                  ? formatDateForInput(card.due_date)
                  : "",
                checklist: card.checklist || [],
              });
              setIsEditing(false);
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setShowViewModal(true)}
      className={`rounded-lg p-3 shadow hover:shadow-md transition cursor-grab active:cursor-grabbing group ${
        isFocused
          ? "bg-yellow-50 ring-2 ring-yellow-400 ring-offset-1"
          : "bg-white"
      }`}
    >
      {/* Labels Display */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => {
            const color = LABEL_COLORS[label];
            return (
              <span
                key={label}
                className={`${color.bg} ${color.text} px-2 py-0.5 rounded-full text-xs font-medium`}
              >
                {color.name}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{card.title}</p>
          {card.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Due Date Display */}
          {card.due_date && (
            <div
              className={`flex items-center space-x-1 mt-2 ${getDueDateColor(
                card.due_date
              )}`}
            >
              <span className="text-xs">📅</span>
              <span className="text-xs font-semibold">
                {formatDueDate(card.due_date)}
              </span>
            </div>
          )}

          {/* Checklist Progress */}
          {card.checklist && card.checklist.length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs">✅</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${
                          (card.checklist.filter((item) => item.completed)
                            .length /
                            card.checklist.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {card.checklist.filter((item) => item.completed).length}/
                    {card.checklist.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ⋮
          </button>

          {showMenu && (
            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg py-2 z-20 w-32">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-xs"
              >
                ✏️ Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-xs text-red-600"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Card Modal */}
      <ViewCardModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        card={card}
        onEdit={() => {
          setShowViewModal(false);
          setIsEditing(true);
        }}
      />
    </div>
  );
});

CardItem.displayName = "CardItem";
