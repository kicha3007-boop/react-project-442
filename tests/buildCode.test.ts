import { describe, expect, test } from "vitest";

import demo from "../__fixtures__/classes/demo.json";
import { decodeBuild, encodeBuild } from "../src/buildCode";
import type { TalentClass } from "../src/types";

const klass: TalentClass = demo;

const pack = (value: unknown, version = 1) =>
  `v${version}.${Buffer.from(JSON.stringify(value)).toString("base64url")}`;

describe("код билда", () => {
  test("билд переживает упаковку и разбор", () => {
    const build = { ignite: 5, fireball: 1 };
    const code = encodeBuild(build);

    expect(code).toBe(pack(build));
    expect(decodeBuild(code, klass)).toEqual({ ok: true, build });
  });

  test("пустой билд тоже пакуется", () => {
    expect(decodeBuild(encodeBuild({}), klass)).toEqual({ ok: true, build: {} });
  });

  test("чужая версия формата даёт отказ с номером версии", () => {
    const result = decodeBuild(pack({ ignite: 1 }, 9), klass);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toContain("v9");
  });

  test("код без распределения даёт отказ", () => {
    expect(decodeBuild(pack(null), klass).ok).toBe(false);
    expect(decodeBuild(pack([1, 2]), klass).ok).toBe(false);
    expect(decodeBuild("v1.%%%", klass).ok).toBe(false);
    expect(decodeBuild("мусор", klass).ok).toBe(false);
  });

  test("выдуманный талант называется идентификатором", () => {
    const result = decodeBuild(pack({ ghost: 1 }), klass);
    expect(!result.ok && result.reason).toContain("ghost");
  });

  test("билд сверх бюджета называет бюджет числом", () => {
    const greedy = { ignite: 5, kindling: 2, fireball: 3, heat: 5, iceskin: 5, rime: 3, focus: 5 };
    const result = decodeBuild(pack(greedy), klass);
    expect(!result.ok && result.reason).toContain("25");
  });

  test("разобранный билд проверяется по правилам целиком", () => {
    expect(decodeBuild(pack({ fireball: 1 }), klass).ok).toBe(false);
    expect(decodeBuild(pack({ ignite: 1.5 }), klass).ok).toBe(false);
  });
});
