"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

export interface WrittenDivisionTask {
  dividend: number;
  divisor: number;
  title: string;
  story: string;
}

export const WRITTEN_DIVISION_EXAMPLES: readonly WrittenDivisionTask[] = [
  {
    dividend: 180,
    divisor: 5,
    title: "Przykład 1",
    story: "Oblicz iloraz 180 i 5 metodą dzielenia pisemnego.",
  },
  {
    dividend: 356,
    divisor: 4,
    title: "Przykład 2",
    story: "Oblicz iloraz 356 i 4. Zapisuj kolejne odejmowania pod dzielną.",
  },
  {
    dividend: 225,
    divisor: 3,
    title: "Przykład 3",
    story: "Podziel pisemnie 225 przez 3 i sprawdź otrzymany iloraz.",
  },
  {
    dividend: 518,
    divisor: 7,
    title: "Przykład 4",
    story: "Oblicz 518 : 7, uzupełniając wieżę od góry do dołu.",
  },
  {
    dividend: 960,
    divisor: 6,
    title: "Przykład 5",
    story: "Podziel pisemnie 960 przez 6. Pamiętaj o zerze w ilorazie.",
  },
  {
    dividend: 639,
    divisor: 3,
    title: "Przykład 6",
    story: "Oblicz iloraz 639 i 3 oraz zakończ zapis resztą równą 0.",
  },
] as const;

export const WRITTEN_DIVISION_REMAINDER_EXAMPLES: readonly WrittenDivisionTask[] =
  [
    {
      dividend: 53,
      divisor: 8,
      title: "Flamastry do piórników",
      story:
        "Chrupek ma 53 flamastry. Do każdego piórnika wkłada po 8 flamastrów. Ile pełnych piórników przygotuje i ile flamastrów zostanie?",
    },
    {
      dividend: 97,
      divisor: 6,
      title: "Babeczki na stoły",
      story:
        "Na szkolny piknik przygotowano 97 babeczek. Na każdym stole ma stanąć po 6 babeczek. Ile pełnych zestawów powstanie i ile babeczek zostanie?",
    },
    {
      dividend: 145,
      divisor: 12,
      title: "Naklejki w albumach",
      story:
        "Klasa zebrała 145 naklejek. Na jednej stronie albumu mieści się 12 naklejek. Ile stron można zapełnić w całości i ile naklejek zostanie?",
    },
    {
      dividend: 218,
      divisor: 9,
      title: "Krzesła w równych rzędach",
      story:
        "W sali jest 218 krzeseł. Organizator ustawia po 9 krzeseł w każdym pełnym rzędzie. Ile pełnych rzędów ustawi i ile krzeseł pozostanie?",
    },
    {
      dividend: 365,
      divisor: 16,
      title: "Koraliki do woreczków",
      story:
        "W pracowni Chrupka jest 365 koralików. Do każdego woreczka trafia po 16 koralików. Ile pełnych woreczków można przygotować i ile koralików zostanie?",
    },
    {
      dividend: 502,
      divisor: 24,
      title: "Elementy modeli rakiet",
      story:
        "Koło naukowe ma 502 elementy. Jeden model rakiety wymaga 24 elementów. Ile kompletnych modeli można zbudować i ile elementów pozostanie?",
    },
  ] as const;

export const WRITTEN_DIVISION_STORY = {
  dividend: 1248,
  divisor: 24,
  title: "Identyfikatory dla uczestników",
  story:
    "Organizatorzy festiwalu przygotowali 1248 identyfikatorów. Do każdego pudełka wkładają po 24 identyfikatory. Ile pełnych pudełek przygotują?",
  data: ["1248 identyfikatorów", "24 identyfikatory w każdym pudełku"],
  answerPrefix: "Organizatorzy przygotują ",
  answerSuffix: " pełne pudełka.",
} as const;

export interface DivisionLayoutStep {
  partialDividend: number;
  quotientDigit: number;
  product: number;
  remainder: number;
  endColumn: number;
  startColumn: number;
}

