import React from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import App from "./App";
import { StyledEngineProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";

createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <StyledEngineProvider enableCssLayer>
    <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
    <App />
  </StyledEngineProvider>
  // </React.StrictMode>
);
