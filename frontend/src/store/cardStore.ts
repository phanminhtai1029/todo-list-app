import { create } from "zustand";
import { api } from "@/services/api";
import { API_ENDPOINTS } from "@/config/constants";
import { CardState, Card, CardCreate, CardUpdate, CardMove } from "@/types";
import { useListStore } from "./listStore";

export const useCardStore = create<CardState>((set) => ({
  isLoading: false,
  error: null,

  createCard: async (listId: string, data: CardCreate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Card>(
        `${API_ENDPOINTS.CARDS}/${listId}`,
        data
      );
      const newCard = response.data;

      // Update list store
      useListStore.setState((state) => ({
        lists: state.lists.map((list) =>
          list.id === listId
            ? { ...list, cards: [...list.cards, newCard] }
            : list
        ),
      }));

      set({ isLoading: false });
      return newCard;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to create card";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateCard: async (cardId: string, data: CardUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put<Card>(
        `${API_ENDPOINTS.CARDS}/${cardId}`,
        data
      );
      const updatedCard = response.data;

      // Update list store
      useListStore.setState((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId ? updatedCard : card
          ),
        })),
      }));

      set({ isLoading: false });
      return updatedCard;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to update card";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteCard: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`${API_ENDPOINTS.CARDS}/${cardId}`);

      // Update list store
      useListStore.setState((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        })),
      }));

      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete card";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  moveCard: async (cardId: string, data: CardMove) => {
    try {
      const response = await api.post<Card>(
        `${API_ENDPOINTS.CARDS}/${cardId}/move`,
        data
      );
      const movedCard = response.data;

      // Update list store - remove from old list, add to new list
      useListStore.setState((state) => ({
        lists: state.lists.map((list) => {
          // Remove from all lists first
          const filteredCards = list.cards.filter((card) => card.id !== cardId);

          // Add to target list
          if (list.id === data.target_list_id) {
            return {
              ...list,
              cards: [...filteredCards, movedCard].sort(
                (a, b) => a.order - b.order
              ),
            };
          }

          return { ...list, cards: filteredCards };
        }),
      }));

      return movedCard;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to move card";
      set({ error: errorMessage });
      throw error;
    }
  },

  reorderCards: async (listId: string, cardOrders: Record<string, number>) => {
    try {
      await api.post(`${API_ENDPOINTS.CARDS}/${listId}/reorder`, {
        card_orders: cardOrders,
      });

      // Update list store
      useListStore.setState((state) => ({
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                cards: list.cards
                  .map((card) => ({
                    ...card,
                    order: cardOrders[card.id] ?? card.order,
                  }))
                  .sort((a, b) => a.order - b.order),
              }
            : list
        ),
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to reorder cards";
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
