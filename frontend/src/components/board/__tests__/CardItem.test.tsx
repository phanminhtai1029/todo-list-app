import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardItem } from "../CardItem";
import { Card } from "@/types";

// Mock stores
vi.mock("@/store/cardStore", () => ({
  useCardStore: () => ({
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
  }),
}));

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const mockCard: Card = {
  id: "1",
  title: "Test Card",
  description: "Test Description",
  list_id: "list1",
  position: 0,
  labels: ["red", "blue"],
  due_date: undefined,
  checklist: [
    { id: "1", text: "Task 1", completed: false },
    { id: "2", text: "Task 2", completed: true },
  ],
};

describe("CardItem", () => {
  it("should render card title", () => {
    render(<CardItem card={mockCard} />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  it("should display labels", () => {
    render(<CardItem card={mockCard} />);
    expect(screen.getByText("Urgent")).toBeInTheDocument(); // red label
    expect(screen.getByText("Info")).toBeInTheDocument(); // blue label
  });

  it("should show checklist progress", () => {
    render(<CardItem card={mockCard} />);
    expect(screen.getByText("1/2")).toBeInTheDocument(); // 1 completed out of 2
  });

  it("should apply focused styling when focused", () => {
    const { container } = render(<CardItem card={mockCard} isFocused={true} />);
    const cardDiv = container.firstChild as HTMLElement;
    expect(cardDiv.className).toContain("ring-yellow-400");
  });

  it("should not show checklist progress when no checklist", () => {
    const cardWithoutChecklist = { ...mockCard, checklist: [] };
    render(<CardItem card={cardWithoutChecklist} />);
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  it("should show progress bar with correct percentage", () => {
    const { container } = render(<CardItem card={mockCard} />);
    const progressBar = container.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument(); // 1/2 = 50%
  });
});
