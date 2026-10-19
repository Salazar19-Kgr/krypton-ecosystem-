import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";

// Uso: node scripts/bump.mjs "Qué cambió en esta versión"
const notes = process.argv.slice(2).join(" ").trim() || "Mejoras y correcciones.";
const current = JSON.parse(readFileSync("public/version.json", "utf8"));
const build = Number(current.build) + 1;
const [major, minor] = String(current.version).split(".");
const version = `${major}.${minor}.${build - 1}`;

const apkPath = "public/downloads/krypton-ecosystem.apk";
const hasApk = existsSync(apkPath);
const apk = hasApk ? "/downloads/krypton-ecosystem.apk" : "";
const apkSizeMB = hasApk ? Number((statSync(apkPath).size / 1048576).toFixed(1)) : 0;

writeFileSync("public/version.json", JSON.stringify({ version, build, notes, apk, apkSizeMB }, null, 2) + "\n");
writeFileSync("lib/app/version.ts", `export const APP_VERSION = "${version}";\nexport const APP_BUILD = ${build};\n`);
console.log(`Versión ${version} (build ${build})` + (hasApk ? ` · APK ${apkSizeMB} MB` : " · sin APK todavía"));
