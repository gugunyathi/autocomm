import * as ftp from "basic-ftp";
import fs from "node:fs";
import path from "node:path";

function parseEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env file not found");
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const config = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // remove inline comments if not inside quotes
    if (!val.startsWith('"') && !val.startsWith("'") && val.includes("#")) {
      val = val.slice(0, val.indexOf("#")).trim();
    }
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    config[key] = val;
  }
  return config;
}

async function deploy() {
  const env = parseEnv();

  const host = env.FTP_HOST || "ftp.autocomm.xyz";
  const user = env.FTP_USER || "autocomm";
  const password = env.FTP_PASSWORD;
  const port = parseInt(env.FTP_PORT || "21", 10);
  const remoteDir = env.FTP_REMOTE_DIR || "/public_html/";
  const secure = env.FTP_SECURE === "true";

  if (!host || !user || !password) {
    throw new Error(
      `Missing FTP credentials in .env. Host: ${host}, User: ${user}, Password: ${password ? "***" : "missing"}`,
    );
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  console.log(`\n📡 Connecting to FTP Server: ${host}:${port} as ${user}...`);
  try {
    await client.access({
      host,
      user,
      password,
      port,
      secure,
    });
    console.log("✅ Successfully authenticated with FTP server.");

    console.log(`📁 Navigating to remote directory: ${remoteDir}`);
    await client.ensureDir(remoteDir);

    const localPublicDir = path.resolve(process.cwd(), ".output/public");
    if (!fs.existsSync(localPublicDir)) {
      throw new Error(`Local build directory not found: ${localPublicDir}`);
    }

    console.log(`🚀 Uploading files from ${localPublicDir} to ${remoteDir}...`);
    await client.uploadFromDir(localPublicDir);

    console.log(`\n🎉 DEPLOYMENT COMPLETE!`);
    console.log(`🌐 Website is published at: https://autocomm.xyz\n`);
  } catch (err) {
    console.error("❌ FTP Deployment failed:", err.message);
    // If connection failed with ftp.autocomm.xyz, try falling back to shared IP
    if (
      host !== "129.232.193.194" &&
      (err.message.includes("ENOTFOUND") ||
        err.message.includes("ETIMEDOUT") ||
        err.message.includes("ECONNREFUSED"))
    ) {
      console.log(`\n🔄 Retrying connection using Shared IP 129.232.193.194...`);
      const fallbackClient = new ftp.Client();
      fallbackClient.ftp.verbose = true;
      try {
        await fallbackClient.access({
          host: "129.232.193.194",
          user,
          password,
          port,
          secure,
        });
        console.log("✅ Connected via Shared IP.");
        await fallbackClient.ensureDir(remoteDir);
        await fallbackClient.uploadFromDir(path.resolve(process.cwd(), ".output/public"));
        console.log(`\n🎉 DEPLOYMENT COMPLETE via Shared IP!`);
        console.log(`🌐 Website is published at: https://autocomm.xyz\n`);
        return;
      } catch (fallbackErr) {
        console.error("❌ Fallback via Shared IP also failed:", fallbackErr.message);
        throw fallbackErr;
      } finally {
        fallbackClient.close();
      }
    }
    throw err;
  } finally {
    client.close();
  }
}

deploy().catch(() => {
  process.exit(1);
});
