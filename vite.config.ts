// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { sanitizeChunkCode } from "./scripts/sanitize-chunks";

export default defineConfig({
  vite: {
    resolve: {
      alias: [{ find: /^punycode\/?$/, replacement: "punycode" }],
    },
    plugins: [
      {
        name: "fix-rolldown-preload-hash",
        apply: "build",
        async closeBundle() {
          const ts = await import("typescript");
          const publicDirs = [
            path.resolve(process.cwd(), ".output/public/assets"),
            path.resolve(process.cwd(), ".vercel/output/static/assets"),
          ];
          for (const assetsDir of publicDirs) {
            if (!fs.existsSync(assetsDir)) continue;
            const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
            for (const file of files) {
              const filePath = path.join(assetsDir, file);
              const code = fs.readFileSync(filePath, "utf-8");
              const { code: sanitized, repaired, repairs } = sanitizeChunkCode(code);
              const finalCode = repaired ? sanitized : code;
              if (repaired) {
                fs.writeFileSync(filePath, sanitized, "utf-8");
                console.log(`🩹 [vite:closeBundle] Fixed ${repairs.join(",")} in ${file}`);
              }
              // Fail the build rather than ship a chunk that cannot parse.
              const out = ts.transpileModule(finalCode, {
                reportDiagnostics: true,
                compilerOptions: {
                  allowJs: true,
                  target: ts.ScriptTarget.ESNext,
                  module: ts.ModuleKind.ESNext,
                },
              });
              const syntaxErrors = (out.diagnostics ?? []).filter(
                (d) =>
                  d.category === ts.DiagnosticCategory.Error && d.code >= 1000 && d.code < 2000,
              );
              if (syntaxErrors.length > 0) {
                const first = syntaxErrors
                  .slice(0, 3)
                  .map((d) => ts.flattenDiagnosticMessageText(d.messageText, " "))
                  .join("; ");
                throw new Error(
                  `[vite:closeBundle] Refusing to ship corrupt chunk ${file}: ${first}`,
                );
              }
            }
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        onwarn(warning: any, defaultHandler: any) {
          if (
            warning.code === "MODULE_LEVEL_DIRECTIVE" ||
            warning.message?.includes("use client")
          ) {
            return;
          }
          defaultHandler(warning);
        },
        onLog(level: any, log: any, defaultHandler: any) {
          if (log.code === "MODULE_LEVEL_DIRECTIVE" || log.message?.includes("use client")) {
            return;
          }
          defaultHandler(level, log);
        },
      },
    },
  },
  nitro: {
    preset: process.env.NITRO_PRESET || (process.env.VERCEL ? "vercel" : "node-server"),
    alias: {
      "punycode/": "punycode",
    },
    externals: {
      external: ["mongodb"],
    },
    rollupConfig: {
      onwarn(warning: any, warn: any) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.message?.includes("use client")) {
          return;
        }
        warn(warning);
      },
    },
    prerender: {
      routes: ["/"],
      crawlLinks: true,
    },
  } as any,
  tanstackStart: {
    // Redirect TanStack Start entries to src/client.tsx and src/server.ts
    client: { entry: "client" },
    server: { entry: "server" },
  },
});
