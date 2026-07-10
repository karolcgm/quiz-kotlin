import { BoardShell } from "@/components/shells/AppShells";

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <BoardShell>{children}</BoardShell>;
}
