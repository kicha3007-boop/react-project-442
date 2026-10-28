// Коллекция сохранённых билдов. Один стор на модуль: хранилище браузера одно,
// и persist навешен только сюда.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { Build } from "../types";

export interface SavedBuild {
  id: string;
  name: string;
  build: Build;
}

interface SavedBuildsState {
  saved: Record<string, SavedBuild>;
  save: (name: string, build: Build) => void;
  rename: (id: string, name: string) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
}

const newId = (): string => crypto.randomUUID();

export const useSavedBuilds = create<SavedBuildsState>()(
  persist(
    immer((set) => ({
      saved: {},
      save: (name, build) =>
        set((state) => {
          const id = newId();
          state.saved[id] = { id, name, build: { ...build } };
        }),
      rename: (id, name) =>
        set((state) => {
          const entry = state.saved[id];
          if (entry) {
            entry.name = name;
          }
        }),
      duplicate: (id) =>
        set((state) => {
          const entry = state.saved[id];
          if (entry) {
            const copyId = newId();
            state.saved[copyId] = {
              id: copyId,
              name: `${entry.name} (копия)`,
              build: { ...entry.build },
            };
          }
        }),
      remove: (id) =>
        set((state) => {
          delete state.saved[id];
        }),
    })),
    {
      name: "talent-calculator-builds",
      partialize: (state) => ({ saved: state.saved }),
    },
  ),
);
