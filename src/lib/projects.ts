import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

export function normalizeProjectCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function createProject(name: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    try {
      return await prisma.project.create({
        data: {
          code,
          name: name.trim(),
          appSetting: { create: {} }
        }
      });
    } catch {
      // Retry the extremely unlikely case of a generated project-code collision.
    }
  }

  throw new Error("Could not generate a unique project code.");
}
