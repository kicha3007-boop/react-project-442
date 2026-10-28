# Калькулятор талантов

[![hexlet-check](https://github.com/kicha3007-boop/react-project-442/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kicha3007-boop/react-project-442/actions)
[![check](https://github.com/kicha3007-boop/react-project-442/actions/workflows/ci.yml/badge.svg)](https://github.com/kicha3007-boop/react-project-442/actions/workflows/ci.yml)

Приложение, в котором игрок раскладывает очки по деревьям способностей своего класса,
сохраняет получившиеся билды и делится ими ссылкой. Класс приходит данными, поэтому
новое дерево добавляется правкой JSON без изменения кода.

Учебный проект Хекслета: https://ru.hexlet.io/programs/react
Как это должно работать: https://files.hexlet.app/a/dzlecn

## Стек

- TypeScript, React 19, Vite
- Mantine (интерфейс), Zustand с `persist` и `immer` (состояние), React Router (экраны)
- Vitest (тесты), oxlint и oxfmt (линтер и форматирование)

## Установка и запуск

Нужны Node.js 22 или новее, npm и make.

```bash
git clone https://github.com/kicha3007-boop/react-project-442.git
cd react-project-442
make setup   # npm ci — ставит зависимости
make start   # dev-сервер Vite на http://localhost:5173
```

Остальные команды:

```bash
make test    # тесты правил, проверки структуры и кода билда
make lint    # проверка типов (tsc), oxlint и oxfmt --check
make build   # сборка статического сайта в dist/
make preview # раздать собранный dist/ локально
make format  # отформатировать код
```

## Экраны

| Адрес          | Экран                                                           |
| -------------- | --------------------------------------------------------------- |
| `/`            | калькулятор: левая кнопка мыши вкладывает очко, правая снимает  |
| `/saved`       | сохранённые билды: открыть, переименовать, дублировать, удалить |
| `/build/<код>` | чужой билд только на чтение и кнопка «Взять себе»               |

Код билда — `v1.` и base64url от JSON распределения, например
`v1.eyJpZ25pdGUiOjUsImZpcmViYWxsIjoxfQ` для `{"ignite":5,"fireball":1}`.

## Формат класса

Демонстрационный класс лежит в `__fixtures__/classes/demo.json`, его и запускает `src/main.tsx`.

```json
{
  "name": "Маг",
  "budget": 25,
  "pointsPerRow": 5,
  "columns": 4,
  "trees": [
    {
      "id": "fire",
      "name": "Огонь",
      "talents": [
        { "id": "ignite", "name": "Возгорание", "row": 0, "col": 0, "maxRank": 5, "text": "…" },
        {
          "id": "embers",
          "name": "Тлеющие угли",
          "row": 0,
          "col": 1,
          "maxRank": 3,
          "requires": "ignite",
          "text": "…"
        }
      ]
    }
  ]
}
```

- `budget` — общий запас очков на все деревья;
- `pointsPerRow` — сколько очков в дереве нужно за каждый ряд выше (ряду `row` нужно `pointsPerRow * row`);
- `columns` — ширина сетки, `row` и `col` — место таланта, оба от нуля;
- `requires` — талант, который нужно выкачать до `maxRank`, прежде чем вкладывать в этот.

Потолки формата: не больше 6 деревьев, 7 рядов и 4 колонок. Связь идёт по ряду в соседнюю
колонку или вниз по колонке на ряд или через ряд (клетка между ними пустая), один талант
открывает не больше одного. Битый класс не рисуется: вместо калькулятора выводится список поломок.

## Устройство

- `src/init.tsx` — точка входа: принимает класс и возвращает разметку (её же монтирует проверка Хекслета).
- `src/rules.ts` — правила распределения без React, `canApply(klass, build, { talentId, delta })`.
- `src/structure.ts` — проверка структуры класса, `src/buildCode.ts` — упаковка билда в адрес.
- `src/layout.ts` — размеры клетки и промежутков, по ним же считаются стрелки связей.
- `src/stores/` — стор текущего билда (заводится на каждый запуск) и коллекция сохранённых (`persist`).

## Выкладка

Сайт собирается командой `make setup && make build`, раздаётся каталог `dist/`. Для Render в
`render.yaml` задано правило переписывания всех адресов на `/index.html`, чтобы прямой заход на
`/saved` и `/build/<код>` открывал приложение.
