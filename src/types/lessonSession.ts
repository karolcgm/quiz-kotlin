/** Sesja lekcji na żywo — kontrakt WP-040 */

export type LessonSessionStatus = "draft" | "lobby" | "live" | "paused" | "ended";

export type LessonPaceMode = "teacher" | "student";

export type LessonSessionHelpStatus = "none" | "requested";

export interface LessonSessionStageQuestion {
  questionInstanceId: string;
  generatorId: string;
  seed: number;
  difficulty: string;
  expression: string;
  prompt: string;
  maxScore: number;
}

export interface LessonSessionStageSnapshot {
  id: string;
  kind: string;
  title: string;
  estimatedMinutes: number;
  liveKind?: "presentation" | "exercise" | "quick-check";
  liveMinutes?: number;
  boardHeadline: string;
  boardBody?: string;
  boardBullets?: string[];
  modelId?: string;
  modelSeed?: number;
  modelSeedPool?: number[];
  modelDifficulty?: string;
  studentActivityMode?: string;
  studentInstruction?: string;
  studentModelId?: string;
  studentModelSeed?: number;
  studentModelSeedPool?: number[];
  studentModelDifficulty?: string;
  questions: LessonSessionStageQuestion[];
  lessonTitle?: string;
  learningGoals?: Array<{
    id: string;
    studentGoal: string;
    successCriteria: string[];
    curriculumReferences: string[];
  }>;
  revealSteps?: Array<{
    id: string;
    label: string;
    boardHeadline?: string;
    boardBody?: string;
  }>;
}

export interface LessonSessionSnapshotPayload {
  lessonId: string;
  lessonVersion: number;
  curriculumId: string;
  sectionId: string;
  skillIds: string[];
  title: string;
  topicId: string;
  studentGoal: string;
  stages: LessonSessionStageSnapshot[];
}

export interface LessonSessionAnswerKeyEntry {
  questionInstanceId: string;
  stageId: string;
  skillId: string;
  maxScore: number;
  answerSpec: {
    firstStepOperatorIndex: number;
    firstStepLabel: string;
    validNextOperatorIndices: number[];
    finalValue: number;
  };
}

export interface LessonSessionAnswerKeyPayload {
  questions: LessonSessionAnswerKeyEntry[];
}

export interface CreateLessonSessionResult {
  ok: boolean;
  sessionId?: string;
  joinCode?: string;
  joinCodeExpiresAt?: string;
  status?: LessonSessionStatus;
  sequenceNumber?: number;
  error?: string;
}

export interface JoinLessonSessionResult {
  ok: boolean;
  sessionId?: string;
  status?: LessonSessionStatus;
  activeStageIndex?: number;
  paceMode?: LessonPaceMode;
  solutionRevealed?: boolean;
  boardOnlyMode?: boolean;
  stageSnapshot?: LessonSessionSnapshotPayload;
  sequenceNumber?: number;
  error?: string;
}

export interface LessonSessionCommandResult {
  ok: boolean;
  sessionId?: string;
  status?: LessonSessionStatus;
  activeStageIndex?: number;
  solutionRevealed?: boolean;
  sequenceNumber?: number;
  error?: string;
}

export interface SubmitLessonStageResponseResult {
  ok: boolean;
  responseId?: string;
  status?: "draft" | "submitted";
  score?: number;
  maxScore?: number;
  submittedAt?: string;
  idempotent?: boolean;
  sequenceNumber?: number;
  error?: string;
}

export interface BoardStageSummary {
  submittedCount: number;
  correctCount: number | null;
}

export interface BoardStageAggregate {
  stageId: string;
  submittedCount: number;
  correctCount: number;
}

export interface LessonSessionBoardView {
  sessionId: string;
  status: LessonSessionStatus;
  activeStageIndex: number;
  stageCount: number;
  solutionRevealed: boolean;
  boardOnlyMode: boolean;
  sequenceNumber: number;
  lessonTitle: string;
  topicId: string;
  studentGoal: string;
  activeStage: LessonSessionStageSnapshot | null;
  activeStageSummary?: BoardStageSummary;
  stageSummaries?: BoardStageAggregate[];
  participantCount?: number | null;
}

export interface LessonSessionParticipantRow {
  participantId: string;
  studentId: string;
  displayName: string;
  helpStatus: LessonSessionHelpStatus;
  responseStatus: "waiting" | "in_progress" | "submitted";
  /** Wynik jest dostępny wyłącznie nauczycielowi po odsłonięciu rozwiązania. */
  responseResult?: "correct" | "incorrect" | null;
  responseCount: number;
  responseTotal: number;
  correctCount: number;
  isOnline: boolean;
  lastAnswer: string | null;
  lastSeenAt: string;
}

