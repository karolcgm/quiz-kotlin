export type PrintViewMode = "student" | "key" | "key-separate";

export interface PrintResourceOption {
  id: string;
  title: string;
  href: string;
}

export interface PrintViewOption {
  id: PrintViewMode;
  href: string;
}
