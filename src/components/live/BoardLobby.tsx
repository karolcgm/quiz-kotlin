import { JoinCodeQr } from "@/components/live/JoinCodeQr";
import { buildStudentJoinUrl } from "@/lib/live/boardView";

interface BoardLobbyProps {
  sessionId: string;
  lessonTitle: string;
  topicId: string;
  studentGoal: string;
  joinCode?: string | null;
  stageCount: number;
}

export function BoardLobby({
  sessionId,
  lessonTitle,
  topicId,
  studentGoal,
  joinCode,
  stageCount,
}: BoardLobbyProps) {
  const joinUrl = buildStudentJoinUrl(sessionId);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-10 text-center lg:flex-row lg:items-start lg:text-left">
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">{topicId}</p>
          <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">{lessonTitle}</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cel lekcji</p>
          <p className="mt-3 text-lg leading-relaxed text-slate-100 sm:text-xl">{studentGoal}</p>
        </div>

        <p className="text-sm text-slate-400">
          {stageCount} etapów · czekamy na nauczyciela · dołącz na tablecie kodem lub QR
        </p>
      </div>

      <div className="shrink-0">
        <JoinCodeQr joinUrl={joinUrl} joinCode={joinCode} size={220} />
      </div>
    </div>
  );
}
