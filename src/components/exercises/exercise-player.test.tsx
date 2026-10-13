// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExercisePlayer } from "./exercise-player";
import type { Exercise } from "@/types/exercise";

const multipleChoice: Exercise = {
  id: "ex-1",
  type: "multiple-choice",
  jlptLevel: "N5",
  skill: "grammar",
  promptEs: "Elige la partícula correcta.",
  questionJp: "わたし{{1}}がくせいです。",
  options: [
    { id: "a", textJp: "は", isCorrect: true },
    { id: "b", textJp: "を", isCorrect: false },
  ],
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // ExercisePlayer POSTs to /api/attempts on every check, and to
  // /api/lesson-progress + /api/sessions as soon as it runs out of
  // exercises (true even for a lesson with zero exercises — index 0 is
  // already >= length 0 on first render) — stub fetch everywhere so no
  // test accidentally performs a real network call.
  fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ExercisePlayer", () => {
  it("shows a message instead of a player when there are no exercises to show", () => {
    render(<ExercisePlayer exercises={[]} lessonId="n5-lesson-01" />);

    expect(
      screen.getByText(/todavía no tiene ejercicios interactivos/i),
    ).toBeInTheDocument();
  });

  it("grades the selected answer and reports the attempt once checked", async () => {
    render(
      <ExercisePlayer exercises={[multipleChoice]} lessonId="n5-lesson-01" />,
    );

    await userEvent.click(screen.getByRole("button", { name: "は" }));
    await userEvent.click(screen.getByRole("button", { name: "Comprobar" }));

    expect(await screen.findByText("¡Correcto!")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/attempts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          exerciseId: "ex-1",
          isCorrect: true,
          userAnswer: { selectedOptionId: "a" },
        }),
      }),
    );
  });

  it("disables the check button until an answer is picked", () => {
    render(
      <ExercisePlayer exercises={[multipleChoice]} lessonId="n5-lesson-01" />,
    );

    expect(screen.getByRole("button", { name: "Comprobar" })).toBeDisabled();
  });
});
