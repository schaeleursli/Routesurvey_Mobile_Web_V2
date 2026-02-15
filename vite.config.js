import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['fabric'],
  },
  server: {
    proxy: {
      "/Uploads": {
        target: "http://localhost:5126",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/Users": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/Token": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/Templates": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/ReportGenerations": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/Reporting": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/Stats": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/Routes": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/PlannedRoutes": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
