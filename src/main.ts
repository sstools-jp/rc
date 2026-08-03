import { createApp } from "vue";
import { createGtag } from "vue-gtag";
import "@/index.css";
import App from "@/App.vue";
import "katex/dist/katex.min.css";

// Google AnalyticsのトラッキングIDを環境変数から取得して初期化
const trackingId = import.meta.env.VITE_GA_TRACKING_ID;

const app = createApp(App);

if (trackingId) {
  app.use(createGtag({ tagId: trackingId }));
}

app.mount("#root");
