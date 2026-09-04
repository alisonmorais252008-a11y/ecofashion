import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ofertas: resolve(__dirname, "ofertas.html"),
        busca: resolve(__dirname, "busca.html"),
        categoria: resolve(__dirname, "categoria.html"),
      },
    },
  },
});
