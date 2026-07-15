// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StudentSessionClient } from "@/components/live/StudentSessionClient";
import type { LessonSessionStudentView } from "@/types/lessonSession";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/lessonSessions", () => ({
  submitLessonStageResponseAction: vi.fn(),
  submitLiveLessonUnderstandingAction: vi.fn(),
  updateLessonSessionHelpAction: vi.fn(),
}));

vi.mock("@/lib/live/useStudentSessionSync", () => ({
  useStudentSessionSync: (_sessionId: string, initialView: LessonSessionStudentView) => ({
    view: initialView,
    connection: "live",
    refresh: vi.fn(),
  }),
}));

afterEach(cleanup);

const finalStageView: LessonSessionStudentView = {
  sessionId: "session-1",
  status: "live",
  paceMode: "teacher",
  boardOnlyMode: false,
  activeStageIndex: 6,
  stageCount: 7,
  sequenceNumber: 1,
  lessonTitle: "Działania pisemne — mnożenie",
  topicId: "M5-1.7",
  activeStage: {
    id: "m5-1-7-understanding",
    kind: "exit-ticket",
    title: "Ocena umiejętności",
    estimatedMinutes: 4,
    liveKind: "quick-check",
    liveMinutes: 4,
    boardHeadline: "Ocena umiejętności",
    studentInstruction: "Oceń, jak dobrze rozumiesz mnożenie pisemne piętrami.",
    questions: [],
  },
  helpStatus: "none",
  myResponses: [],
};

describe("StudentSessionClient — ostatni slajd", () => {
  it("pokazuje obowiązkową samoocenę podczas aktywnego etapu quick-check", () => {
    render(<StudentSessionClient sessionId="session-1" initialView={finalStageView} />);

    expect(screen.getByRole("radiogroup", { name: "Samoocena zrozumienia tematu" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.queryByText(/Patrz na tablicę/)).not.toBeInTheDocument();
  });

  it("po zapisaniu samooceny pokazuje potwierdzenie", () => {
    render(
      <StudentSessionClient
        sessionId="session-1"
        initialView={finalStageView}
        initialUnderstanding="understood"
      />,
    );

    expect(screen.getByText("Samoocena zapisana. Punkty za zadanie nie zostały zmienione.")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Umiem samodzielnie" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Odpowiedź zapisana" })).toBeDisabled();
  });
});
