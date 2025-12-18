import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewCardModal } from "../ViewCardModal";
import { Card } from "@/types";

// Mock stores
vi.mock("@/store/cardStore", () => ({
  useCardStore: () => ({
    updateCard: vi.fn(),
  }),
}));

const mockCard: Card = {
  id: "1",
  title: "Test Card",
  description: "Test Description",
  order: 0,
  list_id: "list1",
  labels: ["green", "yellow"],
  due_date: undefined,
  checklist: [
    { id: "1", text: "Task 1", completed: true },
    { id: "2", text: "Task 2", completed: false },
    { id: "3", text: "Task 3", completed: true },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("ViewCardModal", () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();

  it("should not render when isOpen is false", () => {
    render(
      <ViewCardModal
        isOpen={false}
        onClose={mockOnClose}
        card={mockCard}
        onEdit={mockOnEdit}
      />
    );
    expect(screen.queryByText("Test Card")).not.toBeInTheDocument();
  });

  it("should render card details when open", () => {
    render(
      <ViewCardModal
        isOpen={true}
        onClose={mockOnClose}
        card={mockCard}
        onEdit={mockOnEdit}
      />
    );
    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("should display checklist items", () => {
    render(
      <ViewCardModal
        isOpen={true}
        onClose={mockOnClose}
        card={mockCard}
        onEdit={mockOnEdit}
      />
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });

  it("should show correct checklist completion count", () => {
    render(
      <ViewCardModal
        isOpen={true}
        onClose={mockOnClose}
        card={mockCard}
        onEdit={mockOnEdit}
      />
    );
    expect(screen.getByText("2/3 completed")).toBeInTheDocument();
  });

  it("should call onClose when close button clicked", () => {
    render(
      <ViewCardModal
        isOpen={true}
        onClose={mockOnClose}
        card={mockCard}
        onEdit={mockOnEdit}
      />
    );
    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should call onEdit when edit button clicked", () => {
    render(
      <ViewCardModal
        isOpen={true}
        onClose={mockOnClose}
        card={mockCard}
        onEdit={mockOnEdit}
      />
    );
    const editButton = screen.getByText(/Edit Card/);
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it("should display labels correctly", () => {
    render(
      <ViewCardModal
        isOpen={true}
        onClose={mockOnClose}
        card={mockCard}
        onEdit={mockOnEdit}
      />
    );
    expect(screen.getByText("Complete")).toBeInTheDocument(); // green label
    expect(screen.getByText("Warning")).toBeInTheDocument(); // yellow label
  });
});
