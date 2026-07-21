import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { PresenterModeProvider } from "@/lib/presenter/PresenterModeContext";
import { PresenterModeToggle } from "./PresenterModeToggle";
import { Explain } from "./Explain";

describe("Explain", () => {
  it("hides children behind a '?' button by default", () => {
    render(
      <PresenterModeProvider>
        <Explain>
          <p>Secret explanation</p>
        </Explain>
      </PresenterModeProvider>
    );
    expect(screen.queryByText("Secret explanation")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show explanation" })).toBeInTheDocument();
  });

  it("reveals children when its own '?' button is clicked, without touching global state", async () => {
    const user = userEvent.setup();
    render(
      <PresenterModeProvider>
        <PresenterModeToggle />
        <Explain>
          <p>Secret explanation</p>
        </Explain>
      </PresenterModeProvider>
    );
    await user.click(screen.getByRole("button", { name: "Show explanation" }));
    expect(screen.getByText("Secret explanation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show Explanations" })).toBeInTheDocument();
  });

  it("reveals children when the global toggle is switched on, with no '?' click needed", async () => {
    const user = userEvent.setup();
    render(
      <PresenterModeProvider>
        <PresenterModeToggle />
        <Explain>
          <p>Secret explanation</p>
        </Explain>
      </PresenterModeProvider>
    );
    await user.click(screen.getByRole("button", { name: "Show Explanations" }));
    expect(screen.getByText("Secret explanation")).toBeInTheDocument();
  });

  it("resets an individually-revealed paragraph back to hidden when the global toggle cycles off again", async () => {
    const user = userEvent.setup();
    render(
      <PresenterModeProvider>
        <PresenterModeToggle />
        <Explain>
          <p>Secret explanation</p>
        </Explain>
      </PresenterModeProvider>
    );
    await user.click(screen.getByRole("button", { name: "Show explanation" }));
    expect(screen.getByText("Secret explanation")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show Explanations" }));
    await user.click(screen.getByRole("button", { name: "Hide Explanations" }));

    expect(screen.queryByText("Secret explanation")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show explanation" })).toBeInTheDocument();
  });
});
