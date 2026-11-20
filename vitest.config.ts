import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Dois "projetos" de teste no mesmo repositório:
// - backend: roda em Node, testa as rotas da API com Supertest (Prisma mockado)
// - frontend: roda em jsdom (navegador simulado), testa os componentes React
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "backend",
          environment: "node",
          include: ["Server/**/*.test.ts"],
          env: { JWT_SECRET: "segredo-de-teste" },
        },
      },
      {
        extends: true,
        test: {
          name: "frontend",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          setupFiles: ["src/test/setup.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["Server/**/*.ts", "src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "src/test/**",
        "Server/__tests__/**",
        "src/main.tsx", // só monta o React na página
        "src/types/**", // só tipos, não tem código executável
        "src/vite-env.d.ts",
        "Server/index.ts", // só sobe o servidor (app.listen)
        "Server/lib/prisma.ts", // só cria o PrismaClient; nos testes ele é mockado
      ],
      // Metas do projeto (README): 75% no backend e 25% no frontend.
      // Se a cobertura ficar abaixo, o comando falha e o CI fica vermelho.
      thresholds: {
        "Server/**": {
          lines: 75,
          statements: 75,
          functions: 75,
          branches: 75,
        },
        "src/**": {
          lines: 25,
          statements: 25,
          functions: 25,
          branches: 25,
        },
      },
    },
  },
});
