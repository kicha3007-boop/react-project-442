// Проверка структуры класса до отрисовки. Принимает что угодно и отдаёт
// список поломок словами; пустой список значит, что класс законный.
import { MAX_COLUMNS, MAX_ROWS, MAX_TREES } from "./limits";
import type { TalentClass, Talent } from "./types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

const isText = (value: unknown): value is string => typeof value === "string" && value !== "";

// Форма данных: поля на месте и нужных типов.
const shapeErrors = (klass: unknown): string[] => {
  if (!isObject(klass)) {
    return ["Класс должен быть объектом"];
  }
  const errors: string[] = [];
  for (const field of ["budget", "pointsPerRow"] as const) {
    if (!isCount(klass[field])) {
      errors.push(`Поле ${field} должно быть целым неотрицательным числом`);
    }
  }
  if (!isCount(klass.columns) || klass.columns === 0) {
    errors.push("Поле columns должно быть целым положительным числом");
  }
  if (!Array.isArray(klass.trees)) {
    errors.push("Поле trees должно быть списком деревьев");
    return errors;
  }
  klass.trees.forEach((tree: unknown, treeIndex) => {
    if (!isObject(tree) || !isText(tree.id) || !isText(tree.name)) {
      errors.push(`Дереву №${treeIndex + 1} нужны строковые id и name`);
      return;
    }
    if (!Array.isArray(tree.talents)) {
      errors.push(`У дерева «${tree.name}» поле talents должно быть списком`);
      return;
    }
    tree.talents.forEach((talent: unknown, talentIndex) => {
      const label =
        isObject(talent) && isText(talent.name) ? `«${talent.name}»` : `№${talentIndex + 1}`;
      const valid =
        isObject(talent) &&
        isText(talent.id) &&
        isText(talent.name) &&
        typeof talent.text === "string" &&
        isCount(talent.row) &&
        isCount(talent.col) &&
        isCount(talent.maxRank) &&
        talent.maxRank > 0 &&
        (talent.requires === undefined || isText(talent.requires));
      if (!valid) {
        errors.push(
          `Талант ${label} дерева «${tree.name}» записан с ошибкой: нужны id, name, text, целые row и col от нуля и maxRank от единицы`,
        );
      }
    });
  });
  return errors;
};

// Потолки формата: число из данных называется в тексте поломки.
const limitErrors = (klass: TalentClass): string[] => {
  const errors: string[] = [];
  if (klass.trees.length > MAX_TREES) {
    errors.push(`Деревьев в классе ${klass.trees.length}, а формат держит не больше ${MAX_TREES}`);
  }
  if (klass.columns > MAX_COLUMNS) {
    errors.push(`Колонок в классе ${klass.columns}, а формат держит не больше ${MAX_COLUMNS}`);
  }
  for (const tree of klass.trees) {
    const occupied = new Map<string, Talent>();
    for (const talent of tree.talents) {
      if (talent.row + 1 > MAX_ROWS) {
        errors.push(
          `«${talent.name}» стоит в ряду ${talent.row + 1}, а формат держит не больше ${MAX_ROWS} рядов`,
        );
      }
      if (talent.col >= klass.columns) {
        errors.push(
          `«${talent.name}» стоит в колонке ${talent.col + 1}, а колонок в классе ${klass.columns}`,
        );
      }
      const cell = `${talent.row}:${talent.col}`;
      const neighbour = occupied.get(cell);
      if (neighbour) {
        errors.push(`«${talent.name}» и «${neighbour.name}» занимают одну клетку`);
      } else {
        occupied.set(cell, talent);
      }
    }
  }
  return errors;
};

// Уникальность идентификаторов деревьев и талантов.
const idErrors = (klass: TalentClass): string[] => {
  const errors: string[] = [];
  const treeIds = new Set<string>();
  const talentIds = new Set<string>();
  for (const tree of klass.trees) {
    if (treeIds.has(tree.id)) {
      errors.push(`Идентификатор дерева «${tree.id}» повторяется`);
    }
    treeIds.add(tree.id);
    for (const talent of tree.talents) {
      if (talentIds.has(talent.id)) {
        errors.push(`Идентификатор таланта «${talent.id}» повторяется`);
      }
      talentIds.add(talent.id);
    }
  }
  return errors;
};

// Связность: опора существует, лежит в том же дереве, открывает одного,
// связь прямая и короткая, клетка на пути прыжка через ряд пустая, циклов нет.
const linkErrors = (klass: TalentClass): string[] => {
  const errors: string[] = [];
  const all = klass.trees.flatMap((tree) => tree.talents.map((talent) => ({ talent, tree })));
  const byId = new Map(all.map((entry) => [entry.talent.id, entry]));
  const children = new Map<string, Talent[]>();

  for (const { talent, tree } of all) {
    if (!talent.requires) {
      continue;
    }
    const base = byId.get(talent.requires);
    if (!base) {
      errors.push(`«${talent.name}» требует «${talent.requires}», а такого таланта в классе нет`);
      continue;
    }
    children.set(base.talent.id, [...(children.get(base.talent.id) ?? []), talent]);
    if (base.tree.id !== tree.id) {
      errors.push(
        `«${talent.name}» требует «${base.talent.name}» из чужого дерева «${base.tree.name}»`,
      );
      continue;
    }
    if (base.talent.id === talent.id) {
      continue;
    }
    const rowStep = talent.row - base.talent.row;
    const colStep = talent.col - base.talent.col;
    const sideways = rowStep === 0 && Math.abs(colStep) === 1;
    const down = colStep === 0 && (rowStep === 1 || rowStep === 2);
    if (!sideways && !down) {
      errors.push(
        `«${talent.name}» связан с «${base.talent.name}» не по прямой: связь идёт по ряду в соседнюю колонку или вниз по колонке на ряд или через ряд`,
      );
      continue;
    }
    if (down && rowStep === 2) {
      const blocker = tree.talents.find(
        (other) => other.row === base.talent.row + 1 && other.col === talent.col,
      );
      if (blocker) {
        errors.push(
          `«${blocker.name}» стоит на пути связи от «${base.talent.name}» к «${talent.name}»`,
        );
      }
    }
  }

  for (const [baseId, list] of children) {
    if (list.length > 1) {
      const base = byId.get(baseId);
      const names = list.map((child) => `«${child.name}»`).join(", ");
      errors.push(`«${base?.talent.name}» открывает сразу несколько талантов: ${names}`);
    }
  }

  // Цикл: идём по цепочке опор, пока не упрёмся в начало цепочки или в конец.
  const reported = new Set<string>();
  for (const { talent } of all) {
    const chain: Talent[] = [];
    let current: Talent | undefined = talent;
    while (current && !chain.includes(current)) {
      chain.push(current);
      current = current.requires ? byId.get(current.requires)?.talent : undefined;
    }
    if (current === talent && !reported.has(talent.id)) {
      chain.forEach((link) => reported.add(link.id));
      const names = chain.map((link) => `«${link.name}»`).join(", ");
      errors.push(`Опоры замыкаются в круг: ${names}`);
    }
  }

  return errors;
};

export const structureErrors = (klass: unknown): string[] => {
  const shape = shapeErrors(klass);
  if (shape.length > 0) {
    return shape;
  }
  const valid = klass as TalentClass;
  return [...limitErrors(valid), ...idErrors(valid), ...linkErrors(valid)];
};
