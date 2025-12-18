import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../authStore";

describe("AuthStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("should initialize with default state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should update loading state", () => {
    useAuthStore.setState({ isLoading: true });
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(true);
  });

  it("should set error", () => {
    const errorMessage = "Test error";
    useAuthStore.setState({ error: errorMessage });
    const state = useAuthStore.getState();
    expect(state.error).toBe(errorMessage);
  });

  it("should logout and clear state", () => {
    // Set authenticated state
    useAuthStore.setState({
      user: { 
        id: "1", 
        email: "test@example.com", 
        username: "testuser",
        is_active: true,
        created_at: new Date().toISOString()
      },
      accessToken: "token",
      refreshToken: "refresh",
      isAuthenticated: true,
    });

    // Logout
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
