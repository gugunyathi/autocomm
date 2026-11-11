import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const ROUTES = ["/", "/developer", "/leaderboard", "/mesh", "/names", "/owners"];

async function getFetchHandler() {
  const nodeServerPath = path.resolve(rootDir, ".output/server/index.mjs");
  const vercelServerPath = path.resolve(
    rootDir,
    ".vercel/output/functions/__server.func/index.mjs",
  );

  if (fs.existsSync(nodeServerPath)) {
    const mod = await import(`file://${nodeServerPath.replace(/\\/g, "/")}`);
    if (globalThis.__nitro__?.default?.fetch) {
      return globalThis.__nitro__.default.fetch;
    }
    if (mod.default?.fetch) {
      return mod.default.fetch;
    }
  }

  if (fs.existsSync(vercelServerPath)) {
    const mod = await import(`file://${vercelServerPath.replace(/\\/g, "/")}`);
    if (mod.default?.fetch) {
      return mod.default.fetch;
    }
    if (globalThis.__nitro__?.default?.fetch) {
      return globalThis.__nitro__.default.fetch;
    }
  }

  throw new Error("Could not find server entry in .output/server or .vercel/output/functions");
}

async function generate() {
  console.log("⚡ Generating static HTML files for SPA and CDN fallbacks...");
  const fetchHandler = await getFetchHandler();

  const publicDirs = [
    path.resolve(rootDir, ".output/public"),
    path.resolve(rootDir, ".vercel/output/static"),
  ].filter((d) => fs.existsSync(d));

  if (publicDirs.length === 0) {
    console.warn("⚠️ No public output directory found (.output/public or .vercel/output/static).");
    return;
  }

  for (const route of ROUTES) {
    try {
      const response = await fetchHandler(new Request(`http://localhost${route}`));
      if (!response.ok) {
        console.error(`❌ Route ${route} returned status ${response.status}`);
        continue;
      }
      const html = await response.text();

      for (const pubDir of publicDirs) {
        let targetFilePath;
        if (route === "/") {
          targetFilePath = path.join(pubDir, "index.html");
        } else {
          const subDir = path.join(pubDir, route.replace(/^\//, ""));
          fs.mkdirSync(subDir, { recursive: true });
          targetFilePath = path.join(subDir, "index.html");
        }

        fs.writeFileSync(targetFilePath, html, "utf-8");
        console.log(
          `✅ Prerendered ${route} -> ${path.relative(rootDir, targetFilePath)} (${html.length} bytes)`,
        );
      }
    } catch (err) {
      console.error(`❌ Error rendering ${route}:`, err.message);
    }
  }

  // Ensure .htaccess exists in .output/public for Apache / cPanel rewrites
  const htaccessSource = path.resolve(rootDir, "public/.htaccess");
  if (fs.existsSync(htaccessSource)) {
    for (const pubDir of publicDirs) {
      const dest = path.join(pubDir, ".htaccess");
      fs.copyFileSync(htaccessSource, dest);
      console.log(`📋 Copied .htaccess -> ${path.relative(rootDir, dest)}`);
    }
  }

  console.log("🎉 Static HTML generation complete!");
}

generate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal generation error:", err);
    process.exit(1);
  });
