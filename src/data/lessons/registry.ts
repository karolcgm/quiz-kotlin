import { m511FabrykaLiczbV1 } from "@/data/lessons/m5-1-1-fabryka-liczb";
import { m512SkokiPoOsiV1 } from "@/data/lessons/m5-1-2-skoki-po-osi";
import { m513ProstokatMnozeniaV1 } from "@/data/lessons/m5-1-3-prostokat-mnozenia";
import { m514KolejnoscDzialanV1 } from "@/data/lessons/m5-1-4-kolejnosc-dzialan";
import { section1LessonsWpC1bc } from "@/data/lessons/section1-wp-c1bc";
import { section2LessonsWpC2 } from "@/data/lessons/section2-wp-c2";
import { section3LessonsWpC3 } from "@/data/lessons/section3-wp-c3";
import { section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { section6LessonsWpC6 } from "@/data/lessons/section6-wp-c6";
import { section7LessonsWpC7 } from "@/data/lessons/section7-wp-c7";
import { section8LessonsWpC8 } from "@/data/lessons/section8-wp-c8";
import type { LessonPackage } from "@/types/lessonPackage";

const packages: LessonPackage[] = [
  m511FabrykaLiczbV1,
  m512SkokiPoOsiV1,
  m513ProstokatMnozeniaV1,
  m514KolejnoscDzialanV1,
  ...section1LessonsWpC1bc,
  ...section2LessonsWpC2,
  ...section3LessonsWpC3,
  ...section4LessonsWpC4,
  ...section5LessonsWpC5,
  ...section6LessonsWpC6,
  ...section7LessonsWpC7,
  ...section8LessonsWpC8,
];

const byId = new Map(packages.map((pkg) => [pkg.id, pkg]));
const byTopicId = new Map(packages.map((pkg) => [pkg.topicId, pkg]));

export function listLessonPackages(): LessonPackage[] {
  return packages;
}

export function listPublishedLessonPackages(): LessonPackage[] {
  return packages.filter((pkg) => pkg.status === "published");
}

export function getLessonPackageById(lessonId: string): LessonPackage | undefined {
  return byId.get(lessonId);
}

export function getLessonPackageForTopic(topicId: string): LessonPackage | undefined {
  return byTopicId.get(topicId);
}

export function isTopicLessonPublished(topicId: string): boolean {
  const pkg = byTopicId.get(topicId);
  return pkg?.status === "published";
}
