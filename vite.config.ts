// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    resolve: {
      alias: [{ find: /^punycode\/?$/, replacement: "punycode" }],
    },
    plugins: [
      {
        name: "fix-rolldown-preload-hash",
        apply: "build",
        closeBundle() {
          const publicDirs = [
            path.resolve(process.cwd(), ".output/public/assets"),
            path.resolve(process.cwd(), ".vercel/output/static/assets"),
          ];
          for (const assetsDir of publicDirs) {
            if (fs.existsSync(assetsDir)) {
              const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".js"));
              for (const file of files) {
                const filePath = path.join(assetsDir, file);
                const code = fs.readFileSync(filePath, "utf-8");
                if (code.includes("__vite__mapDeps")) {
                  const sanitized = code.replace(
                    /(__vite__mapDeps\(\[[^\]]*\]\))[0-9a-f]{16,64}/g,
                    "$1",
                  );
                  if (sanitized !== code) {
                    fs.writeFileSync(filePath, sanitized, "utf-8");
                    console.log(`🩹 [vite:closeBundle] Fixed mapDeps in ${file}`);
                  }
                }
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
