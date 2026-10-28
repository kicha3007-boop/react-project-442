// Формат класса, который приложение получает данными.

export interface Talent {
  id: string;
  name: string;
  row: number;
  col: number;
  maxRank: number;
  requires?: string;
  text: string;
}

export interface Tree {
  id: string;
  name: string;
  talents: Talent[];
}

export interface TalentClass {
  name: string;
  budget: number;
  pointsPerRow: number;
  columns: number;
  trees: Tree[];
}

// Билд: идентификатор таланта → текущий ранг. Талант без очков в билде отсутствует.
export type Build = Record<string, number>;

export interface Change {
  talentId: string;
  delta: number;
}

export type Verdict = { ok: true } | { ok: false; reason: string };

export type TalentState = "available" | "locked" | "maxed";
