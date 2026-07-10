import { m511FabrykaLiczbV1 } from "@/data/lessons/m5-1-1-fabryka-liczb";
import { m512SkokiPoOsiV1 } from "@/data/lessons/m5-1-2-skoki-po-osi";
import { m513ProstokatMnozeniaV1 } from "@/data/lessons/m5-1-3-prostokat-mnozenia";
import { m514KolejnoscDzialanV1 } from "@/data/lessons/m5-1-4-kolejnosc-dzialan";
import type { LessonPackage } from "@/types/lessonPackage";

const packages: LessonPackage[] = [
  m511FabrykaLiczbV1,
  m512SkokiPoOsiV1,
  m513ProstokatMnozeniaV1,
  m514KolejnoscDzialanV1,
];

const byId = new Map(packages.map((pkg) => [pkg.id, pkg]));
const byTopicId = new Map(packages.map((pkg) => [pkg.topicId, pkg]));

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