export interface LessonSessionHistogramBucket {
  selectedOperatorIndex: number;
  count: number;
}

export interface LessonSessionStudentResponse {
  stageId: string;
  questionInstanceId: string;
  status: "draft" | "submitted";
  selectedOperatorIndex: number | null;
  submittedAt: string;
}

export interface LessonSessionStudentView {
  sessionId: string;
  status: LessonSessionStatus;
  paceMode: LessonPaceMode;
  boardOnlyMode: boolean;
  activeStageIndex: number;
  stageCount: number;
  sequenceNumber: number;
  lessonTitle: string;
  topicId: string;
  activeStage: LessonSessionStageSnapshot | null;
  helpStatus: LessonSessionHelpStatus;
  myResponses: LessonSessionStudentResponse[];
}

export interface LessonSessionTeacherView {
  sessionId: string;
  classId: string;
  schoolId: string;
  className: string;
  groupName: string;
  schoolName: string;
  lessonId: string;
  lessonVersion: number;
  lessonTitle: string;
  topicId: string;
  status: LessonSessionStatus;
  paceMode: LessonPaceMode;
  activeStageIndex: number;
  activeStageId: string | null;
  solutionRevealed: boolean;
  boardOnlyMode: boolean;
  sequenceNumber: number;
  joinCodeExpiresAt: string;
  startedAt: string | null;
  endedAt: string | null;
  participantCount: number;
  helpRequestedCount: number;
  activeStageSubmittedCount: number;
  stageSnapshot: LessonSessionSnapshotPayload;
  answerKey: LessonSessionAnswerKeyPayload;
  responseSummary: Array<{
    stageId: string;
    submittedCount: number;
    helpRequestedCount: number;
  }>;
  participants: LessonSessionParticipantRow[];
  activeStageHistogram: LessonSessionHistogramBucket[];
}

export interface LessonBookwork {
  textbookPage: number;
  coveredExercises: string[];
}

export interface LessonSessionStageStat {
  stageId: string;
  stageTitle: string;
  submittedCount: number;
  correctCount: number;
  correctRate: number | null;
}

export interface LessonSessionSkillStat {
  skillId: string;
  responseCount: number;
  correctRate: number | null;
  evidenceWeight: number;
}

export interface LessonSessionRevisitStudent {
  studentId: string;
  displayName: string;
  submittedCount: number;
  correctRate: number | null;
}

export interface LessonSessionTeacherSummary {
  sessionId: string;
  lessonTitle: string;
  topicId: string;
  endedAt: string | null;
  recordSkillEvidence: boolean;
  evidenceRecordedAt: string | null;
  textbookPage: number | null;
  coveredExercises: string[];
  participantCount: number;
  responseCount: number;
  correctRate: number | null;
  stageStats: LessonSessionStageStat[];
  skillStats: LessonSessionSkillStat[];
  revisitStudents: LessonSessionRevisitStudent[];
  strategyHistogram: LessonSessionHistogramBucket[];
}

export interface LessonSessionTeacherResultRow {
  studentId: string;
  displayName: string;
  stageId: string;
  stageTitle: string;
  submittedCount: number;
  correctCount: number;
  taskCount: number;
}

export interface LessonSessionDescriptiveGrade {
  id: string;
  sessionId: string;
  studentId: string;
  lessonTitle: string;
  sectionId: string | null;
  totalScore: number;
  maxScore: number;
  percentage: number;
  descriptiveFeedback: string;
  strengths: string[];
  improvements: string[];
  createdAt: string;
}

export interface LessonSessionStudentSummaryItem {
  responseId: string;
  stageId: string;
  stageTitle: string;
  questionInstanceId: string;
  expression: string;
  score: number;
  maxScore: number;
  submittedAt: string;
}

export interface LessonSessionStudentEvidenceSource {
  evidenceId: string;
  skillId: string;
  sourceType: string;
  sourceId: string;
  rawScore: number;
  rawMax: number;
  weight: number;
  occurredAt: string;
}

export interface LessonSessionStudentSummary {
  sessionId: string;
  lessonTitle: string;
  topicId: string;
  status: LessonSessionStatus;
  endedAt: string | null;
  responseCount: number;
  correctRate: number | null;
  items: LessonSessionStudentSummaryItem[];
  evidenceSources: LessonSessionStudentEvidenceSource[];
}
