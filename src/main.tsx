import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import "@/index.css";
import App from "@/App";
import "katex/dist/katex.min.css";

// Google AnalyticsのトラッキングIDを環境変数から取得して初期化
const trackingId = import.meta.env.VITE_GA_TRACKING_ID;
if (trackingId) {
  ReactGA.initialize(trackingId);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
