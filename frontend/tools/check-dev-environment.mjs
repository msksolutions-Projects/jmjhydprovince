/* global console */
import { arch, version, execPath, env } from "node:process";
import { totalmem, freemem } from "node:os";
import { getHeapStatistics } from "node:v8";

const toMb = (bytes) => `${Math.round(bytes / 1024 / 1024)} MB`;

console.log("JMJ frontend environment check");
console.log(`Node.js: ${version} (${arch})`);
console.log(`Node executable: ${execPath}`);
console.log(`V8 heap limit: ${toMb(getHeapStatistics().heap_size_limit)}`);
console.log(`Physical memory: ${toMb(totalmem())} total; ${toMb(freemem())} free`);
console.log(`NODE_OPTIONS: ${env.NODE_OPTIONS || "not set"}`);

const major = Number.parseInt(version.slice(1), 10);
if (arch !== "x64" && arch !== "arm64") {
  console.warn("WARNING: Install a 64-bit version of Node.js; this architecture may limit available memory.");
}
if (major < 20 || major >= 25) {
  console.warn("WARNING: This project supports Node.js versions 20 through 24.");
}
if (getHeapStatistics().heap_size_limit < 512 * 1024 * 1024) {
  console.warn("WARNING: Node.js has a very low heap limit. The updated npm run dev command overrides it for Vite.");
}
if (freemem() < 512 * 1024 * 1024) {
  console.warn("WARNING: Very little physical memory is free. Close large programs before starting Vite.");
}
