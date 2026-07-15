"use client";

import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

interface Props {
  onKey: (key: string) => void;
  disabled?: boolean;
  allowSeparator?: boolean;
  label?: string;
}

export function NumericLessonKeypad({ onKey, disabled = false, allowSeparator = false, label = "Klawiatura ekranowa" }: Props) {
  return <LessonNumericKeypad onKey={onKey} disabled={disabled} allowSeparator={allowSeparator} label={label} />;
}
