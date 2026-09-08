import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth-client", () => ({
  registerWithPassword: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithPassword: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
}));

vi.mock("@/lib/favorites", () => ({
  hydrateFavoritesFromServer: vi.fn(),
}));

vi.mock("@/lib/google-identity", () => ({
  getGoogleIdentityApi: vi.fn(),
  requestGoogleCredential: vi.fn(),
}));

import { LoginPanel } from "@/components/ui/LoginPanel";

describe("LoginPanel", () => {
  it("opens directly on the returning traveler form and keeps registration at the bottom", () => {
    render(<LoginPanel />);

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.queryByText("Continue browsing")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });
});
