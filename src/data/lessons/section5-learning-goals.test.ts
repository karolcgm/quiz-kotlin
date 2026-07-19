import { describe, expect, it } from "vitest";
import { section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";

describe("cele i kryteria sukcesu w dziale 5", () => {
  it("każdy temat ma jeden konkretny cel i osobne mierzalne kryteria", () => {
    for (const lesson of section5LessonsWpC5) {
      expect(lesson.learningGoals, lesson.topicId).toHaveLength(1);
      const goal = lesson.learningGoals[0]!;

      expect(goal.studentGoal, lesson.topicId).toMatch(/^(Nauczę się|Powtórzę)/u);
      expect(goal.studentGoal, lesson.topicId).not.toContain("najważniejszych umiejętności");
      expect(goal.successCriteria.length, lesson.topicId).toBeGreaterThanOrEqual(2);
      expect(goal.successCriteria.length, lesson.topicId).toBeLessThanOrEqual(4);
      expect(goal.successCriteria.every((criterion) => criterion.startsWith("Potrafię")), lesson.topicId).toBe(true);
      expect(lesson.studentGoal, lesson.topicId).toBe(goal.studentGoal);
      expect(lesson.successCriteria, lesson.topicId).toEqual(goal.successCriteria);
    }
  });
});
