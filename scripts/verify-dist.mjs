import { access, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist", import.meta.url));
const allowed = new Set([".openai", "client", "server"]);

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (allowed.has(entry.name)) continue;
  const path = `${root}/${entry.name}`;
  if (entry.isDirectory() && (await readdir(path)).length === 0) {
    await rm(path, { recursive: true, force: true });
    continue;
  }
  throw new Error(`Unexpected build output: ${entry.name}`);
}

await Promise.all([
  access(`${root}/server/index.js`),
  access(`${root}/client`),
  access(`${root}/.openai/hosting.json`),
]);
