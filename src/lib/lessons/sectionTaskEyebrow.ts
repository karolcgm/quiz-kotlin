const SECTION_STAGE_RE = /^m5-([3-8])-([0-9]+)/u;
const SECTION_RE = /^m5-([3-8])-/u;
const GRADE6_SECTION_STAGE_RE = /^m6-([1-9])-([0-9]+)/u;

/** Shared card label for every lesson stage in divisions 3–8. */
export function sectionTaskEyebrow(stageOrLessonId: string): string | null {
  const topic = SECTION_STAGE_RE.exec(stageOrLessonId);
  if (topic) return `Dział ${topic[1]} · Temat ${topic[2]}`;
  const grade6Topic = GRADE6_SECTION_STAGE_RE.exec(stageOrLessonId);
  if (grade6Topic) return `Dział ${grade6Topic[1]} · Temat ${grade6Topic[2]}`;
  const section = SECTION_RE.exec(stageOrLessonId);
  return section ? `Dział ${section[1]} · Powtórzenie` : null;
}
