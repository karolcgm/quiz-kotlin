/** Wspólny, serializowalny kontrakt uruchomienia etapu we wszystkich kanałach. */

export type LessonRuntimeChannel = "board" | "tablet" | "live" | "self_paced" | "print";

export type LessonRuntimeChannelMode = "present" | "practice" | "assess" | "paper";

export type LessonInteractionKind =
  | "buttons"
  | "drag"
  | "gesture"
  | "precision-draw"
  | "text";

export type LessonInteractionAlternative =
  | "keyboard"
  | "select-place"
  | "stepper"
  | "numeric-input"
  | "paper-mark";

export interface LessonRuntimeChannelContract {
  enabled: boolean;
  mode: LessonRuntimeChannelMode;
  /** Każdy aktywny kanał bada dokładnie ten sam zbiór umiejętności etapu. */
  skillIds: string[];
}

export interface LessonStageRuntimeContract {
  version: 1;
  /** Stabilny klucz stanu roboczego, niezależny od renderera kanału. */
  stateKey: string;
  skillIds: string[];
  channels: Record<LessonRuntimeChannel, LessonRuntimeChannelContract>;
  state: {
    sourceOfTruth: "stage-snapshot";
    persistDraftLocally: true;
    retrySubmission: "idempotent-client-attempt";
  };
  interaction: {
    primary: LessonInteractionKind;
    alternatives: LessonInteractionAlternative[];
  };
  accessibility: {
    focusOnStepChange: true;
    liveRegion: "polite";
    svgTitleAndDescription: true;
    textualModelData: true;
    highContrast: true;
    reducedMotion: true;
  };
}
