import { describe, expect, test } from "vitest";

import blockedTierJump from "../__fixtures__/broken/blocked-tier-jump.json";
import cycle from "../__fixtures__/broken/cycle.json";
import diagonalRequires from "../__fixtures__/broken/diagonal-requires.json";
import fifthColumn from "../__fixtures__/broken/fifth-column.json";
import foreignRequires from "../__fixtures__/broken/foreign-requires.json";
import missingRequires from "../__fixtures__/broken/missing-requires.json";
import twoChildren from "../__fixtures__/broken/two-children.json";
import demo from "../__fixtures__/classes/demo.json";
import scout from "../__fixtures__/classes/scout.json";
import emptyTree from "../__fixtures__/edge/empty-tree.json";
import limits from "../__fixtures__/edge/limits.json";
import rowGap from "../__fixtures__/edge/row-gap.json";
import singleTalent from "../__fixtures__/edge/single-talent.json";
import sparseRow from "../__fixtures__/edge/sparse-row.json";
import unreachable from "../__fixtures__/edge/unreachable.json";
import { structureErrors } from "../src/structure";

const legal = { demo, scout, emptyTree, limits, rowGap, singleTalent, sparseRow, unreachable };

describe("законные классы", () => {
  for (const [name, klass] of Object.entries(legal)) {
    test(`${name} проходит проверку без поломок`, () => {
      expect(structureErrors(klass)).toEqual([]);
    });
  }
});

const joined = (klass: unknown) => structureErrors(klass).join("\n");

describe("битые классы", () => {
  test("цикл называет каждый свой талант", () => {
    expect(joined(cycle)).toContain("Первый");
    expect(joined(cycle)).toContain("Второй");
  });

  test("занятая клетка на пути связи через ряд называет того, кто в ней стоит", () => {
    expect(joined(blockedTierJump)).toContain("Ствол");
  });

  test("связь наискось называет зависимый талант", () => {
    expect(joined(diagonalRequires)).toContain("Снос");
  });

  test("пятая колонка называет число из данных", () => {
    expect(joined(fifthColumn)).toContain("5");
  });

  test("опора из чужого дерева называет зависимый талант", () => {
    expect(joined(foreignRequires)).toContain("Подвес");
  });

  test("пропавшая опора называется идентификатором", () => {
    expect(joined(missingRequires)).toContain("ghost");
  });

  test("опора на двоих называет саму опору", () => {
    expect(joined(twoChildren)).toContain("Корень");
  });

  test("седьмое дерево выходит за потолок формата", () => {
    const wide = {
      ...singleTalent,
      trees: Array.from({ length: 7 }, (_, index) => ({
        id: `tree${index}`,
        name: `Ветвь ${index + 1}`,
        talents: [],
      })),
    };
    expect(joined(wide)).toContain("7");
  });

  test("не объект вместо класса тоже даёт поломку", () => {
    expect(structureErrors(null)).not.toHaveLength(0);
    expect(structureErrors({ name: "Пусто" })).not.toHaveLength(0);
  });
});
