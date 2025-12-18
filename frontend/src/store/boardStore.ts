import { create } from "zustand";
import { api } from "@/services/api";
import { API_ENDPOINTS } from "@/config/constants";
import {
  BoardState,
  Board,
  BoardCreate,
  BoardUpdate,
  BoardListResponse,
} from "@/types";

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,

  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<BoardListResponse>(API_ENDPOINTS.BOARDS);
      set({ boards: response.data.boards, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to fetch boards";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createBoard: async (data: BoardCreate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Board>(API_ENDPOINTS.BOARDS, data);
      const newBoard = response.data;

      // Add new board to state
      set((state) => ({
        boards: [...state.boards, newBoard],
        isLoading: false,
      }));

      return newBoard;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to create board";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateBoard: async (id: string, data: BoardUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Board>(
        `${API_ENDPOINTS.BOARDS}/${id}`,
        data
      );
      const updatedBoard = response.data;

      // Update board in state
      set((state) => ({
        boards: state.boards.map((board) =>
          board.id === id ? updatedBoard : board
        ),
        currentBoard:
          state.currentBoard?.id === id ? updatedBoard : state.currentBoard,
        isLoading: false,
      }));

      return updatedBoard;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to update board";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteBoard: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`${API_ENDPOINTS.BOARDS}/${id}`);

      // Remove board from state
      set((state) => ({
        boards: state.boards.filter((board) => board.id !== id),
        currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete board";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setCurrentBoard: (board: Board | null) => {
    set({ currentBoard: board });
  },

  clearError: () => {
    set({ error: null });
  },
}));
