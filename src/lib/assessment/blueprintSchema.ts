import { z } from "zod";

const lessonDifficultySchema = z.enum(["support", "core", "challenge"]);

export const blueprintSlotSchema = z.object({
  slotId: z.string().min(1),
  skillId: z.string().min(1),
  difficulty: lessonDifficultySchema,
  maxScore: z.number().int().min(1).max(20),
  generatorId: z.string().min(1),
  generatorVersion: z.number().int().min(1),
  reasoningType: z.enum(["procedure", "concept", "application"]),
  prompt: z.string().min(4),
});

export const assessmentBlueprintSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().min(1),
  title: z.string().min(2),
  subtitle: z.string().optional(),
  kind: z.enum(["worksheet", "quiz", "exit-ticket", "exam"]),
  deliveryMode: z.enum(["digital", "paper", "hybrid"]),
  curriculumId: z.string().min(1),
  sectionId: z.string().min(1),
  topicIds: z.array(z.string()).min(1),
  skillIds: z.array(z.string()).min(1),
  lessonPackageId: z.string().optional(),
  estimatedMinutes: z.number().int().min(1).max(120),
  slots: z.array(blueprintSlotSchema).min(1),
  defaultVersionSeeds: z
    .object({
      A: z.number().int().positive().optional(),
      B: z.number().int().positive().optional(),
      C: z.number().int().positive().optional(),
    })
    .refine((seeds) => seeds.A !== undefined || seeds.B !== undefined, {
      message: "Blueprint musi mieć co najmniej seed wersji A lub B",
    }),
});

export type AssessmentBlueprintInput = z.infer<typeof assessmentBlueprintSchema>;
