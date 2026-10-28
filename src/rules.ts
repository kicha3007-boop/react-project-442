// Правила распределения очков. Модуль чистый: без React, без стора,
// поэтому проверяется тестами без браузера.
import type { Build, Change, TalentClass, Talent, TalentState, Tree, Verdict } from "./types";

type ViolationKind = "unknown" | "rank" | "row" | "requires" | "budget";

export interface Violation {
  kind: ViolationKind;
  talentId: string | null;
  reason: string;
}

export const findTalent = (klass: TalentClass, talentId: string): Talent | undefined =>
  klass.trees.flatMap((tree) => tree.talents).find((talent) => talent.id === talentId);

export const treeOf = (klass: TalentClass, talentId: string): Tree | undefined =>
  klass.trees.find((tree) => tree.talents.some((talent) => talent.id === talentId));

export const rankOf = (build: Build, talentId: string): number => build[talentId] ?? 0;

export const spentInTree = (tree: Tree, build: Build): number =>
  tree.talents.reduce((sum, talent) => sum + rankOf(build, talent.id), 0);

export const totalSpent = (build: Build): number =>
  Object.values(build).reduce((sum, rank) => sum + rank, 0);

export const budgetLeft = (klass: TalentClass, build: Build): number =>
  klass.budget - totalSpent(build);

// Сколько очков в дереве нужно, чтобы вкладывать в ряд с номером row.
export const rowNeeds = (klass: TalentClass, row: number): number => klass.pointsPerRow * row;

// Опора ряда — всё, что вложено в дерево, включая очки самого ряда
// (см. docs/adr «Порог ряда считает всё дерево» в задании).
const supportFor = (tree: Tree, build: Build): number => spentInTree(tree, build);

// Все нарушения правил в билде целиком.
export const violations = (klass: TalentClass, build: Build): Violation[] => {
  const found: Violation[] = [];

  for (const talentId of Object.keys(build)) {
    if (!findTalent(klass, talentId)) {
      found.push({
        kind: "unknown",
        talentId,
        reason: `таланта «${talentId}» в классе нет`,
      });
    }
  }

  for (const tree of klass.trees) {
    const support = supportFor(tree, build);
    for (const talent of tree.talents) {
      const rank = rankOf(build, talent.id);
      if (rank <= 0) {
        continue;
      }
      if (rank > talent.maxRank) {
        found.push({
          kind: "rank",
          talentId: talent.id,
          reason: `у «${talent.name}» максимальный ранг ${talent.maxRank}`,
        });
      }
      const needs = rowNeeds(klass, talent.row);
      if (support < needs) {
        found.push({
          kind: "row",
          talentId: talent.id,
          reason: `«${talent.name}» стоит в ряду ${talent.row + 1} дерева «${tree.name}», ему нужно ${needs} очков в дереве, а вложено ${support}`,
        });
      }
      if (talent.requires) {
        const base = findTalent(klass, talent.requires);
        if (!base || rankOf(build, base.id) < base.maxRank) {
          const baseName = base ? base.name : talent.requires;
          found.push({
            kind: "requires",
            talentId: talent.id,
            reason: `«${talent.name}» требует «${baseName}» на максимальном ранге`,
          });
        }
      }
    }
  }

  const spent = totalSpent(build);
  if (spent > klass.budget) {
    found.push({
      kind: "budget",
      talentId: null,
      reason: `бюджет класса ${klass.budget} очков, а разложено ${spent}`,
    });
  }

  return found;
};

// Изменение примеряется к копии билда; ранг 0 из билда убирается.
export const applyChange = (build: Build, { talentId, delta }: Change): Build => {
  const next = { ...build };
  const rank = rankOf(build, talentId) + delta;
  if (rank === 0) {
    delete next[talentId];
  } else {
    next[talentId] = rank;
  }
  return next;
};

// Одна проверка и на «можно вложить», и на «можно снять»: изменение
// примеряется к копии билда, и по копии ищутся все нарушения сразу.
export const canApply = (klass: TalentClass, build: Build, change: Change): Verdict => {
  const talent = findTalent(klass, change.talentId);
  if (!talent) {
    return { ok: false, reason: `Таланта «${change.talentId}» в классе нет` };
  }
  const prefix =
    change.delta > 0
      ? `Нельзя вложить очко в «${talent.name}»`
      : `Нельзя снять очко с «${talent.name}»`;

  if (rankOf(build, talent.id) + change.delta < 0) {
    return { ok: false, reason: `${prefix}: в нём нет вложенных очков` };
  }

  const found = violations(klass, applyChange(build, change));
  if (found.length === 0) {
    return { ok: true };
  }
  // Сначала нарушения самого таланта, потом остальные: так причина ближе к щелчку.
  const own = found.filter((violation) => violation.talentId === talent.id);
  const [first] = own.length > 0 ? own : found;
  return { ok: false, reason: `${prefix}: ${first.reason}` };
};

// Состояние узла считается той же проверкой, что и щелчок: очко примеряется
// к копии билда. Бюджет в состояние узла не входит.
export const talentState = (klass: TalentClass, build: Build, talent: Talent): TalentState => {
  if (rankOf(build, talent.id) >= talent.maxRank) {
    return "maxed";
  }
  const next = applyChange(build, { talentId: talent.id, delta: 1 });
  const blocked = violations(klass, next).some(
    (violation) => violation.talentId === talent.id && violation.kind !== "budget",
  );
  return blocked ? "locked" : "available";
};
