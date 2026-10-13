// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpeakingQuestion } from "./speaking-question";
import type { SpeakingExercise } from "@/types/exercise";

const exercise: SpeakingExercise = {
  id: "ex-1",
  type: "speaking",
  jlptLevel: "N5",
  skill: "speaking",
  promptEs: "Pronuncia la siguiente oración en voz alta.",
  targetJp: "私は学生です。",
  translationEs: "Yo soy estudiante.",
};

type ResultEvent = { results: { 0: { transcript: string } }[] };

/** Minimal fake of the browser's SpeechRecognition constructor — just
 * enough to drive the component's start/stop/onresult wiring without a
 * real microphone. Every instance created is tracked so the test can grab
 * it and fire a synthetic result. */
class FakeSpeechRecognition {
  static instances: FakeSpeechRecognition[] = [];
  lang = "";
  interimResults = false;
  maxAlternatives = 1;
  onresult: ((event: ResultEvent) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    FakeSpeechRecognition.instances.push(this);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeSpeechRecognition.instances = [];
});

describe("SpeakingQuestion", () => {
  it("shows a fallback message when the browser has no SpeechRecognition", () => {
    render(
      <SpeakingQuestion
        exercise={exercise}
        onChange={vi.fn()}
        revealed={false}
        disabled={false}
      />,
    );

    expect(
      screen.getByText(/no soporta reconocimiento de voz/i),
    ).toBeInTheDocument();
  });

  it("reports the transcript once recognition produces a result", async () => {
    vi.stubGlobal("SpeechRecognition", FakeSpeechRecognition);
    const onChange = vi.fn();

    render(
      <SpeakingQuestion
        exercise={exercise}
        onChange={onChange}
        revealed={false}
        disabled={false}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /grabar pronunciación/i }),
    );

    expect(
      screen.getByRole("button", { name: /detener grabación/i }),
    ).toBeInTheDocument();

    const recognizer = FakeSpeechRecognition.instances.at(-1);
    recognizer?.onresult?.({
      results: [{ 0: { transcript: "わたしはがくせいです" } }],
    });

    expect(onChange).toHaveBeenCalledWith({
      transcript: "わたしはがくせいです",
    });
  });
});
