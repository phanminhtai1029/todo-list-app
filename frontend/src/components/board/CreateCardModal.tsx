import { useState, FormEvent } from "react";
import { useCardStore } from "@/store/cardStore";
import toast from "react-hot-toast";

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string | null;
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

export const CreateCardModal = ({
  isOpen,
  onClose,
  listId,
}: CreateCardModalProps) => {
  const { createCard, isLoading } = useCardStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    labels: [] as string[],
    due_date: "",
  });

  const toggleLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!listId || !formData.title.trim()) return;

    // Parse custom date format: dd/mm/yyyy HH:mm
    let parsedDueDate: string | undefined = undefined;

    if (formData.due_date && formData.due_date.trim()) {
      const match = formData.due_date.match(
        /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/
      );

      if (match) {
        const [, day, month, year, hours, minutes] = match;

        // Create date object in LOCAL timezone (user's input is local time)
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

        // Convert local time to UTC ISO string
        // This automatically handles timezone conversion!
        parsedDueDate = localDate.toISOString();

        console.log("📅 User input (local):", formData.due_date);
        console.log("⏰ Local Date object:", localDate);
        console.log("🌍 UTC ISO string:", parsedDueDate);
        console.log(
          "🕐 User timezone offset:",
          -localDate.getTimezoneOffset() / 60,
          "hours"
        );
      } else {
        toast.error(
          "Invalid date format. Use dd/mm/yyyy HH:mm (e.g., 16/12/2025 14:30)"
        );
        return;
      }
    }

    try {
      await createCard(listId, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        labels: formData.labels.length > 0 ? formData.labels : undefined,
        due_date: parsedDueDate,
      });
      toast.success("Card created successfully!");
      setFormData({ title: "", description: "", labels: [], due_date: "" });
      onClose();
    } catch (error: any) {
      console.error("❌ Create card error:", error);
      toast.error(error.response?.data?.detail || "Failed to create card");
    }
  };

  if (!isOpen || !listId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Create New Card
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Card Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              minLength={3}
              maxLength={100}
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Write documentation"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Add more details..."
            />
          </div>

          {/* Label Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labels (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LABELS.map((label) => {
                const color = LABEL_COLORS[label];
                const isSelected = formData.labels.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isSelected
                        ? `${color.bg} ${color.text} ring-2 ring-offset-2 ring-${label}-500`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {color.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date Picker */}
          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Due Date (Optional)
            </label>
            <input
              type="text"
              id="due_date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              placeholder="dd/mm/yyyy HH:mm (e.g., 16/12/2025 14:30)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: dd/mm/yyyy HH:mm (24-hour format)
              <br />
              <span className="text-blue-600">
                Your timezone:{" "}
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                (UTC{new Date().getTimezoneOffset() > 0 ? "-" : "+"}
                {Math.abs(new Date().getTimezoneOffset() / 60)})
              </span>
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Card"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: "",
                  description: "",
                  labels: [],
                  due_date: "",
                });
                onClose();
              }}
              disabled={isLoading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
