const LOW_SCORE_MESSAGES = [
  "Każdy krok naprzód się liczy — następnym razem pójdzie jeszcze lepiej!",
  "Uczysz się przez próbowanie — to normalna droga do sukcesu.",
  "Warto wrócić do trudniejszych zadań spokojnie, krok po kroku.",
  "Masz w sobie potencjał — ćwiczenie na pewno pomoże!",
  "Dobra robota, że dokończyłeś test — to już duży sukces.",
  "Każdy mistrz kiedyś zaczynał od pierwszego kroku.",
];

const MID_SCORE_MESSAGES = [
  "Solidna robota — widać, że rozumiesz sporo z materiału!",
  "Jesteś na dobrej drodze — jeszcze chwila i będzie świetnie.",
  "Fajny wynik — warto utrwalić to, co już umiesz.",
  "Rośniesz w oczach — kontynuuj w tym tempie!",
];

const HIGH_SCORE_MESSAGES = [
  "Fantastyczna robota — gratulacje!",
  "Świetnie Ci poszło — jesteś na wysokim poziomie!",
  "Brawo! Ten wynik zasługuje na oklaski.",
  "Imponująco — tak trzymaj!",
];

export function gradeEmoji(mark1To6: number, percentage: number): string {
  if (mark1To6 >= 6 || percentage >= 96) return "🌟";
  if (mark1To6 >= 5 || percentage >= 86) return "🎉";
  if (mark1To6 >= 4 || percentage >= 70) return "⭐";
  if (mark1To6 >= 3 || percentage >= 50) return "👍";
  if (mark1To6 >= 2 || percentage >= 30) return "💡";
  return "🌱";
}

export function gradeEmojiLabel(mark1To6: number, percentage: number): string {
  if (mark1To6 >= 6 || percentage >= 96) return "Mistrzowski wynik";
  if (mark1To6 >= 5 || percentage >= 86) return "Bardzo dobrze";
  if (mark1To6 >= 4 || percentage >= 70) return "Dobra robota";
  if (mark1To6 >= 3 || percentage >= 50) return "Jesteś na dobrej drodze";
  return "Uczysz się i rośniesz";
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function resultCelebrationMessage(percentage: number): string {
  if (percentage >= 85) {
    return pickRandom(HIGH_SCORE_MESSAGES);
  }
  if (percentage >= 50) {
    return pickRandom(MID_SCORE_MESSAGES);
  }
  return pickRandom(LOW_SCORE_MESSAGES);
}

export function shouldShowConfetti(percentage: number): boolean {
  return percentage >= 85;
}
