import { describe, expect, test } from "vitest";

import demo from "../__fixtures__/classes/demo.json";
import { budgetLeft, canApply, spentInTree, talentState } from "../src/rules";
import type { Build, TalentClass } from "../src/types";

const klass: TalentClass = demo;
const invest = (talentId: string) => ({ talentId, delta: 1 });
const withdraw = (talentId: string) => ({ talentId, delta: -1 });

const reasonOf = (build: Build, change: { talentId: string; delta: number }) => {
  const verdict = canApply(klass, build, change);
  return verdict.ok ? "" : verdict.reason;
};

describe("правило максимального ранга", () => {
  test("ранг не перерастает maxRank", () => {
    expect(canApply(klass, { ignite: 4 }, invest("ignite")).ok).toBe(true);
    expect(canApply(klass, { ignite: 5 }, invest("ignite")).ok).toBe(false);
    expect(reasonOf({ ignite: 5 }, invest("ignite"))).toContain("Возгорание");
  });
});

describe("правило порога ряда", () => {
  test("второй ряд закрыт, пока в дереве меньше пяти очков", () => {
    expect(canApply(klass, { ignite: 3 }, invest("fireball")).ok).toBe(false);
    expect(reasonOf({ ignite: 3 }, invest("fireball"))).toContain("Огненный шар");
  });

  test("пятое очко дерева открывает второй ряд", () => {
    expect(canApply(klass, { ignite: 5 }, invest("fireball")).ok).toBe(true);
  });
});

describe("правило опоры", () => {
  test("талант с requires ждёт опору на максимальном ранге", () => {
    expect(canApply(klass, { ignite: 4 }, invest("embers")).ok).toBe(false);
    expect(reasonOf({ ignite: 4 }, invest("embers"))).toContain("Возгорание");
    expect(canApply(klass, { ignite: 5 }, invest("embers")).ok).toBe(true);
  });

  test("опору нельзя снять, пока на ней держится зависимый талант", () => {
    const build = { ignite: 5, embers: 1 };
    expect(canApply(klass, build, withdraw("ignite")).ok).toBe(false);
    expect(reasonOf(build, withdraw("ignite"))).toContain("Тлеющие угли");
  });
});

describe("правило бюджета", () => {
  test("сумма рангов не перерастает бюджет класса", () => {
    const full = { ignite: 5, kindling: 2, fireball: 3, heat: 5, iceskin: 5, rime: 3, focus: 2 };
    expect(budgetLeft(klass, full)).toBe(0);
    // «Обереги» стоят в первом ряду без опоры, мешает им только бюджет.
    expect(canApply(klass, full, invest("wards")).ok).toBe(false);
    expect(reasonOf(full, invest("wards"))).toContain(String(klass.budget));
    expect(canApply(klass, { ...full, focus: 1 }, invest("wards")).ok).toBe(true);
  });
});

describe("снятие очка", () => {
  // Порог считает всё дерево вместе с очками самого ряда: пять очков в дереве
  // держат второй ряд, четыре уже нет.
  test("снятие идёт, пока опоры хватает, и отказывает, когда перестаёт", () => {
    expect(canApply(klass, { ignite: 5, fireball: 1 }, withdraw("ignite")).ok).toBe(true);
    expect(canApply(klass, { ignite: 4, fireball: 1 }, withdraw("ignite")).ok).toBe(false);
    expect(reasonOf({ ignite: 4, fireball: 1 }, withdraw("ignite"))).toContain("Огненный шар");
  });

  test("из таланта без очков снимать нечего", () => {
    expect(canApply(klass, {}, withdraw("ignite")).ok).toBe(false);
  });
});

describe("счётные функции", () => {
  test("вложенное в дерево и состояние узла считаются из билда", () => {
    const [fire] = klass.trees;
    const build = { ignite: 5 };
    const talent = (id: string) => fire.talents.find((item) => item.id === id)!;

    expect(spentInTree(fire, build)).toBe(5);
    expect(talentState(klass, build, talent("ignite"))).toBe("maxed");
    expect(talentState(klass, build, talent("embers"))).toBe("available");
    expect(talentState(klass, {}, talent("embers"))).toBe("locked");
    expect(talentState(klass, {}, talent("fireball"))).toBe("locked");
  });
});
