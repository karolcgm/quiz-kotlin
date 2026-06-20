"use client";

interface IntegerAnswerInputProps {
  id: string;
  name: string;
  readOnly?: boolean;
  defaultValue?: number | null;
  className?: string;
}

function normalizeIntegerInput(value: string): string {
  if (value === "" || value === "-") {
    return value;
  }

  const match = value.match(/^-?\d+/);
  return match?.[0] ?? "";
}

export function IntegerAnswerInput({
  id,
  name,
  readOnly = false,
  defaultValue = null,
  className,
}: IntegerAnswerInputProps) {
  const initial =
    defaultValue === null || defaultValue === undefined || Number.isNaN(defaultValue)
      ? ""
      : String(defaultValue);

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      defaultValue={initial}
      readOnly={readOnly}
      onChange={(event) => {
        event.target.value = normalizeIntegerInput(event.target.value);
      }}
      className={className}
    />
  );
}
