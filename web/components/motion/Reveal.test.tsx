import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";

describe("Reveal", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <p>Hello</p>
      </Reveal>
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});

describe("RevealGroup / RevealItem", () => {
  it("renders every item in the group", () => {
    render(
      <RevealGroup>
        <RevealItem>
          <p>First</p>
        </RevealItem>
        <RevealItem>
          <p>Second</p>
        </RevealItem>
      </RevealGroup>
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
