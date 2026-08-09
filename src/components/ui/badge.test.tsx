import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhaseBadge, StatusBadge, TierBadge } from "@/components/ui/badge";

describe("PhaseBadge", () => {
  it("renders the phase text", () => {
    render(<PhaseBadge phase="Ready" />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
  it("shows pending for an empty phase", () => {
    render(<PhaseBadge phase="" />);
    expect(screen.getByText("pending")).toBeInTheDocument();
  });
});

describe("StatusBadge", () => {
  it("renders the value", () => {
    render(<StatusBadge value="production" />);
    expect(screen.getByText("production")).toBeInTheDocument();
  });
});

describe("TierBadge", () => {
  it("renders the tier label", () => {
    render(<TierBadge tier={1} />);
    expect(screen.getByText("tier 1")).toBeInTheDocument();
  });
});
