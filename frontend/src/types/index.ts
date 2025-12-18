// User types
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

// Board types
export interface Board {
  id: string;
  title: string;
  description?: string;
  background_color: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BoardCreate {
  title: string;
  description?: string;
  background_color?: string;
}

export interface BoardUpdate {
  title?: string;
  description?: string;
  background_color?: string;
}

export interface BoardListResponse {
  boards: Board[];
  total: number;
}

export interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  createBoard: (data: BoardCreate) => Promise<Board>;
  updateBoard: (id: string, data: BoardUpdate) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  setCurrentBoard: (board: Board | null) => void;
  clearError: () => void;
}

// List types (NEW)
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  labels: string[];
  due_date?: string;
  checklist: ChecklistItem[];
  order: number;
  list_id: string;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  title: string;
  order: number;
  board_id: string;
  created_at: string;
  updated_at: string;
  cards: Card[];
}

export interface ListCreate {
  title: string;
  order?: number;
}

export interface ListUpdate {
  title?: string;
  order?: number;
}

export interface ListState {
  lists: List[];
  isLoading: boolean;
  error: string | null;
  fetchLists: (boardId: string) => Promise<void>;
  createList: (boardId: string, data: ListCreate) => Promise<List>;
  updateList: (listId: string, data: ListUpdate) => Promise<List>;
  deleteList: (listId: string) => Promise<void>;
  reorderLists: (
    boardId: string,
    listOrders: Record<string, number>
  ) => Promise<void>;
  clearError: () => void;
}

// Card types (NEW)
export interface CardCreate {
  title: string;
  description?: string;
  labels?: string[];
  due_date?: string;
  checklist?: ChecklistItem[];
  order?: number;
}

export interface CardUpdate {
  title?: string;
  description?: string;
  labels?: string[];
  due_date?: string;
  checklist?: ChecklistItem[];
  order?: number;
}

export interface CardMove {
  target_list_id: string;
  new_order: number;
}

export interface CardState {
  isLoading: boolean;
  error: string | null;
  createCard: (listId: string, data: CardCreate) => Promise<Card>;
  updateCard: (cardId: string, data: CardUpdate) => Promise<Card>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, data: CardMove) => Promise<Card>;
  reorderCards: (
    listId: string,
    cardOrders: Record<string, number>
  ) => Promise<void>;
  clearError: () => void;
}
