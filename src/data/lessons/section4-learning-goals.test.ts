import { describe, expect, it } from "vitest";
import { section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";

const goalsForTopic = (topicId: string) => section4LessonsWpC4
  .filter((lesson) => lesson.topicId === topicId)
  .flatMap((lesson) => lesson.learningGoals)
  .map((goal) => `${goal.studentGoal} ${goal.successCriteria.join(" ")}`)
  .join(" ");

describe("cele działu 4 — Figury na płaszczyźnie", () => {
  it("każda lekcja ma kompletne, unikalne cele zapisane językiem ucznia", () => {
    for (const lesson of section4LessonsWpC4) {
      expect(lesson.learningGoals.length, lesson.id).toBeGreaterThan(0);
      expect(new Set(lesson.learningGoals.map((goal) => goal.id)).size, lesson.id)
        .toBe(lesson.learningGoals.length);

      for (const goal of lesson.learningGoals) {
        expect(goal.studentGoal, `${lesson.id}:${goal.id}`).toMatch(/^Nauczę się/);
        expect(goal.successCriteria.length, `${lesson.id}:${goal.id}`).toBeGreaterThan(0);
        expect(goal.curriculumReferences.length, `${lesson.id}:${goal.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("obejmuje rzeczywisty zakres każdego tematu", () => {
    const expectedCoverage: Record<string, RegExp[]> = {
      "M5-4.1": [/punkt|półprost|odcinek/u, /równoleg/u, /prostopad/u, /odległoś/u],
      "M5-4.2": [/wierzchoł/u, /zerowy/u, /greck/u, /na figurze/u],
      "M5-4.3": [/ustawiać kątomierz/u, /mierzyć kąty/u, /rysować kąt/u, /skal/u],
      "M5-4.4": [/przyleg/u, /wierzchołkow/u, /180°/u],
      "M5-4.5": [/rozpoznawać i nazywać wielokąty/u, /elementy wielokąta/u, /obwód wielokąta/u],
      "M5-4.6": [/według długości boków/u, /według miar kątów/u, /obie klasyfikacje/u, /obwód trójkąta/u],
      "M5-4.7": [/czy z trzech odcinków/u, /konstruować trójkąt/u, /kroki konstrukcji/u],
      "M5-4.8": [/sumy 180°/u, /brakujący kąt/u, /równoramiennego/u, /równobocznego/u],
      "M5-4.9": [/prostokąt/u, /przekątne/u, /obwód lub brakujący bok/u],
      "M5-4.10": [/równoległobok/u, /romby/u, /pozostałe kąty/u, /obwód lub brakujący bok/u],
      "M5-4.11": [/podstawy i ramiona/u, /równoramienny i prostokątny/u, /180°/u, /obwód lub brakujący bok/u],
      "M5-4.12": [/trapez, równoległobok, prostokąt, romb i kwadrat/u, /mapie rodzin/u, /przekątn/u],
      "M5-4.13": [/figura osiowosymetryczna/u, /wszystkie osie symetrii/u, /ile osi symetrii/u],
    };

    for (const [topicId, patterns] of Object.entries(expectedCoverage)) {
      const goals = goalsForTopic(topicId);
      for (const pattern of patterns) {
        expect(goals, `${topicId}: ${pattern}`).toMatch(pattern);
      }
    }
  });

  it("nie przywraca usuniętych lub mylących wymagań", () => {
    const allGoals = section4LessonsWpC4
      .flatMap((lesson) => lesson.learningGoals)
      .map((goal) => `${goal.studentGoal} ${goal.successCriteria.join(" ")}`)
      .join(" ");

    expect(allGoals).not.toMatch(/kąty odpowiadające|naprzemianległe/u);
    expect(allGoals).not.toMatch(/przykład i kontrprzykład/u);
    expect(allGoals).not.toMatch(/uzupełniać wzór względem osi/u);
    expect(allGoals).not.toMatch(/kwadrat kąta prostego|jednakowe groty/u);
    expect(allGoals).not.toMatch(/naprawić błędne uzasadnienie/u);
  });
});
