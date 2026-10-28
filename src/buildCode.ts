// Код билда для адреса: `v<версия>.` и base64url от JSON распределения.
import { violations } from "./rules";
import type { Build, TalentClass } from "./types";

export const CODE_VERSION = 1;

export type DecodeResult = { ok: true; build: Build } | { ok: false; reason: string };

const toBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const fromBase64Url = (packed: string): string => {
  const base64 = packed.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
};

export const encodeBuild = (build: Build): string =>
  `v${CODE_VERSION}.${toBase64Url(JSON.stringify(build))}`;

// Код приходит из адреса, то есть от кого угодно: проверяется и формат,
// и разобранное распределение целиком по правилам класса.
export const decodeBuild = (code: string, klass: TalentClass): DecodeResult => {
  const match = /^(v\d+)\.(.*)$/.exec(code);
  if (!match) {
    return { ok: false, reason: "Код билда должен начинаться с номера версии вида v1." };
  }
  const [, version, packed] = match;
  if (version !== `v${CODE_VERSION}`) {
    return {
      ok: false,
      reason: `Версия формата ${version} не поддерживается, приложение читает только v${CODE_VERSION}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64Url(packed));
  } catch {
    return { ok: false, reason: "Код билда повреждён и не разбирается" };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, reason: "В коде нет распределения очков" };
  }

  const build: Build = {};
  for (const [talentId, rank] of Object.entries(parsed)) {
    if (typeof rank !== "number" || !Number.isInteger(rank) || rank < 0) {
      return { ok: false, reason: `Ранг таланта «${talentId}» должен быть целым числом от нуля` };
    }
    if (rank > 0) {
      build[talentId] = rank;
    }
  }

  const [problem] = violations(klass, build);
  if (problem) {
    return { ok: false, reason: `Билд нарушает правила: ${problem.reason}` };
  }
  return { ok: true, build };
};
