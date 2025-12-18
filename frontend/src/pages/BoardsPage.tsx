import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useBoardStore } from "@/store/boardStore";
import toast from "react-hot-toast";
import { Board } from "@/types";
import { CreateBoardModal } from "@/components/board/CreateBoardModal";
import { UpdateBoardModal } from "@/components/board/UpdateBoardModal";

export const BoardsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { boards, isLoading, fetchBoards, deleteBoard } = useBoardStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      await fetchBoards();
    } catch (error) {
      toast.error("Failed to load boards");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleDeleteClick = (board: Board) => {
    setSelectedBoard(board);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBoard) return;

    try {
      await deleteBoard(selectedBoard.id);
      toast.success("Board deleted successfully");
      setShowDeleteModal(false);
      setSelectedBoard(null);
    } catch (error) {
      toast.error("Failed to delete board");
    }
  };

  const handleUpdateClick = (board: Board) => {
    setSelectedBoard(board);
    setShowUpdateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">
                🎯 Todo-List
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hi, {user?.username}!</span>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Boards</h1>
            <p className="text-gray-600 mt-1">
              {boards.length} of 7 boards created
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={boards.length >= 7}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Create Board</span>
          </button>
        </div>

        {/* Boards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-lg animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No boards yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first board to get started!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Create Your First Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => navigate(`/boards/${board.id}`)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Board Header with Color */}
                <div
                  className="h-24 p-4 flex items-end"
                  style={{ backgroundColor: board.background_color }}
                >
                  <h3 className="text-white text-xl font-bold drop-shadow-lg">
                    {board.title}
                  </h3>
                </div>

                {/* Board Content */}
                <div className="p-4">
                  {board.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {board.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>
                      Created {new Date(board.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateClick(board);
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition text-sm font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(board);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition text-sm font-semibold"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Max boards warning */}
        {boards.length >= 7 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-semibold">
              ⚠️ You've reached the maximum of 7 boards. Delete a board to
              create a new one.
            </p>
          </div>
        )}
      </div>
      {/* Create Modal */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Update Modal */}
      <UpdateBoardModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedBoard(null);
        }}
        board={selectedBoard}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">
              Delete Board?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "
              <strong>{selectedBoard.title}</strong>"? This action cannot be
              undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBoard(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
