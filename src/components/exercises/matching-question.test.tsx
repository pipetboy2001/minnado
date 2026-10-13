// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchingQuestion } from "./matching-question";
import type { MatchingExercise } from "@/types/exercise";

const exercise: MatchingExercise = {
  id: "ex-1",
  type: "matching",
  jlptLevel: "N5",
  skill: "vocabulary",
  promptEs: "Une cada palabra con su significado.",
  pairs: [
    { id: "p1", left: "猫", right: "gato" },
    { id: "p2", left: "犬", right: "perro" },
  ],
};

describe("MatchingQuestion", () => {
  it("renders every pair's left side and a selector for the right side", () => {
    render(
      <MatchingQuestion
        exercise={exercise}
        onChange={vi.fn()}
        revealed={false}
        disabled={false}
      />,
    );

    expect(screen.getByText("猫")).toBeInTheDocument();
    expect(screen.getByText("犬")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });

  it("reports the selected pairing to onChange without touching the others", async () => {
    const onChange = vi.fn();
    render(
      <MatchingQuestion
        exercise={exercise}
        onChange={onChange}
        revealed={false}
        disabled={false}
      />,
    );

    const [firstSelect] = screen.getAllByRole("combobox");
    await userEvent.selectOptions(firstSelect, "gato");

    expect(onChange).toHaveBeenCalledWith({ selections: { p1: "gato" } });
  });

  it("disables every selector when disabled is true", () => {
    render(
      <MatchingQuestion
        exercise={exercise}
        onChange={vi.fn()}
        revealed={false}
        disabled={true}
      />,
    );

    for (const select of screen.getAllByRole("combobox")) {
      expect(select).toBeDisabled();
    }
  });
});
