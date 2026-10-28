// Точка входа: принимает класс и возвращает разметку, DOM сама не трогает.
// Из неё запускается и браузер (src/main.tsx), и автоматическая проверка.
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import "./styles.css";

import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router";

import App from "./components/App";
import StructureErrors from "./components/StructureErrors";
import { BuildStoreContext, createBuildStore } from "./stores/buildStore";
import { structureErrors } from "./structure";
import type { TalentClass } from "./types";
import { theme } from "./theme";

const init = (klass: unknown) => {
  const errors = structureErrors(klass);
  if (errors.length > 0) {
    return (
      <MantineProvider theme={theme}>
        <StructureErrors errors={errors} />
      </MantineProvider>
    );
  }

  // Стор текущего билда заводится на каждый запуск приложения.
  const store = createBuildStore();

  return (
    <MantineProvider theme={theme}>
      <BuildStoreContext.Provider value={store}>
        <BrowserRouter>
          <App klass={klass as TalentClass} />
        </BrowserRouter>
      </BuildStoreContext.Provider>
    </MantineProvider>
  );
};

export default init;
