import { createRoot } from "react-dom/client";

import demo from "../__fixtures__/classes/demo.json";
import init from "./init";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(init(demo));
}
