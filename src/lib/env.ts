import fs from "node:fs";
import path from "node:path";

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
    const proc = process as unknown as { loadEnvFile?: () => void };
    if (typeof proc.loadEnvFile === "function") {
      proc.loadEnvFile();
      return;
    }
  } catch {
    // Continue
  }

  // 2. Fallback: Read and parse .env manually
  try {
    if (typeof process !== "undefined" && typeof process.cwd === "function") {
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
  } catch (err) {
    console.warn(
      "[Env] Optional .env reader notice:",
      err instanceof Error ? err.message : String(err),
    );
  }
}

// Automatically invoke on module load
loadServerEnv();
