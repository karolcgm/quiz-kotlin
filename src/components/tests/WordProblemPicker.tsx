"use client";

import { useEffect, useMemo, useState } from "react";
import type { GradeLevel } from "@/types/curriculum";
import type { WordProblemDifficulty } from "@/types/testWidget";
import { getWordProblemById, getWordProblemSectionsForGrade, wordProblemBank } from "@/lib/wordProblems";
import { renderWordProblemStory } from "@/lib/wordProblems/render";
import { createWordProblemParams, WORD_PROBLEM_SLUG } from "@/lib/wordProblems/widget";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/lib/wordProblems/types";
import { buildWidgetPrompt, getAssessmentWidget } from "@/lib/simulations/registry";
import type { ComposerItem } from "@/components/tests/TestItemEditor";

interface WordProblemPickerProps {
  defaultGrade?: GradeLevel;
  onAddProblems: (items: ComposerItem[]) => void;
}

type DifficultyFilter = "all" | WordProblemDifficulty;

const GRADE_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8].map((grade) => ({
  grade,
  count: wordProblemBank.filter((p) => p.grade === grade).length,
}));

const DIFFICULTY_FILTERS: { id: DifficultyFilter; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "easy", label: DIFFICULTY_LABELS.easy },
  { id: "medium", label: DIFFICULTY_LABELS.medium },
  { id: "hard", label: DIFFICULTY_LABELS.hard },
];

export function WordProblemPicker({ defaultGrade = 4, onAddProblems }: WordProblemPickerProps) {
  const [open, setOpen] = useState(false);
  const [grade, setGrade] = useState<GradeLevel>(defaultGrade);
  const [sectionId, setSectionId] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");

  useEffect(() => {
    if (open) setGrade(defaultGrade);
  }, [defaultGrade, open]);

  const sections = useMemo(() => getWordProblemSectionsForGrade(grade), [grade]);
  const gradeMeta = GRADE_COUNTS.find((g) => g.grade === grade);

  const activeSectionId = sectionId || sections[0]?.sectionId || "";
  const activeSection = sections.find((s) => s.sectionId === activeSectionId) ?? sections[0];
  const problems = activeSection?.problems ?? [];

  const filteredProblems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (difficultyFilter !== "all" && p.difficulty !== difficultyFilter) return false;
      if (!q) return true;
      const preview = renderWordProblemStory(p, p.defaults).toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.sectionTitle.toLowerCase().includes(q) ||
        preview.includes(q)
      );
    });
  }, [problems, query, difficultyFilter]);

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected((current) => {
      const next = new Set(current);
      for (const p of filteredProblems) next.add(p.id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const handleOpen = () => {
    setGrade(defaultGrade);
    setOpen(true);
    setSectionId("");
    setSelected(new Set());
    setQuery("");
    setDifficultyFilter("all");
  };

  const handleAdd = () => {
    const widget = getAssessmentWidget(WORD_PROBLEM_SLUG);
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    const items: ComposerItem[] = ids.map((problemId, index) => {
      const params = createWordProblemParams(problemId);
      const template = getWordProblemById(problemId);

      return {
        localId: crypto.randomUUID(),
        position: index + 1,
        simulationSlug: WORD_PROBLEM_SLUG,
        widgetKind: "word-problem",
        skill: params.skill,
        title: template?.title ?? "Zadanie z treścią",
        prompt: buildWidgetPrompt(WORD_PROBLEM_SLUG, params),
        points: Math.max(widget?.defaultPoints ?? 2, params.parts.length),
        params,
      };
    });

    onAddProblems(items);
    setSelected(new Set());
    setOpen(false);
  };

  return (
    <>
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <h4 className="font-bold text-emerald-950">Zadania z treścią</h4>
        <p className="mt-1 text-sm text-emerald-900">
          {wordProblemBank.length} zadań — po 20 na dział (8 łatwych, 7 średnich, 5 trudnych). Trudniejsze
          mają dłuższą historię i kilka odpowiedzi; za częściową poprawność uczeń dostaje część punktów.
        </p>
        <button
          type="button"
          onClick={handleOpen}
          className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          Wybierz zadania z treścią
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 md:items-center">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Bank zadań tekstowych</h3>
                  <p className="text-sm text-slate-600">
                    Klasa {grade}: {gradeMeta?.count ?? 0} zadań w {sections.length} działach
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-semibold text-slate-500 hover:text-slate-800"
                >
                  Zamknij
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGrade(g as GradeLevel);
                      setSectionId("");
                      setSelected(new Set());
                    }}
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      grade === g
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Kl. {g}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="space-y-1 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Dział — klasa {grade}
                  </span>
                  <select
                    value={activeSectionId}
                    onChange={(e) => {
                      setSectionId(e.target.value);
                      setSelected(new Set());
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    {sections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                        {section.sectionTitle} — {section.problems.length} zadań
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {DIFFICULTY_FILTERS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDifficultyFilter(id)}
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      difficultyFilter === id
                        ? id === "all"
                          ? "bg-slate-800 text-white"
                          : DIFFICULTY_COLORS[id as WordProblemDifficulty]
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Szukaj w tytule lub treści…"
                  className="min-w-[200px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Zaznacz widoczne ({filteredProblems.length})
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Wyczyść
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredProblems.length === 0 && (
                <p className="text-slate-600">Brak zadań pasujących do wyszukiwania.</p>
              )}
              <ul className="space-y-2">
                {filteredProblems.map((problem) => {
                  const checked = selected.has(problem.id);
                  const preview = renderWordProblemStory(problem, problem.defaults);
                  return (
                    <li key={problem.id}>
                      <label
                        className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                          checked
                            ? "border-emerald-300 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-emerald-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(problem.id)}
                          className="mt-1 h-4 w-4 shrink-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900">{problem.title}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-bold ${DIFFICULTY_COLORS[problem.difficulty]}`}
                            >
                              {DIFFICULTY_LABELS[problem.difficulty]}
                            </span>
                            {problem.parts.length > 1 && (
                              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
                                {problem.parts.length} odp.
                              </span>
                            )}
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              kl. {problem.grade}
                            </span>
                          </span>
                          <span className="mt-1 block line-clamp-4 text-sm leading-relaxed text-slate-700">
                            {preview}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Zaznaczono: {selected.size} {selected.size === 1 ? "zadanie" : "zadań"}
              </p>
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={handleAdd}
                className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Dodaj do testu ({selected.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
