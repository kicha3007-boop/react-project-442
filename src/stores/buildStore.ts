// Стор текущего билда. Заводится фабрикой на каждый запуск приложения,
// поэтому два калькулятора на одной странице не делят билд.
// В хранилище браузера он не попадает: текущий билд — черновик.
import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";

import type { Build } from "../types";

interface BuildState {
  build: Build;
  setBuild: (build: Build) => void;
  reset: () => void;
}

export const createBuildStore = () =>
  createStore<BuildState>()((set) => ({
    build: {},
    setBuild: (build) => set({ build }),
    reset: () => set({ build: {} }),
  }));

export type BuildStore = ReturnType<typeof createBuildStore>;

export const BuildStoreContext = createContext<BuildStore | null>(null);

export const useBuildStoreApi = (): BuildStore => {
  const store = useContext(BuildStoreContext);
  if (!store) {
    throw new Error("BuildStoreContext не задан");
  }
  return store;
};

export const useBuildStore = <T>(selector: (state: BuildState) => T): T =>
  useStore(useBuildStoreApi(), selector);
