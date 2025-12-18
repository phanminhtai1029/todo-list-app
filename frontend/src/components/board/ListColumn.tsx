import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useListStore } from "@/store/listStore";
import { CardItem } from "./CardItem";
import { List } from "@/types";
import toast from "react-hot-toast";

interface ListColumnProps {
  list: List;
  onCreateCard: (listId: string) => void;
  isFocused?: boolean;
  focusedCardIndex?: number;
}

export const ListColumn = ({
  list,
  onCreateCard,
  isFocused = false,
  focusedCardIndex = -1,
}: ListColumnProps) => {
  const { updateList, deleteList } = useListStore();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdateTitle = async () => {
    if (title.trim() && title !== list.title) {
      try {
        await updateList(list.id, { title: title.trim() });
        toast.success("List updated");
      } catch (error) {
        toast.error("Failed to update list");
      }
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${list.title}" and all its cards?`)) {
      try {
        await deleteList(list.id);
        toast.success("List deleted");
      } catch (error) {
        toast.error("Failed to delete list");
      }
    }
    setShowMenu(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-72">
      <div
        className={`rounded-lg p-3 shadow-md transition-all ${
          isFocused
            ? "bg-blue-50 ring-2 ring-blue-400 ring-offset-2"
            : "bg-gray-100"
        }`}
      >
        {/* List Header */}
        <div className="flex items-center justify-between mb-3">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateTitle();
                if (e.key === "Escape") {
                  setTitle(list.title);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className="flex-1 px-2 py-1 border border-blue-500 rounded outline-none"
            />
          ) : (
            <div className="flex items-center space-x-2 flex-1">
              <h3
                {...attributes}
                {...listeners}
                className="font-semibold text-gray-800 cursor-grab active:cursor-grabbing"
              >
                {list.title}
              </h3>
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                {list.cards.length} {list.cards.length === 1 ? "card" : "cards"}
              </span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600 hover:bg-gray-200 p-1 rounded"
            >
              ⋮
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg py-2 z-10 w-40">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <SortableContext
          items={list.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[100px]">
            {list.cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <svg
                  className="w-12 h-12 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm text-center">No cards yet</p>
                <p className="text-xs text-center mt-1">
                  Click "+ Add Card" below
                </p>
              </div>
            ) : (
              list.cards.map((card, index) => (
                <CardItem
                  key={card.id}
                  card={card}
                  isFocused={isFocused && index === focusedCardIndex}
                />
              ))
            )}
          </div>
        </SortableContext>

        {/* Add Card Button */}
        <button
          onClick={() => onCreateCard(list.id)}
          className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition text-sm font-medium"
        >
          + Add Card
        </button>
      </div>
    </div>
  );
};
