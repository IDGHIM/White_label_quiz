import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["hackathon-quiz-qif7.onrender.com"],
    proxy: {
      "/api": {
        target: "https://hackathon-quiz-backend.onrender.com/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
