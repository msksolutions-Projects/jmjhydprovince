import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
// Google Fonts, self-hosted (no third-party request): Playfair Display for headings, Inter for text.
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/playfair-display/index.css";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "@/styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
