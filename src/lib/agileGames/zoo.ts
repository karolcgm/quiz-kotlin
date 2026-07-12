export type ZooTask = { id: number; role: string; title: string; cost: number; visitors: number; blocks?: number[]; crisis?: string };
export const ZOO_TASKS: ZooTask[] = [
  { id: 11, role: "Afrykarium", title: "Nakarm lwy", cost: 7, visitors: 9, crisis: "Lwy słabną; ratunek kosztuje więcej." },
  { id: 12, role: "Afrykarium", title: "Lekarz dla afrykarium", cost: 5, visitors: 6 },
  { id: 21, role: "Akwarium", title: "Zakleić szybę szarą taśmą", cost: 1, visitors: -3, blocks: [22], crisis: "Wyciek akwarium ogranicza budżet." },
  { id: 22, role: "Akwarium", title: "Fachowo wymienić szybę", cost: 4, visitors: 5, blocks: [21] },
  { id: 31, role: "Ptaszarnia", title: "Naprawić odpływy", cost: 3, visitors: 4 },
  { id: 32, role: "Ptaszarnia", title: "Nowa trasa dla rodzin", cost: 6, visitors: 8 },
  { id: 41, role: "Insektarium i media", title: "Kampania o ochronie zwierząt", cost: 4, visitors: 7 },
  { id: 42, role: "Insektarium i media", title: "Tania atrakcja weekendowa", cost: 2, visitors: 2 },
];
export const ZOO_TASK_BY_ID = new Map(ZOO_TASKS.map((task) => [task.id, task]));