export interface WrittenDivisionLayout {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  columns: number;
  steps: DivisionLayoutStep[];
}

/**
 * Buduje zapis dzielenia cyfra po cyfrze. Po rozpoczęciu ilorazu każdy
 * sprowadzony znak tworzy krok — również wtedy, gdy jego cyfrą jest zero.
 */
export function getWrittenDivisionLayout(
  dividend: number,
  divisor: number,
): WrittenDivisionLayout {
  if (
    !Number.isInteger(dividend) ||
    !Number.isInteger(divisor) ||
    dividend < 0 ||
    divisor <= 0
  ) {
    throw new Error(
      "Dzielenie pisemne wymaga nieujemnej dzielnej i dodatniego dzielnika całkowitego.",
    );
  }

  const digits = String(dividend).split("").map(Number);
  const steps: DivisionLayoutStep[] = [];
  let carried = 0;
  let started = false;

  digits.forEach((digit, endColumn) => {
    const partialDividend = carried * 10 + digit;
    if (
      !started &&
      partialDividend < divisor &&
      endColumn < digits.length - 1
    ) {
      carried = partialDividend;
      return;
    }

    started = true;
    const quotientDigit = Math.floor(partialDividend / divisor);
    const product = quotientDigit * divisor;
    const remainder = partialDividend - product;
    steps.push({
      partialDividend,
      quotientDigit,
      product,
      remainder,
      endColumn,
      startColumn: Math.max(0, endColumn - String(partialDividend).length + 1),
    });
    carried = remainder;
  });

  return {
    dividend,
    divisor,
    quotient: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
    columns: digits.length,
    steps,
  };
}

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type ActiveCell =
  | { row: "quotient"; digitIndex: number }
  | { row: "dividend"; digitIndex: number }
  | { row: "divisor"; digitIndex: number }
  | { row: "product"; stepIndex: number; digitIndex: number }
  | { row: "partial"; stepIndex: number; digitIndex: number }
  | null;

function clampTaskIndex(value: number, taskCount: number) {
  return Math.min(taskCount - 1, Math.max(0, value));
}

function emptyDigits(value: number) {
  return Array(String(value).length).fill("") as string[];
}

