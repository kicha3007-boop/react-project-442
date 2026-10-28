// Модуль раскладки: размеры клетки и промежутков задают положение узлов,
// и по этим же числам считаются координаты стрелок. В css они уходят
// переменными отсюда, поэтому вёрстка и стрелки не расходятся.
import type { CSSProperties } from "react";

import type { TalentClass, Talent } from "./types";

export const CELL_SIZE = 84;
export const COLUMN_GAP = 16;
export const ROW_GAP = 30;
export const ARROW_SIZE = 6;

// Число рядов одно на весь класс и берётся из данных: самый нижний занятый ряд.
export const rowCount = (klass: TalentClass): number =>
  Math.max(1, ...klass.trees.flatMap((tree) => tree.talents.map((talent) => talent.row + 1)));

export const gridWidth = (columns: number): number =>
  columns * CELL_SIZE + Math.max(0, columns - 1) * COLUMN_GAP;

export const gridHeight = (rows: number): number =>
  rows * CELL_SIZE + Math.max(0, rows - 1) * ROW_GAP;

export const cellLeft = (col: number): number => col * (CELL_SIZE + COLUMN_GAP);

export const cellTop = (row: number): number => row * (CELL_SIZE + ROW_GAP);

// Середина промежутка над рядом row: здесь проходит граница рядов.
export const rowBoundary = (row: number): number => cellTop(row) - ROW_GAP / 2;

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Стрелка идёт от края опоры к краю зависимого таланта, а не от центра к центру.
export const linkSegment = (base: Talent, child: Talent): Segment => {
  const half = CELL_SIZE / 2;
  if (base.row === child.row) {
    const y = cellTop(base.row) + half;
    const toRight = child.col > base.col;
    return {
      x1: cellLeft(base.col) + (toRight ? CELL_SIZE : 0),
      y1: y,
      x2: cellLeft(child.col) + (toRight ? 0 : CELL_SIZE),
      y2: y,
    };
  }
  const x = cellLeft(base.col) + half;
  return { x1: x, y1: cellTop(base.row) + CELL_SIZE, x2: x, y2: cellTop(child.row) };
};

export const gridVars = (columns: number): CSSProperties =>
  ({
    "--cell-size": `${CELL_SIZE}px`,
    "--column-gap": `${COLUMN_GAP}px`,
    "--row-gap": `${ROW_GAP}px`,
    "--columns": columns,
  }) as CSSProperties;
