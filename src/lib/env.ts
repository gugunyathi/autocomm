/**
 * AutoCom Server Environment Loader
 * Safely loads environment variables from .env into process.env across
 * Node.js, Vite SSR, and Nitro runtime environments.
 */

let isLoaded = false;

export function loadServerEnv(): void {
  if (isLoaded) return;
  isLoaded = true;

  // 1. Try Node.js 20.6+ native loadEnvFile
  try {
    if (typeof process !== "undefined" && typeof (process as any).loadEnvFile === "function") {
      (process as any).loadEnvFile();
      return;
    }
  } catch {
    // Continue
  }

  // 2. Fallback: Read and parse .env manually
  try {
    if (typeof process !== "undefined" && typeof process.cwd === "function") {
      let fs: any = null;
      let path: any = null;
      try {
        const req = typeof require !== "undefined" ? require : null;
        if (req) {
          fs = req("node:fs") || req("fs");
          path = req("node:path") || req("path");
        }
      } catch {
        fs = null;
        path = null;
      }

      if (fs && path) {
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const fileContent = fs.readFileSync(envPath, "utf-8");
          for (const line of fileContent.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const equalIndex = trimmed.indexOf("=");
            if (equalIndex <= 0) continue;

            const key = trimmed.slice(0, equalIndex).trim();
            let value = trimmed.slice(equalIndex + 1).trim();

            if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              value = value.slice(1, -1);
            }

            if (!process.env[key] || process.env[key] === "") {
              process.env[key] = value;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Env] Optional .env reader notice:", err instanceof Error ? err.message : String(err));
  }
}

// Automatically invoke on module load
loadServerEnv();
