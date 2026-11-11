// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    resolve: {
      alias: [{ find: /^punycode\/?$/, replacement: "punycode" }],
    },
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
          if (
            log.code === "MODULE_LEVEL_DIRECTIVE" ||
            log.message?.includes("use client")
          ) {
            return;
          }
          defaultHandler(level, log);
        },
      },
    },
  },
  nitro: {
    preset: "node-server",
    alias: {
      "punycode/": "punycode",
    },
    externals: {
      external: ["mongodb"],
    },
    rollupConfig: {
      onwarn(warning: any, warn: any) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" ||
          warning.message?.includes("use client")
        ) {
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
