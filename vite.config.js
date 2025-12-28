import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
export default defineConfig({
    plugins: [react()],
    server: { port: 3000, open: true },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@app": path.resolve(__dirname, "src/app"),
            "@entities": path.resolve(__dirname, "src/entities"),
            "@features": path.resolve(__dirname, "src/features"),
            "@pages": path.resolve(__dirname, "src/pages"),
            "@shared": path.resolve(__dirname, "src/shared"),
            "@widgets": path.resolve(__dirname, "src/widgets"),
        },
    },
});
