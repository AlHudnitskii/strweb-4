import React from "react";
import { createRoot } from "react-dom/client";
import WrappedApp from "./App";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WrappedApp />
  </React.StrictMode>,
);