function DivisionTower({
  task,
  taskNumber,
  readOnly,
  operandsEditable = false,
  hidePrompt = false,
  story,
  onResultChange,
}: {
  task: WrittenDivisionTask;
  taskNumber: number;
  readOnly: boolean;
  operandsEditable?: boolean;
  hidePrompt?: boolean;
  story?: typeof WRITTEN_DIVISION_STORY;
  onResultChange?: Props["onResultChange"];
}) {
  const editOperands = operandsEditable || Boolean(story);
  const { dividend, divisor } = task;
  const layout = useMemo(
    () => getWrittenDivisionLayout(dividend, divisor),
    [dividend, divisor],
  );
  const quotientDigits = String(layout.quotient).split("");
  const [quotientValues, setQuotientValues] = useState<string[]>(() =>
    quotientDigits.map(() => ""),
  );
  const [productValues, setProductValues] = useState<string[][]>(() =>
    layout.steps.map((step) => emptyDigits(step.product)),
  );
  const [partialValues, setPartialValues] = useState<string[][]>(() =>
    layout.steps.map((step, stepIndex) => {
      const nextStep = layout.steps[stepIndex + 1];
      return emptyDigits(nextStep ? nextStep.partialDividend : step.remainder);
    }),
  );
  const [dividendValues, setDividendValues] = useState<string[]>(() =>
    Array(String(dividend).length).fill(""),
  );
  const [divisorValues, setDivisorValues] = useState<string[]>(() =>
    Array(String(divisor).length).fill(""),
  );
  const [active, setActive] = useState<ActiveCell>(null);
  const lastStepIndex = layout.steps.length - 1;
  const lastStep = layout.steps[lastStepIndex];
  const finalResultStepIndex =
    lastStepIndex > 0 && lastStep?.quotientDigit === 0 && lastStep.product === 0
      ? lastStepIndex - 1
      : lastStepIndex;

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);

  const finalRemainderValues = partialValues[finalResultStepIndex] ?? [];
  const operandsComplete =
    !editOperands ||
    (dividendValues.every(Boolean) && divisorValues.every(Boolean));
  const resultComplete =
    operandsComplete &&
    quotientValues.every(Boolean) &&
    finalRemainderValues.every(Boolean);
  const resultCorrect =
    resultComplete &&
    (!editOperands ||
      (Number(dividendValues.join("")) === dividend &&
        Number(divisorValues.join("")) === divisor)) &&
    Number(quotientValues.join("")) === layout.quotient &&
    Number(finalRemainderValues.join("")) === layout.remainder;

  const reportFinalResult = (
    nextQuotient: string[],
    nextPartials: string[][],
    nextDividend = dividendValues,
    nextDivisor = divisorValues,
  ) => {
    const nextRemainder = nextPartials[finalResultStepIndex] ?? [];
    const nextOperandsComplete =
      !editOperands ||
      (nextDividend.every(Boolean) && nextDivisor.every(Boolean));
    const complete =
      nextOperandsComplete &&
      nextQuotient.every(Boolean) &&
      nextRemainder.every(Boolean);
    const quotientText = nextQuotient.join("");
    const remainderText = nextRemainder.join("");
    const answer = quotientText
      ? `${quotientText}${layout.remainder === 0 ? "" : ` r ${remainderText}`}`
      : undefined;
    onResultChange?.(
      complete
        ? (!editOperands ||
            (Number(nextDividend.join("")) === dividend &&
              Number(nextDivisor.join("")) === divisor)) &&
            Number(quotientText) === layout.quotient &&
            Number(remainderText) === layout.remainder
        : null,
      answer,
    );
  };

  const updateCell = (digit: string) => {
    if (readOnly || !active) return;
    const replacement = digit === "←" ? "" : digit;

    if (active.row === "dividend" || active.row === "divisor") {
      const current =
        active.row === "dividend" ? dividendValues : divisorValues;
      const next = current.map((value, index) =>
        index === active.digitIndex ? replacement : value,
      );
      if (active.row === "dividend") {
        setDividendValues(next);
        reportFinalResult(quotientValues, partialValues, next, divisorValues);
      } else {
        setDivisorValues(next);
        reportFinalResult(quotientValues, partialValues, dividendValues, next);
      }
      if (digit !== "←" && active.digitIndex < next.length - 1) {
        setActive({ row: active.row, digitIndex: active.digitIndex + 1 });
      }
      return;
    }

    if (active.row === "quotient") {
      const next = quotientValues.map((value, index) =>
        index === active.digitIndex ? replacement : value,
      );
      setQuotientValues(next);
      reportFinalResult(next, partialValues);
      if (digit !== "←" && active.digitIndex < next.length - 1) {
        setActive({ row: "quotient", digitIndex: active.digitIndex + 1 });
      }
      return;
    }

    if (active.row === "product") {
      setProductValues((rows) =>
        rows.map((row, stepIndex) =>
          stepIndex === active.stepIndex
            ? row.map((value, index) =>
                index === active.digitIndex ? replacement : value,
              )
            : row,
        ),
      );
      const rowLength = productValues[active.stepIndex]?.length ?? 0;
      if (digit !== "←" && active.digitIndex < rowLength - 1) {
        setActive({ ...active, digitIndex: active.digitIndex + 1 });
      }
      return;
    }

    const nextPartials = partialValues.map((row, stepIndex) =>
      stepIndex === active.stepIndex
        ? row.map((value, index) =>
            index === active.digitIndex ? replacement : value,
          )
        : row,
    );
    setPartialValues(nextPartials);
    if (active.stepIndex === finalResultStepIndex)
      reportFinalResult(quotientValues, nextPartials);
    const rowLength = partialValues[active.stepIndex]?.length ?? 0;
    if (digit !== "←" && active.digitIndex < rowLength - 1) {
      setActive({ ...active, digitIndex: active.digitIndex + 1 });
    }
  };

  const fixedCellClass =
    "grid h-11 w-11 place-items-center border border-slate-300 bg-white font-mono text-2xl font-black text-slate-950 sm:h-12 sm:w-12 sm:text-3xl";
  const blankCellClass = "h-11 w-11 sm:h-12 sm:w-12";
  const answerCellClass = (selected: boolean, final = false) =>
    `grid h-11 w-11 place-items-center border-2 font-mono text-xl font-black transition sm:h-12 sm:w-12 sm:text-2xl ${selected ? "border-cyan-600 bg-cyan-100 text-cyan-950 ring-4 ring-cyan-300/50" : final ? "border-emerald-400 bg-emerald-50 text-emerald-950" : "border-slate-300 bg-white text-slate-950"}`;
  const quotientByColumn = new Map(
    layout.steps.map((step, index) => [step.endColumn, index]),
  );
  const dividendDigits = String(dividend).split("");
  const divisorDigits = String(divisor).split("");
  const trailingCellCount = 1 + divisorDigits.length;

  const trailingBlanks = (prefix: string) =>
    Array.from({ length: trailingCellCount }, (_, index) => (
      <span
        key={`${prefix}-${index}`}
        className={index === 0 ? "h-11 w-7 sm:h-12 sm:w-8" : blankCellClass}
        aria-hidden
      />
    ));

  const renderAnswerRow = ({
    values,
    endColumn,
    row,
    stepIndex,
    final = false,
  }: {
    values: string[];
    endColumn: number;
    row: "product" | "partial";
    stepIndex: number;
    final?: boolean;
  }) => {
    const startColumn = Math.max(0, endColumn - values.length + 1);
    return Array.from({ length: layout.columns }, (_, column) => {
      const digitIndex = column - startColumn;
      if (digitIndex < 0 || digitIndex >= values.length) {
        return (
          <span
            key={`${row}-${stepIndex}-${column}`}
            className={blankCellClass}
            aria-hidden
          />
        );
      }
      const label = final
        ? `Reszta końcowa, cyfra ${digitIndex + 1}`
        : row === "product"
          ? `Iloczyn do odjęcia, krok ${stepIndex + 1}, cyfra ${digitIndex + 1}`
          : `Liczba po sprowadzeniu, krok ${stepIndex + 1}, cyfra ${digitIndex + 1}`;
      return (
        <button
          type="button"
          key={`${row}-${stepIndex}-${column}`}
          data-answer-cell
          aria-label={label}
          disabled={readOnly}
          onClick={() => setActive({ row, stepIndex, digitIndex })}
          className={answerCellClass(
            active?.row === row &&
              active.stepIndex === stepIndex &&
              active.digitIndex === digitIndex,
            final,
          )}
        >
          {values[digitIndex]}
        </button>
      );
    });
  };

  const renderProductRow = (step: DivisionLayoutStep, stepIndex: number) => {
    const values = productValues[stepIndex]!;
    const startColumn = Math.max(0, step.endColumn - values.length + 1);

    return Array.from({ length: layout.columns + 1 }, (_, position) => {
      if (position === startColumn) {
        return (
          <span
            key={`minus-${stepIndex}`}
            className="grid h-11 w-10 place-items-center border border-slate-300 bg-white font-mono text-2xl font-black sm:h-12"
            aria-hidden
          >
            −
          </span>
        );
      }

      const column = position - 1;
      const digitIndex = column - startColumn;
      if (column < 0 || digitIndex < 0 || digitIndex >= values.length) {
        return (
          <span
            key={`product-${stepIndex}-${position}`}
            className={position === 0 ? "h-11 w-10 sm:h-12" : blankCellClass}
            aria-hidden
          />
        );
      }

      return (
        <button
          type="button"
          key={`product-${stepIndex}-${position}`}
          data-answer-cell
          aria-label={`Iloczyn do odjęcia, krok ${stepIndex + 1}, cyfra ${digitIndex + 1}`}
          disabled={readOnly}
          onClick={() => setActive({ row: "product", stepIndex, digitIndex })}
          className={answerCellClass(
            active?.row === "product" &&
              active.stepIndex === stepIndex &&
              active.digitIndex === digitIndex,
          )}
        >
          {values[digitIndex]}
        </button>
      );
    });
  };

  return (
    <article
      aria-label={
        editOperands
          ? `Zadanie ${taskNumber}: dzielenie pisemne — wpisz dzielną i dzielnik`
          : `Zadanie ${taskNumber}: ${dividend} podzielić przez ${divisor}`
      }
      className="mx-auto w-full max-w-4xl rounded-3xl bg-slate-100 p-4 text-slate-950 shadow-xl sm:p-7"
    >
      {!hidePrompt ? (
        <div className="rounded-2xl border border-indigo-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[.16em] text-indigo-700">
            {task.title}
          </p>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
            {task.story}
          </p>
          {story ? (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Dane
              </p>
              <ul className="mt-2 space-y-1 font-bold">
                {story.data.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-center text-sm font-black text-slate-600">
        {editOperands
          ? "Najpierw wpisz dzielną i dzielnik z treści zadania. Następnie uzupełnij wszystkie potrzebne kratki dzielenia pisemnego."
          : "Uzupełnij puste kratki. Podane są tylko dzielna, znak „:” i dzielnik."}
      </p>
      <div className="mt-4 overflow-x-auto pb-2">
        <div
          className="mx-auto grid w-fit items-center gap-0"
          style={{
            gridTemplateColumns: `2.5rem repeat(${layout.columns}, 3rem) 2rem repeat(${divisorDigits.length}, 3rem)`,
          }}
        >
          <span className="h-11 w-10 sm:h-12" aria-hidden />
          {Array.from({ length: layout.columns }, (_, column) => {
            const quotientIndex = quotientByColumn.get(column);
            return quotientIndex === undefined ? (
              <span
                key={`quotient-empty-${column}`}
                className={blankCellClass}
                aria-hidden
              />
            ) : (
              <button
                type="button"
                key={`quotient-${column}`}
                data-answer-cell
                aria-label={`Iloraz końcowy, cyfra ${quotientIndex + 1}`}
                disabled={readOnly}
                onClick={() =>
                  setActive({ row: "quotient", digitIndex: quotientIndex })
                }
                className={answerCellClass(
                  active?.row === "quotient" &&
                    active.digitIndex === quotientIndex,
                )}
              >
                {quotientValues[quotientIndex]}
              </button>
            );
          })}
          {trailingBlanks("quotient-tail")}

          <span className="h-11 w-10 sm:h-12" aria-hidden />
          {dividendDigits.map((digit, index) =>
            editOperands ? (
              <button
                type="button"
                key={`dividend-${index}`}
                data-answer-cell
                aria-label={`Dzielna, cyfra ${index + 1}`}
                disabled={readOnly}
                onClick={() =>
                  setActive({ row: "dividend", digitIndex: index })
                }
                className={answerCellClass(
                  active?.row === "dividend" && active.digitIndex === index,
                )}
              >
                {dividendValues[index]}
              </button>
            ) : (
              <span
                key={`dividend-${index}`}
                data-fixed-cell
                aria-label={`Dzielna, cyfra ${index + 1}: ${digit}`}
                className={fixedCellClass}
              >
                {digit}
              </span>
            ),
          )}
          <span
            data-fixed-cell
            aria-label="Znak dzielenia"
            className={`${fixedCellClass} w-7 sm:w-8`}
          >
            :
          </span>
          {divisorDigits.map((digit, index) =>
            editOperands ? (
              <button
                type="button"
                key={`divisor-${index}`}
                data-answer-cell
                aria-label={`Dzielnik, cyfra ${index + 1}`}
                disabled={readOnly}
                onClick={() => setActive({ row: "divisor", digitIndex: index })}
                className={answerCellClass(
                  active?.row === "divisor" && active.digitIndex === index,
                )}
              >
                {divisorValues[index]}
              </button>
            ) : (
              <span
                key={`divisor-${index}`}
                data-fixed-cell
                aria-label={`Dzielnik, cyfra ${index + 1}: ${digit}`}
                className={fixedCellClass}
              >
                {digit}
              </span>
            ),
          )}

          {layout.steps.map((step, stepIndex) => {
            if (stepIndex > finalResultStepIndex) return null;
            const nextStep = layout.steps[stepIndex + 1];
            const partialEndColumn = nextStep?.endColumn ?? step.endColumn;
            const final = stepIndex === finalResultStepIndex;
            const skipZeroProduct =
              step.quotientDigit === 0 && step.product === 0;

            return (
              <Fragment key={`step-${stepIndex}`}>
                {!skipZeroProduct ? (
                  <>
                    {renderProductRow(step, stepIndex)}
                    {trailingBlanks(`product-tail-${stepIndex}`)}

                    <span className="h-2 w-10" aria-hidden />
                    {Array.from({ length: layout.columns }, (_, column) => (
                      <span
                        key={`line-${stepIndex}-${column}`}
                        className={`${column >= step.startColumn && column <= step.endColumn ? "border-t-2 border-slate-800" : ""} h-2 w-11 sm:w-12`}
                        aria-hidden
                      />
                    ))}
                    {trailingBlanks(`line-tail-${stepIndex}`)}
                  </>
                ) : null}

                <span className="h-11 w-10 sm:h-12" aria-hidden />
                {renderAnswerRow({
                  values: partialValues[stepIndex]!,
                  endColumn: partialEndColumn,
                  row: "partial",
                  stepIndex,
                  final,
                })}
                {trailingBlanks(`partial-tail-${stepIndex}`)}
              </Fragment>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-sm font-bold text-slate-600">
        Pola pośrednie służą do zapisu kolejnych odejmowań. Oceniany jest
        końcowy iloraz oraz ostatnia reszta.
      </p>

      <div
        className="mx-auto mt-5 grid max-w-sm grid-cols-3 gap-3"
        aria-label="Klawiatura do dzielenia pisemnego"
      >
        {"123456789".split("").map((digit) => (
          <button
            type="button"
            key={digit}
            aria-label={digit}
            disabled={readOnly || !active}
            onClick={() => updateCell(digit)}
            className="min-h-14 rounded-2xl bg-slate-900 text-2xl font-black text-white shadow disabled:opacity-35"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          aria-label="0"
          disabled={readOnly || !active}
          onClick={() => updateCell("0")}
          className="min-h-14 rounded-2xl bg-slate-900 text-2xl font-black text-white shadow disabled:opacity-35"
        >
          0
        </button>
        <button
          type="button"
          aria-label="Usuń cyfrę"
          disabled={readOnly || !active}
          onClick={() => updateCell("←")}
          className="col-span-2 min-h-14 rounded-2xl bg-rose-300 text-lg font-black text-rose-950 disabled:opacity-35"
        >
          ← Usuń cyfrę
        </button>
      </div>

      {resultComplete ? (
        <p
          role="status"
          className={`mt-4 rounded-xl px-3 py-3 text-center font-black ${resultCorrect ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
        >
          {resultCorrect
            ? "Końcowy iloraz i reszta są poprawne."
            : "Końcowy wynik jest niepoprawny — popraw iloraz lub ostatnią resztę."}
        </p>
      ) : null}
      {story ? (
        <div className="mt-4 rounded-2xl bg-cyan-50 p-4 text-lg font-black text-cyan-950">
          <p className="text-xs uppercase tracking-wide text-cyan-800">
            Odpowiedź
          </p>
          <p className="mt-2">
            {story.answerPrefix}
            <span className="inline-block min-w-24 border-b-4 border-cyan-600 px-2 text-center text-2xl">
              {quotientValues.join("") || " "}
            </span>
            {story.answerSuffix}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export function WrittenDivisionGrid({
  dividend,
  divisor,
  readOnly = false,
  onResultChange,
}: {
  dividend: number;
  divisor: number;
  readOnly?: boolean;
  onResultChange?: Props["onResultChange"];
}) {
  const reportResult = useCallback(
    (correct: boolean | null, result?: string) => {
      onResultChange?.(
        correct,
        result ? `${dividend} : ${divisor} = ${result}` : undefined,
      );
    },
    [dividend, divisor, onResultChange],
  );
  const task = useMemo<WrittenDivisionTask>(
    () => ({
      dividend,
      divisor,
      title: "Dzielenie pisemne",
      story: "Uzupełnij działanie liczbami odczytanymi z treści zadania.",
    }),
    [dividend, divisor],
  );

  return (
    <DivisionTower
      task={task}
      taskNumber={1}
      readOnly={readOnly}
      operandsEditable
      hidePrompt
      onResultChange={reportResult}
    />
  );
}

export function WrittenDivisionLessonModel({
  seed = 1,
  taskSeed = 1,
  readOnly = false,
  questionNumber,
  questionCount,
  onResultChange,
}: Props) {
  const storyMode = seed === 3;
  const withRemainder = seed === 2;
  const examples = storyMode
    ? [WRITTEN_DIVISION_STORY]
    : withRemainder
      ? WRITTEN_DIVISION_REMAINDER_EXAMPLES
      : WRITTEN_DIVISION_EXAMPLES;
  const [localIndex, setLocalIndex] = useState(() =>
    clampTaskIndex((Math.abs(taskSeed) - 1) % examples.length, examples.length),
  );
  const taskIndex =
    questionNumber === undefined
      ? localIndex
      : clampTaskIndex(questionNumber - 1, examples.length);
  const task = examples[taskIndex]!;
  const shownCount = questionCount ?? examples.length;

  return (
    <section
      data-seed={seed}
      className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-indigo-700/15 to-violet-700/30" />
      <div className="relative">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[.2em] text-cyan-200">
              LICZBY I DZIAŁANIA · TEMAT 8
            </p>
            <h3 className="mt-1 text-3xl font-black sm:text-5xl">
              {storyMode
                ? "Zadanie tekstowe — dzielenie pisemne"
                : withRemainder
                  ? "Dzielenie pisemne z resztą"
                  : "Dzielenie pisemne bez reszty"}
            </h3>
            <p className="mt-2 max-w-3xl text-slate-200">
              {storyMode
                ? "Odczytaj dane, wpisz dzielną i dzielnik do pustych kratek, a potem wykonaj dzielenie pisemne."
                : "Iloraz zapisuj nad dzielną. Pod spodem odejmuj kolejne iloczyny i sprowadzaj następną cyfrę."}
            </p>
          </div>
          <b className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-2 text-sm text-slate-950">
            Zadanie {taskIndex + 1}/{shownCount}
          </b>
        </header>

        {!storyMode && questionNumber === undefined ? (
          <nav
            aria-label="Zadania dzielenia"
            className="mx-auto mt-5 flex max-w-xl items-center justify-center gap-3"
          >
            <button
              type="button"
              disabled={localIndex === 0}
              onClick={() => setLocalIndex((index) => Math.max(0, index - 1))}
              className="min-h-11 rounded-xl border border-white/25 px-4 font-bold disabled:opacity-35"
            >
              ← Poprzednie
            </button>
            <button
              type="button"
              disabled={localIndex === examples.length - 1}
              onClick={() =>
                setLocalIndex((index) =>
                  Math.min(examples.length - 1, index + 1),
                )
              }
              className="min-h-11 rounded-xl bg-white px-4 font-bold text-slate-950 disabled:opacity-35"
            >
              Następne →
            </button>
          </nav>
        ) : null}

        <div className="mt-6">
          <DivisionTower
            key={`${seed}-${task.dividend}-${task.divisor}`}
            task={task}
            taskNumber={taskIndex + 1}
            readOnly={readOnly}
            operandsEditable={storyMode}
            story={storyMode ? WRITTEN_DIVISION_STORY : undefined}
            onResultChange={onResultChange}
          />
        </div>
      </div>
    </section>
  );
}
