import { create } from "zustand";
import { api } from "@/services/api";
import { API_ENDPOINTS } from "@/config/constants";
import { ListState, List, ListCreate, ListUpdate } from "@/types";

export const useListStore = create<ListState>((set, get) => ({
  lists: [],
  isLoading: false,
  error: null,

  fetchLists: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<List[]>(
        `${API_ENDPOINTS.LISTS}/${boardId}`
      );
      set({ lists: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to fetch lists";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createList: async (boardId: string, data: ListCreate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<List>(
        `${API_ENDPOINTS.LISTS}/${boardId}`,
        data
      );
      const newList = { ...response.data, cards: [] };

      set((state) => ({
        lists: [...state.lists, newList],
        isLoading: false,
      }));

      return newList;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to create list";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateList: async (listId: string, data: ListUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<List>(
        `${API_ENDPOINTS.LISTS}/${listId}`,
        data
      );
      const updatedList = response.data;

      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === listId ? { ...updatedList, cards: list.cards } : list
        ),
        isLoading: false,
      }));

      return updatedList;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to update list";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteList: async (listId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`${API_ENDPOINTS.LISTS}/${listId}`);

      set((state) => ({
        lists: state.lists.filter((list) => list.id !== listId),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete list";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  reorderLists: async (boardId: string, listOrders: Record<string, number>) => {
    try {
      await api.post(`${API_ENDPOINTS.LISTS}/${boardId}/reorder`, {
        list_orders: listOrders,
      });

      // Update local state
      set((state) => ({
        lists: state.lists
          .map((list) => ({
            ...list,
            order: listOrders[list.id] ?? list.order,
          }))
          .sort((a, b) => a.order - b.order),
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to reorder lists";
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
