import { defineConfig } from "vite"

export default defineConfig({
  base: "/onset-tester/",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
        article: "article.html"
      }
    }
  }
})
