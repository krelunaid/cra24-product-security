import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const target = fileURLToPath(new URL("../dist", import.meta.url));
if (!target.endsWith("/dist")) throw new Error("Refusing to clean an unexpected build directory");
await rm(target, { recursive: true, force: true });
