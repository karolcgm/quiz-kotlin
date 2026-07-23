import { CubeBuilderGame } from "@/components/materials/games/cube-builder/CubeBuilderGame";
import { requireRole } from "@/lib/auth/session";

export default async function CubeBuilderStudentPage() {
  await requireRole("student");
  return <CubeBuilderGame />;
}
