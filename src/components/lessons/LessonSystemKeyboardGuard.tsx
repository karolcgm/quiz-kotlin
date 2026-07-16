"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props { children: ReactNode; }

const SELECTOR = 'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="hidden"]), textarea';

function suppress(root: HTMLElement) {
  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(SELECTOR).forEach((field) => {
    if (field.disabled || field.readOnly) return;
    const inputMode = field.getAttribute("inputmode");
    const type = field instanceof HTMLInputElement ? field.type : "text";
    if (inputMode === "text" || type === "text" && !field.hasAttribute("data-lesson-answer")) return;
    field.setAttribute("inputmode", "none");
    field.readOnly = true;
    field.setAttribute("data-system-keyboard-suppressed", "true");
  });
}

export function LessonSystemKeyboardGuard({ children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    suppress(root);
    const observer = new MutationObserver(() => suppress(root));
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "readonly", "inputmode"] });
    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef} data-lesson-surface>{children}</div>;
}
