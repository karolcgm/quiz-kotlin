import type { LessonPackage, LessonStage } from "@/types/lessonPackage";
import type {
  LessonInteractionAlternative,
  LessonInteractionKind,
  LessonRuntimeChannel,
  LessonRuntimeChannelMode,
  LessonStageRuntimeContract,
} from "@/types/lessonRuntime";

const CHANNELS: LessonRuntimeChannel[] = ["board", "tablet", "live", "self_paced", "print"];

function uniqueSkillIds(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

export function getStageSkillIds(stage: LessonStage, lessonSkillIds: string[]): string[] {
  const explicit = uniqueSkillIds([
    ...stage.questions.flatMap((question) => question.skillIds ?? []),
    ...(stage.print?.items ?? []).flatMap((item) => item.skillIds ?? []),
    ...(stage.understanding?.criteria.map((criterion) => criterion.skillId) ?? []),
  ]);
  return explicit.length > 0 ? explicit : uniqueSkillIds(lessonSkillIds);
}

function channelMode(stage: LessonStage, channel: LessonRuntimeChannel): LessonRuntimeChannelMode {
  if (channel === "print") return "paper";
  if (stage.questions.length > 0 || stage.kind === "understanding") return "assess";
  if (stage.student?.activityMode === "practice" || stage.student?.activityMode === "respond") {
    return "practice";
  }
  return "present";
}

function interactionContract(stage: LessonStage): {
  primary: LessonInteractionKind;
  alternatives: LessonInteractionAlternative[];
} {
  if (stage.questions.length > 0) {
    return { primary: "buttons", alternatives: ["keyboard", "paper-mark"] };
  }
  if (stage.student?.activityMode === "practice") {
    return { primary: "buttons", alternatives: ["select-place", "stepper", "numeric-input", "keyboard"] };
  }
  return { primary: "text", alternatives: ["keyboard", "paper-mark"] };
}

export function buildLessonStageRuntimeContract(input: {
  lessonId: string;
  lessonVersion: number;
  lessonSkillIds: string[];
  stage: LessonStage;
}): LessonStageRuntimeContract {
  const skillIds = getStageSkillIds(input.stage, input.lessonSkillIds);
  const enabled: Record<LessonRuntimeChannel, boolean> = {
    board: true,
    tablet: Boolean(input.stage.student),
    live: input.stage.live?.enabled ?? true,
    self_paced: true,
    print: Boolean(input.stage.print),
  };

  return {
    version: 1,
    stateKey: `${input.lessonId}@${input.lessonVersion}:${input.stage.id}`,
    skillIds,
    channels: Object.fromEntries(CHANNELS.map((channel) => [channel, {
      enabled: enabled[channel],
      mode: channelMode(input.stage, channel),
      skillIds,
    }])) as LessonStageRuntimeContract["channels"],
    state: {
      sourceOfTruth: "stage-snapshot",
      persistDraftLocally: true,
      retrySubmission: "idempotent-client-attempt",
    },
    interaction: interactionContract(input.stage),
    accessibility: {
      focusOnStepChange: true,
      liveRegion: "polite",
      svgTitleAndDescription: true,
      textualModelData: true,
      highContrast: true,
      reducedMotion: true,
    },
  };
}

export function lessonChannelContractIssues(lesson: LessonPackage): string[] {
  const issues: string[] = [];

  lesson.stages.forEach((stage) => {
    const runtime = stage.runtime;
    if (!runtime) {
      issues.push(`${stage.id}: brak runtime`);
      return;
    }
    if (runtime.stateKey !== `${lesson.id}@${lesson.version}:${stage.id}`) {
      issues.push(`${stage.id}: niestabilny stateKey`);
    }
    const expected = runtime.skillIds.join("|");
    CHANNELS.forEach((channel) => {
      if (runtime.channels[channel].skillIds.join("|") !== expected) {
        issues.push(`${stage.id}: kanał ${channel} ma inne skillIds`);
      }
    });
    (stage.print?.items ?? []).forEach((item) => {
      if (!item.skillIds?.length) issues.push(`${stage.id}/${item.id}: brak skillIds w druku`);
      else if (item.skillIds.some((skillId) => !runtime.skillIds.includes(skillId))) {
        issues.push(`${stage.id}/${item.id}: druk bada umiejętność spoza kontraktu`);
      }
    });
  });

  return issues;
}

export function assertLessonChannelContract(lesson: LessonPackage): LessonPackage {
  const issues = lessonChannelContractIssues(lesson);
  if (issues.length > 0) throw new Error(`Niepoprawny kontrakt kanałów ${lesson.id}: ${issues.join("; ")}`);
  return lesson;
}
