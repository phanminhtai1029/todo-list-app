import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useBoardStore } from "@/store/boardStore";
import { useListStore } from "@/store/listStore";
import { useCardStore } from "@/store/cardStore";
import toast from "react-hot-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ListColumn } from "@/components/board/ListColumn";
import { CardItem } from "@/components/board/CardItem";
import { CreateListModal } from "@/components/board/CreateListModal";
import { CreateCardModal } from "@/components/board/CreateCardModal";
import { ViewCardModal } from "@/components/board/ViewCardModal";
import { List, Card } from "@/types";

export const BoardDetailPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { boards, currentBoard, setCurrentBoard } = useBoardStore();
  const { lists, fetchLists, reorderLists } = useListStore();
  const { moveCard, reorderCards } = useCardStore();

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Keyboard navigation state
  const [focusedListIndex, setFocusedListIndex] = useState<number>(-1);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(-1);

  // Card view modal state
  const [viewingCardId, setViewingCardId] = useState<string | null>(null);
  const [showViewCardModal, setShowViewCardModal] = useState(false);

  // Get current viewing card from lists (always fresh data)
  const viewingCard = viewingCardId
    ? lists.flatMap((l) => l.cards).find((c) => c.id === viewingCardId) || null
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (boardId) {
      loadBoardData();
    }
  }, [boardId]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = ["INPUT", "TEXTAREA"].includes(target.tagName);

      // "/" - Focus search (don't trigger if already in an input)
      if (e.key === "/" && !isInputFocused) {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }

      // "Escape" - Close modals or clear search or unfocus
      if (e.key === "Escape") {
        if (showViewCardModal) {
          // Close view card modal
          setShowViewCardModal(false);
          setViewingCardId(null);
        } else if (showCreateCardModal || showCreateListModal) {
          // Close modals
          setShowCreateCardModal(false);
          setShowCreateListModal(false);
          setSelectedListId(null);
        } else if (showShortcutsHelp) {
          // Close shortcuts help
          setShowShortcutsHelp(false);
        } else if (searchQuery) {
          // Clear search if no modal is open (works even when search input is focused)
          setSearchQuery("");
          // Also blur the search input to remove focus
          if (target.id === "search-input") {
            (target as HTMLInputElement).blur();
          }
        } else if (focusedListIndex >= 0 || focusedCardIndex >= 0) {
          // Clear keyboard navigation focus
          setFocusedListIndex(-1);
          setFocusedCardIndex(-1);
        }
      }

      // "Space" - Open view card modal for focused card
      if (
        e.key === " " &&
        !isInputFocused &&
        !showViewCardModal &&
        !showCreateCardModal &&
        !showCreateListModal &&
        focusedListIndex >= 0 &&
        focusedCardIndex >= 0
      ) {
        e.preventDefault();
        const currentList = lists[focusedListIndex];
        if (currentList && currentList.cards[focusedCardIndex]) {
          setViewingCardId(currentList.cards[focusedCardIndex].id);
          setShowViewCardModal(true);
        }
      }

      // "n" or "N" - Create new card in focused list or first list
      if (
        (e.key === "n" || e.key === "N") &&
        !isInputFocused &&
        !showCreateCardModal &&
        !showCreateListModal
      ) {
        e.preventDefault();
        if (lists.length > 0) {
          // Use focused list if available, otherwise use first list
          const targetListIndex =
            focusedListIndex >= 0 && focusedListIndex < lists.length
              ? focusedListIndex
              : 0;
          setSelectedListId(lists[targetListIndex].id);
          setShowCreateCardModal(true);
        } else {
          toast.error("Create a list first before adding cards");
        }
      }

      // "c" or "C" - Create new list
      if (
        (e.key === "c" || e.key === "C") &&
        !isInputFocused &&
        !showCreateCardModal &&
        !showCreateListModal
      ) {
        e.preventDefault();
        setShowCreateListModal(true);
      }

      // Arrow Left - Move focus to previous list
      if (e.key === "ArrowLeft" && !isInputFocused && !showViewCardModal) {
        e.preventDefault();
        if (lists.length > 0) {
          setFocusedListIndex((prev) => {
            const newIndex = prev <= 0 ? lists.length - 1 : prev - 1;
            return newIndex;
          });
          setFocusedCardIndex(0); // Reset to first card in new list
        }
      }

      // Arrow Right - Move focus to next list
      if (e.key === "ArrowRight" && !isInputFocused && !showViewCardModal) {
        e.preventDefault();
        if (lists.length > 0) {
          setFocusedListIndex((prev) => {
            const newIndex = prev >= lists.length - 1 ? 0 : prev + 1;
            return newIndex;
          });
          setFocusedCardIndex(0); // Reset to first card in new list
        }
      }

      // Arrow Up - Move focus to previous card in current list
      if (e.key === "ArrowUp" && !isInputFocused && !showViewCardModal) {
        e.preventDefault();
        if (focusedListIndex >= 0 && focusedListIndex < lists.length) {
          const currentList = lists[focusedListIndex];
          if (currentList.cards.length > 0) {
            setFocusedCardIndex((prev) => {
              return prev <= 0 ? currentList.cards.length - 1 : prev - 1;
            });
          }
        } else if (lists.length > 0) {
          // Auto-focus first list if no list is focused
          setFocusedListIndex(0);
          setFocusedCardIndex(0);
        }
      }

      // Arrow Down - Move focus to next card in current list
      if (e.key === "ArrowDown" && !isInputFocused && !showViewCardModal) {
        e.preventDefault();
        if (focusedListIndex >= 0 && focusedListIndex < lists.length) {
          const currentList = lists[focusedListIndex];
          if (currentList.cards.length > 0) {
            setFocusedCardIndex((prev) => {
              return prev >= currentList.cards.length - 1 ? 0 : prev + 1;
            });
          }
        } else if (lists.length > 0) {
          // Auto-focus first list if no list is focused
          setFocusedListIndex(0);
          setFocusedCardIndex(0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    showCreateCardModal,
    showCreateListModal,
    showViewCardModal,
    showShortcutsHelp,
    searchQuery,
    lists,
    focusedListIndex,
    focusedCardIndex,
  ]);

  const loadBoardData = async () => {
    if (!boardId) return;

    try {
      // Find board from existing boards or fetch
      const board = boards.find((b) => b.id === boardId);
      if (board) {
        setCurrentBoard(board);
      }

      // Fetch lists and cards
      await fetchLists(boardId);
    } catch (error) {
      toast.error("Failed to load board");
      navigate("/boards");
    }
  };

  const filteredLists = lists.map((list) => ({
    ...list,
    cards: list.cards.filter((card) =>
      card.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Find the card being dragged
    for (const list of lists) {
      const card = list.cards.find((c) => c.id === active.id);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging a card
    const activeCard = lists
      .flatMap((l) => l.cards)
      .find((c) => c.id === activeId);

    if (activeCard) {
      // Card drag
      const sourceList = lists.find((l) =>
        l.cards.some((c) => c.id === activeId)
      );
      const targetList = lists.find(
        (l) => l.id === overId || l.cards.some((c) => c.id === overId)
      );

      if (!sourceList || !targetList) return;

      if (sourceList.id === targetList.id) {
        // Reorder within same list
        const oldIndex = sourceList.cards.findIndex((c) => c.id === activeId);
        const newIndex = sourceList.cards.findIndex((c) => c.id === overId);

        if (oldIndex !== newIndex) {
          const newCards = [...sourceList.cards];
          const [movedCard] = newCards.splice(oldIndex, 1);
          newCards.splice(newIndex, 0, movedCard);

          const cardOrders: Record<string, number> = {};
          newCards.forEach((card, index) => {
            cardOrders[card.id] = index;
          });

          try {
            await reorderCards(sourceList.id, cardOrders);
          } catch (error) {
            toast.error("Failed to reorder cards");
          }
        }
      } else {
        // Move to different list
        const targetCardIndex = targetList.cards.findIndex(
          (c) => c.id === overId
        );
        const newOrder =
          targetCardIndex >= 0 ? targetCardIndex : targetList.cards.length;

        try {
          await moveCard(activeId, {
            target_list_id: targetList.id,
            new_order: newOrder,
          });
          toast.success("Card moved successfully");
        } catch (error) {
          toast.error("Failed to move card");
        }
      }
    } else {
      // List drag
      const oldIndex = lists.findIndex((l) => l.id === activeId);
      const newIndex = lists.findIndex((l) => l.id === overId);

      if (oldIndex !== newIndex && boardId) {
        const newLists = [...lists];
        const [movedList] = newLists.splice(oldIndex, 1);
        newLists.splice(newIndex, 0, movedList);

        const listOrders: Record<string, number> = {};
        newLists.forEach((list, index) => {
          listOrders[list.id] = index;
        });

        try {
          await reorderLists(boardId, listOrders);
        } catch (error) {
          toast.error("Failed to reorder lists");
        }
      }
    }
  };

  const handleCreateCard = (listId: string) => {
    setSelectedListId(listId);
    setShowCreateCardModal(true);
  };

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: currentBoard.background_color }}
    >
      {/* Navigation Bar */}
      <nav className="bg-black bg-opacity-20 backdrop-blur-sm">
        <div className="max-w-full px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 sm:py-0 sm:h-16 space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate("/boards")}
                className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition"
              >
                ← Back
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate max-w-[150px] sm:max-w-none">
                  {currentBoard.title}
                </h1>

                {/* Board Statistics */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                    <span className="text-white text-xs sm:text-sm">📋</span>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {lists.length}
                    </span>
                    <span className="hidden sm:inline text-white text-xs opacity-80">
                      {lists.length === 1 ? "list" : "lists"}
                    </span>
                  </div>

                  <div className="bg-white bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                    <span className="text-white text-xs sm:text-sm">🎴</span>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {lists.reduce(
                        (total, list) => total + list.cards.length,
                        0
                      )}
                    </span>
                    <span className="hidden sm:inline text-white text-xs opacity-80">
                      {lists.reduce(
                        (total, list) => total + list.cards.length,
                        0
                      ) === 1
                        ? "card"
                        : "cards"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-auto sm:ml-4">
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search cards..."
                  className="bg-white bg-opacity-20 backdrop-blur-sm text-white placeholder-white placeholder-opacity-70 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-full sm:w-64 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-red-300 transition"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* ← THÊM search results indicator */}
              {searchQuery && (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs">
                    {filteredLists.reduce(
                      (total, list) => total + list.cards.length,
                      0
                    )}{" "}
                    results
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-white">Hi, {user?.username}!</span>

              {/* Keyboard Shortcuts Help Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition flex items-center space-x-1"
                  title="Keyboard Shortcuts"
                >
                  <span className="text-sm">⌨️</span>
                  <span className="text-xs">Shortcuts</span>
                </button>

                {/* Shortcuts Help Tooltip */}
                {showShortcutsHelp && (
                  <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl p-4 w-64 z-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800">
                        ⌨️ Keyboard Shortcuts
                      </h3>
                      <button
                        onClick={() => setShowShortcutsHelp(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">Search cards</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          /
                        </kbd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">New card</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          N
                        </kbd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">New list</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          C
                        </kbd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">Navigate lists</span>
                        <div className="flex space-x-1">
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            ←
                          </kbd>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            →
                          </kbd>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">Navigate cards</span>
                        <div className="flex space-x-1">
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            ↑
                          </kbd>
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            ↓
                          </kbd>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">Unfocus/Close</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          Esc
                        </kbd>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Board Content */}
      <div className="p-4 overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-3 sm:space-x-4 pb-4 px-2 sm:px-0">
            <SortableContext
              items={filteredLists.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {filteredLists.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20 px-4">
                  <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-6 sm:p-8 max-w-md text-center shadow-lg w-full">
                    <svg
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                      No lists yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Get started by creating your first list to organize your
                      tasks
                    </p>
                    <button
                      onClick={() => setShowCreateListModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg transition font-medium text-sm sm:text-base"
                    >
                      + Create Your First List
                    </button>
                    <p className="text-xs text-gray-500 mt-3 hidden sm:block">
                      Or press{" "}
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        C
                      </kbd>{" "}
                      on your keyboard
                    </p>
                  </div>
                </div>
              ) : (
                filteredLists.map((list, index) => (
                  <ListColumn
                    key={list.id}
                    list={list}
                    onCreateCard={handleCreateCard}
                    isFocused={index === focusedListIndex}
                    focusedCardIndex={
                      index === focusedListIndex ? focusedCardIndex : -1
                    }
                  />
                ))
              )}
            </SortableContext>

            {/* Add List Button - only show if there are already lists */}
            {filteredLists.length > 0 && (
              <div className="flex-shrink-0 w-72">
                <button
                  onClick={() => setShowCreateListModal(true)}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-4 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <span className="text-2xl">+</span>
                  <span className="font-semibold">Add List</span>
                </button>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3 opacity-90">
                <CardItem card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      <CreateListModal
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        boardId={boardId!}
      />

      <CreateCardModal
        isOpen={showCreateCardModal}
        onClose={() => {
          setShowCreateCardModal(false);
          setSelectedListId(null);
        }}
        listId={selectedListId}
      />

      <ViewCardModal
        isOpen={showViewCardModal}
        onClose={() => {
          setShowViewCardModal(false);
          setViewingCardId(null);
        }}
        card={viewingCard}
        onEdit={() => {
          setShowViewCardModal(false);
          setViewingCardId(null);
          // Could open edit mode here if needed
        }}
      />
    </div>
  );
};
